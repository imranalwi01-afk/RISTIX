import { Effect } from 'effect'
import { ApprovalNotificationJob, queueApprovalNotification } from '../queue/bull-setup'
import { db, legacyDb } from '../config/database'
import { platformSettings, frs9ParamCommonh } from '../db/schema'
import { eq } from 'drizzle-orm'
import { platformEmailTemplates } from '../db/schema/platform.schema'
import { NotificationRepository, type CreateNotificationInput } from '@/repositories/notification.repository'

// Simple SMTP client for Bun
interface SMTPConfig {
    host: string
    port: number
    secure: boolean
    auth?: {
        user: string
        pass: string
    }
}

export async function getSmtpConfig() {
    try {
        const [setting] = await db
            .select()
            .from(platformSettings)
            .where(eq(platformSettings.key, 'smtp'))
            .limit(1)

        const dbConfig = setting ? setting.value as any : {}

        return {
            host: dbConfig.host || process.env.SMTP_HOST || 'localhost',
            port: parseInt(dbConfig.port || process.env.SMTP_PORT || '587'),
            secure: dbConfig.secure !== undefined ? dbConfig.secure : process.env.SMTP_SECURE === 'true',
            auth:
                (dbConfig.user || process.env.SMTP_USER) && (dbConfig.pass || process.env.SMTP_PASS)
                    ? {
                        user: dbConfig.user || process.env.SMTP_USER,
                        pass: dbConfig.pass || process.env.SMTP_PASS,
                    }
                    : undefined,
            from: dbConfig.fromEmail || process.env.SMTP_FROM || 'noreply@ifrs9-app.local',
            fromName: dbConfig.fromName || 'IFRS9 System',
        }
    } catch (e) {
        console.error('Failed to get SMTP config from DB, falling back to ENV:', e)
        return {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth:
                process.env.SMTP_USER && process.env.SMTP_PASS
                    ? {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    }
                    : undefined,
            from: process.env.SMTP_FROM || 'noreply@ifrs9-app.local',
            fromName: 'IFRS9 System',
        }
    }
}

import * as nodemailer from 'nodemailer'

let etherealAccount: nodemailer.TestAccount | null = null;

export async function testSmtpConnection(config: any): Promise<boolean> {
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: parseInt(config.port || '587'),
        secure: config.secure === true,
        auth: config.user && config.pass ? {
            user: config.user,
            pass: config.pass,
        } : undefined,
        family: 4, // Force IPv4 resolution
    });

    try {
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('SMTP test connection failed:', error);
        throw error;
    }
}

async function sendSMTPEmail(to: string, subject: string, text: string, html?: string): Promise<string> {
    const config = await getSmtpConfig();
    const from = config.from;

    try {
        let transporter;
        // In development without real SMTP config, use Ethereal Email!
        if (process.env.NODE_ENV === 'development' && !config.auth?.user) {
            if (!etherealAccount) {
                console.log('Generating Ethereal email test account for preview...');
                etherealAccount = await nodemailer.createTestAccount();
            }
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: etherealAccount.user,
                    pass: etherealAccount.pass,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: config.auth,
                family: 4, // Force IPv4 resolution
            });
        }

        const info = await transporter.sendMail({
            from: `${config.fromName} <${from}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('📧 Email sent successfully via SMTP')

        // Attempt to send WhatsApp notification as well if the user has a phone number
        try {
            const { getDatabase } = await import('../config/database');
            const { users } = await import('../db/schema');
            const tenantId = process.env.TENANT_ID || 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
            const activeDb = getDatabase(tenantId);
            
            const [userRecord] = await activeDb
                .select()
                .from(users)
                .where(eq(users.email, to))
                .limit(1);

            if (userRecord && userRecord.phone) {
                console.log(`📱 Found phone number for ${to}: ${userRecord.phone}. Triggering WhatsApp...`);
                const whatsappText = `*${subject}*\n\n${convertHtmlToWhatsAppMarkdown(html || text)}`;
                sendWhatsAppFonnte(userRecord.phone, whatsappText).catch(e => 
                    console.error('Failed to send WhatsApp in background:', e)
                );
            } else {
                console.log(`📱 No phone number found for ${to}, skipping WhatsApp.`);
            }
        } catch (dbErr) {
            console.error('Failed to lookup user phone for WhatsApp:', dbErr);
        }
        
        // If using Ethereal, print the preview URL directly to terminal
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('\n=====================================================')
            console.log('💌 BUKA LINK INI UNTUK MELIHAT ISI EMAIL (SIMULASI):')
            console.log('🔗 ' + previewUrl)
            console.log('=====================================================\n')
            
            // Simpan ke file agar Antigravity bisa membacanya
            require('fs').writeFileSync('last_email_link.txt', previewUrl);
        }

        return info.messageId || `msg_${Date.now()}`
    } catch (error) {
        console.error('❌ SMTP Error:', error)

        // Fallback: Log email details
        console.log('📧 Email Details (fallback):', {
            from,
            to,
            subject,
            text,
        })

        return `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }
}

