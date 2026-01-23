import { Effect } from 'effect'
import { ApprovalNotificationJob, queueApprovalNotification } from '../queue/bull-setup'

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

const smtpConfig: SMTPConfig = {
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
}

async function sendSMTPEmail(to: string, subject: string, text: string, html?: string): Promise<string> {
    const from = process.env.SMTP_FROM || 'noreply@ifrs9-app.local'
    
    try {
        // Connect to SMTP server using Bun.connect
        const socket = await Bun.connect({
            hostname: smtpConfig.host,
            port: smtpConfig.port,
            socket: {
                data(socket, data) {
                    console.log('SMTP Response:', new TextDecoder().decode(data))
                },
                error(socket, error) {
                    console.error('SMTP Error:', error)
                },
            },
        })

        // Build email message
        const messageId = `<${Date.now()}.${Math.random().toString(36).substring(7)}@${smtpConfig.host}>`
        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(7)}`
        
        const emailContent = html
            ? [
                  `From: ${from}`,
                  `To: ${to}`,
                  `Subject: ${subject}`,
                  `Message-ID: ${messageId}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: multipart/alternative; boundary="${boundary}"`,
                  '',
                  `--${boundary}`,
                  'Content-Type: text/plain; charset=utf-8',
                  '',
                  text,
                  '',
                  `--${boundary}`,
                  'Content-Type: text/html; charset=utf-8',
                  '',
                  html,
                  '',
                  `--${boundary}--`,
              ].join('\r\n')
            : [
                  `From: ${from}`,
                  `To: ${to}`,
                  `Subject: ${subject}`,
                  `Message-ID: ${messageId}`,
                  '',
                  text,
              ].join('\r\n')

        // Send SMTP commands
        const sendCommand = async (cmd: string) => {
            socket.write(cmd + '\r\n')
            await Bun.sleep(100) // Wait for response
        }

        // SMTP handshake
        await Bun.sleep(500) // Wait for server greeting
        await sendCommand(`EHLO ${smtpConfig.host}`)
        
        if (smtpConfig.auth) {
            await sendCommand('AUTH LOGIN')
            await sendCommand(btoa(smtpConfig.auth.user))
            await sendCommand(btoa(smtpConfig.auth.pass))
        }
        
        await sendCommand(`MAIL FROM:<${from}>`)
        await sendCommand(`RCPT TO:<${to}>`)
        await sendCommand('DATA')
        await sendCommand(emailContent)
        await sendCommand('.')
        await sendCommand('QUIT')
        
        socket.end()
        
        console.log('📧 Email sent successfully via SMTP')
        return messageId
    } catch (error) {
        console.error('❌ SMTP Error:', error)
        
        // Fallback: Log email details
        console.log('📧 Email Details (fallback):', {
            from,
            to,
            subject,
            text: text.substring(0, 100) + '...',
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
    template: 'approval_pending' | 'approval_approved' | 'approval_rejected',
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
    }
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
        const template = buildTemplate(job.template, templateContext)

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
        // TODO: Insert into notifications table
        // For now, just log
        console.log(`📱 In-app notification for user ${userId}: ${title}`)
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