interface NotificationTemplate {
    subject: string
    body: string
    htmlBody?: string
}

/**
 * Build notification template based on approval action
 */
function buildTemplate(
    template: 'approval_pending' | 'approval_approved' | 'approval_rejected' | 'forgot_password' | 'welcome_email' | string,
    context: Record<string, unknown>
): NotificationTemplate {
    const { approverName, requesterName, workflowName, approvalUrl } = context

    switch (template) {
        case 'approval_pending':
            return {
                subject: `⏳ New Approval Request: ${workflowName}`,
                body: `Hi ${approverName},\n\n${requesterName} has submitted a new approval request for: ${workflowName}.\n\nPlease review and approve/reject at: ${approvalUrl}`,
                htmlBody: `<p>Hi <strong>${approverName}</strong>,</p><p><strong>${requesterName}</strong> has submitted a new approval request for: <strong>${workflowName}</strong></p><p><a href="${approvalUrl}">Click here to review</a></p>`,
            }

        case 'approval_approved':
            return {
                subject: `✅ Approval Granted: ${workflowName}`,
                body: `Hi ${requesterName},\n\nYour approval request has been approved by ${approverName}.\n\nWorkflow: ${workflowName}`,
                htmlBody: `<p>Hi <strong>${requesterName}</strong>,</p><p>Your approval request has been <strong>approved</strong> by <strong>${approverName}</strong>.</p><p>Workflow: <strong>${workflowName}</strong></p>`,
            }

        case 'approval_rejected':
            return {
                subject: `❌ Approval Rejected: ${workflowName}`,
                body: `Hi ${requesterName},\n\nYour approval request has been rejected by ${approverName}. Please review feedback and resubmit if needed.\n\nWorkflow: ${workflowName}`,
                htmlBody: `<p>Hi <strong>${requesterName}</strong>,</p><p>Your approval request has been <strong>rejected</strong> by <strong>${approverName}</strong>. Please review feedback and resubmit if needed.</p><p>Workflow: <strong>${workflowName}</strong></p>`,
            }

        case 'forgot_password':
            return {
                subject: `🔑 Reset Your Password`,
                body: `Hi ${context.userName || 'there'},\n\nWe received a request to reset your password. Please click the link below to set a new password:\n\n${context.resetUrl}\n\nIf you did not request this, please ignore this email.\nThis link will expire in 30 minutes.`,
                htmlBody: `<p>Hi <strong>${context.userName || 'there'}</strong>,</p><p>We received a request to reset your password. Please click the link below to set a new password:</p><p><a href="${context.resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#0055FF;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a></p><p>If you did not request this, please ignore this email.<br>This link will expire in 30 minutes.</p>`,
            }

        case 'welcome_email':
            return {
                subject: `🎉 Welcome to IFRS 9 Platform, ${context.fullName || context.username}`,
                body: `Hi ${context.fullName || context.username},\n\nAn administrator has created an account for you on the IFRS 9 Platform.\n\nYour login credentials are:\nUsername: ${context.username}\nPassword: ${context.password}\n\nPlease login at: ${context.loginUrl}\n\nWe recommend changing your password after your first login.`,
                htmlBody: `<p>Hi <strong>${context.fullName || context.username}</strong>,</p><p>An administrator has created an account for you on the IFRS 9 Platform.</p><p>Your login credentials are:</p><ul><li>Username: <strong>${context.username}</strong></li><li>Password: <strong>${context.password}</strong></li></ul><p><a href="${context.loginUrl}" style="display:inline-block;padding:10px 20px;background-color:#0055FF;color:#fff;text-decoration:none;border-radius:5px;">Login Now</a></p><p><em>We recommend changing your password after your first login.</em></p>`,
            }
            
        default:
             return {
                 subject: `Notification: ${template}`,
                 body: `You have a new notification.`,
                 htmlBody: `<p>You have a new notification.</p>`,
             }
    }
}

async function buildTemplateAsync(
    templateCode: string,
    context: Record<string, unknown>
): Promise<NotificationTemplate> {
    try {
        const [dbTemplate] = await db
            .select()
            .from(platformEmailTemplates)
            .where(eq(platformEmailTemplates.code, templateCode))
            .limit(1);

        if (dbTemplate) {
            let subject = dbTemplate.subject;
            let text = dbTemplate.bodyText;
            let html = dbTemplate.bodyHtml;

            for (const key of Object.keys(context)) {
                const val = String(context[key] || '');
                const regex = new RegExp(`{{${key}}}`, 'g');
                subject = subject.replace(regex, val);
                text = text.replace(regex, val);
                html = html.replace(regex, val);
            }
            return { subject, body: text, htmlBody: html };
        }
    } catch (e) {
        console.error('Failed to fetch template from DB, using fallback', e);
    }

    return buildTemplate(templateCode, context);
}

/**
 * Send email notification (called from Bull job handler)
 */
export const sendEmailNotification = Effect.gen(function* (_) {
    return async (
        job: ApprovalNotificationJob,
        toEmail: string,
        templateContext: Record<string, unknown>
    ): Promise<string> => {
        const template = await buildTemplateAsync(job.template, templateContext)

        try {
            const messageId = await sendSMTPEmail(
                toEmail,
                template.subject,
                template.body,
                template.htmlBody
            )

            console.log(`📧 Email sent: ${messageId}`)
            return messageId
        } catch (err) {
            console.error(`❌ Email send failed: ${err}`)
            throw err
        }
    }
})

/**
 * Send webhook notification (for external integrations)
 */
export const sendWebhookNotification = Effect.gen(function* (_) {
    return async (
        job: ApprovalNotificationJob,
        webhookUrl: string,
        payload: Record<string, unknown>
    ): Promise<Response> => {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId: job.workflowId,
                    action: job.action,
                    timestamp: new Date().toISOString(),
                    ...payload,
                }),
            })

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.statusText}`)
            }

            console.log(`🔗 Webhook sent to ${webhookUrl}`)
            return response
        } catch (err) {
            console.error(`❌ Webhook send failed: ${err}`)
            throw err
        }
    }
})

/**
 * Create in-app notification record (stored in DB)
 */
export const createInAppNotification = Effect.gen(function* (_) {
    return async (
        job: ApprovalNotificationJob,
        title: string,
        message: string,
        userId: string,
        actionUrl?: string
    ): Promise<void> => {
        const input: CreateNotificationInput = {
            tenantId: job.tenantId,
            approvalRequestId: job.approvalRequestId,
            workflowId: job.workflowId,
            type: `APPROVAL_${job.action}`,
            severity: 'info',
            title,
            message,
            actionUrl,
            entityType: 'approval_request',
            entityId: job.approvalRequestId,
            source: 'approval_service',
            triggeredBy: job.approverUserId,
            userTargets: [userId],
            channel: 'in_app',
        }
        try {
            await NotificationRepository.createWithDeliveries(input)
        } catch (err) {
            console.error(`❌ Failed to persist notification for user ${userId}: ${err}`)
        }
    }
})

/**
 * Queue approval notification (called from approval service)
 * This adds the job to Bull queue; actual sending happens in job handler
 */
export async function notifyApprovalRequested(
    workflowId: string,
    tenantId: string,
    approvalRequestId: string,
    approverUserId: string,
    approverEmail: string,
    requesterName: string,
    workflowName: string,
    approvalUrl: string
): Promise<void> {
    const job: ApprovalNotificationJob = {
        workflowId,
        workflowName,
        tenantId,
        approvalRequestId,
        action: 'APPROVED', // placeholder; actual action from job
        approverUserId,
        notifyUser: approverUserId,
        email: approverEmail,
        template: 'approval_pending',
    }

    await queueApprovalNotification(job)
    console.log(`📤 Queued approval_pending notification for ${approverUserId}`)
}

export async function notifyApprovalApproved(
    workflowId: string,
    tenantId: string,
    approvalRequestId: string,
    requesterUserId: string,
    requesterEmail: string,
    approverName: string,
    workflowName: string
): Promise<void> {
    const job: ApprovalNotificationJob = {
        workflowId,
        workflowName,
        tenantId,
        approvalRequestId,
        action: 'APPROVED',
        approverUserId: approverName, // placeholder
        notifyUser: requesterUserId,
        email: requesterEmail,
        template: 'approval_approved',
    }

    await queueApprovalNotification(job)
    console.log(`📤 Queued approval_approved notification for ${requesterUserId}`)
}

export async function notifyApprovalRejected(
    workflowId: string,
    tenantId: string,
    approvalRequestId: string,
    requesterUserId: string,
    requesterEmail: string,
    approverName: string,
    workflowName: string,
    rejectionReason?: string
): Promise<void> {
    const job: ApprovalNotificationJob = {
        workflowId,
        workflowName,
        tenantId,
        approvalRequestId,
        action: 'REJECTED',
        approverUserId: approverName, // placeholder
        notifyUser: requesterUserId,
        email: requesterEmail,
        template: 'approval_rejected',
    }

    await queueApprovalNotification(job)
    console.log(`📤 Queued approval_rejected notification for ${requesterUserId}`)
}

/**
 * Send a forgot password email directly
 */
export async function sendForgotPasswordEmail(toEmail: string, userName: string, resetUrl: string): Promise<void> {
    const template = buildTemplate('forgot_password', { userName, resetUrl })
    try {
        const messageId = await sendSMTPEmail(
            toEmail,
            template.subject,
            template.body,
            template.htmlBody
        )
        console.log(`📧 Forgot password email sent: ${messageId}`)
    } catch (err) {
        console.error(`❌ Forgot password email send failed: ${err}`)
        throw err
    }
}

/**
 * Convert HTML email templates into a WhatsApp-friendly Markdown format.
 */
export function convertHtmlToWhatsAppMarkdown(html: string): string {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p>/gi, '')
        .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
        .replace(/<b>(.*?)<\/b>/gi, '*$1*')
        .replace(/<em>(.*?)<\/em>/gi, '_$1_')
        .replace(/<i>(.*?)<\/i>/gi, '_$1_')
        .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2:\n$1')
        .replace(/<[^>]*>/g, '') // strip any other remaining HTML tags
        .trim();
}

/**
 * Send WhatsApp message using Fonnte API Gateway.
 */
export async function sendWhatsAppFonnte(toPhone: string, message: string): Promise<boolean> {
    let token = process.env.FONNTE_API_TOKEN || 'QFGjetVGAXtVHoytNTGd';
    
    try {
        const [param] = await legacyDb
            .select()
            .from(frs9ParamCommonh)
            .where(eq(frs9ParamCommonh.paramCode, 'WA_TOKEN'))
            .limit(1);
        if (param && param.paramUsage) {
            token = param.paramUsage;
        }
    } catch (e) {
        console.warn('⚠️ Warning: Failed to fetch WA_TOKEN from business parameters, using fallback:', e);
    }

    // Clean phone number (keep only digits, convert leading 0 to 62)
    let cleanPhone = toPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith('62') && !cleanPhone.startsWith('1') && cleanPhone.length > 5) {
        cleanPhone = '62' + cleanPhone; // default to Indonesia
    }

    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: cleanPhone,
                message: message
            })
        });

        const resData = await response.json() as any;
        if (resData.status === true) {
            console.log(`💬 WhatsApp sent successfully via Fonnte to ${cleanPhone}`);
            return true;
        } else {
            console.error(`❌ Fonnte WhatsApp send failed:`, JSON.stringify(resData));
            return false;
        }
    } catch (error) {
        console.error(`❌ Error calling Fonnte API:`, error);
        return false;
    }
}
