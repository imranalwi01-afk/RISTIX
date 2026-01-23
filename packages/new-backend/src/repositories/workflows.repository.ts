import { Effect, Schema } from 'effect'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { eq, and } from 'drizzle-orm'
import {
    workflows,
    workflowTransitions,
    workflowJobs,
    type Workflow,
    type NewWorkflow,
    type WorkflowTransition,
    type NewWorkflowTransition,
    type WorkflowJob,
    type NewWorkflowJob,
} from '../db/schema/workflows.schema'
import { queueApprovalNotification, queueECLCalculation, ApprovalNotificationJob, ECLCalculationJob } from '../queue/bull-setup'
import * as NotificationService from '../services/notification.service'
import { getNotificationSocket } from '../socket/notification.socket'

/**
 * Workflow Repository: CRUD and business logic for workflows
 */

export class WorkflowRepository {
    constructor(private db: PostgresJsDatabase<any>) {}

    /**
     * Create new workflow
     */
    async createWorkflow(data: NewWorkflow): Promise<Workflow> {
        const [workflow] = await this.db.insert(workflows).values(data).returning()
        return workflow
    }

    /**
     * Get workflow by ID
     */
    async getWorkflow(workflowId: string): Promise<Workflow | undefined> {
        const [workflow] = await (this.db.query as any).workflows.findMany({
            where: eq(workflows.id, workflowId),
            with: {
                transitions: true,
                jobs: true,
            },
        })
        return workflow
    }

    /**
     * Get workflows for tenant
     */
    async getWorkflowsByTenant(tenantId: string): Promise<Workflow[]> {
        return (this.db.query as any).workflows.findMany({
            where: eq(workflows.tenantId, tenantId),
            orderBy: (w: any) => w.createdAt,
        })
    }

    /**
     * Transition workflow state + audit trail
     */
    async transitionWorkflow(
        workflowId: string,
        toState: string,
        triggeredBy: string,
        transitionReason?: string,
        transitionNotes?: string,
        approvalAction?: string,
        approvalComment?: string
    ): Promise<{ workflow: Workflow; transition: WorkflowTransition }> {
        const workflow = await this.getWorkflow(workflowId)
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`)
        }

        const fromState = workflow.currentState

        // Update workflow state
        const [updatedWorkflow] = await this.db
            .update(workflows)
            .set({
                currentState: toState,
                previousState: fromState,
                updatedAt: new Date(),
                completedAt: ['COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED'].includes(toState)
                    ? new Date()
                    : undefined,
            })
            .where(eq(workflows.id, workflowId))
            .returning()

        // Log transition
        const [transition] = await this.db
            .insert(workflowTransitions)
            .values({
                workflowId,
                tenantId: workflow.tenantId,
                fromState,
                toState,
                transitionReason,
                transitionNotes,
                triggeredBy: triggeredBy as any,
                approvalAction,
                approvalComment,
            } as NewWorkflowTransition)
            .returning()

        console.log(`🔄 Workflow ${workflowId} transitioned: ${fromState} → ${toState}`)

        return { workflow: updatedWorkflow, transition }
    }

    /**
     * Create workflow job (for Bull queue tracking)
     */
    async createWorkflowJob(data: NewWorkflowJob): Promise<WorkflowJob> {
        const [job] = await this.db.insert(workflowJobs).values(data).returning()
        return job
    }

    /**
     * Update workflow job status
     */
    async updateJobStatus(
        jobId: string,
        status: string,
        result?: Record<string, unknown>,
        errorMessage?: string
    ): Promise<WorkflowJob> {
        const [job] = await this.db
            .update(workflowJobs)
            .set({
                status,
                result: result ? JSON.stringify(result) : undefined,
                errorMessage,
                updatedAt: new Date(),
                completedAt: ['COMPLETED', 'FAILED'].includes(status) ? new Date() : undefined,
            })
            .where(eq(workflowJobs.id, jobId as any))
            .returning()
        return job
    }
}

/**
 * Workflow Event Handler: trigger jobs and notifications on state changes
 */

export class WorkflowEventHandler {
    constructor(
        private workflowRepo: WorkflowRepository,
        private db: PostgresJsDatabase<any>
    ) {}

    /**
     * Handle approval workflow completed
     * Triggers: ECL calculation, notifications, audit log
     */
    async handleApprovalCompleted(
        workflowId: string,
        tenantId: string,
        action: 'APPROVED' | 'REJECTED',
        approverUserId: string,
        approverName: string,
        requesterUserId: string,
        requesterEmail: string,
        workflowName: string,
        eclParams?: Record<string, unknown>
    ): Promise<void> {
        console.log(`📋 Handling approval completion: ${workflowId} (${action})`)

        try {
            // 1. Log transition
            const { workflow, transition } = await this.workflowRepo.transitionWorkflow(
                workflowId,
                action === 'APPROVED' ? 'COMPLETED' : 'REJECTED',
                approverUserId,
                `Approval ${action.toLowerCase()}`,
                undefined,
                action
            )

            // 1b. Broadcast socket notification
            const socket = getNotificationSocket()
            socket.broadcastWorkflowTransition(
                tenantId,
                workflowId,
                transition.fromState,
                transition.toState,
                { action, approverName }
            )

            // 2. Queue notification to requester
            if (action === 'APPROVED') {
                await NotificationService.notifyApprovalApproved(
                    workflowId,
                    tenantId,
                    workflowId, // approximation
                    requesterUserId,
                    requesterEmail,
                    approverName,
                    workflowName
                )

                // 3. If ECL-related, queue ECL calculation
                // Check if workflow.metadata contains ECL entity info
                const workflow = await this.workflowRepo.getWorkflow(workflowId)
                if (workflow?.metadata && (workflow.metadata as any).entityType === 'ECL_RUN') {
                    console.log(`💰 Queueing ECL calculation for workflow ${workflowId}`)

                    const eclJob: ECLCalculationJob = {
                        workflowId,
                        tenantId,
                        entityId: (workflow.metadata as any).entityId,
                        storedProcedure: 'calculate_expected_credit_loss',
                        parameters: eclParams || (workflow.metadata as any).eclParams,
                    }

                    const jobId = await queueECLCalculation(eclJob)

                    // Broadcast ECL start event to admins
                    socket.broadcastECLEvent(tenantId, workflowId, 'started', {
                        message: `ECL calculation started for ${workflowName}`,
                        jobId,
                    })

                    // Track job in DB
                    await this.workflowRepo.createWorkflowJob({
                        workflowId,
                        tenantId,
                        jobType: 'ECL_CALCULATION',
                        jobId,
                        jobName: `ECL Calculation - ${workflowName}`,
                        status: 'QUEUED',
                    } as NewWorkflowJob)
                }
            } else {
                // Rejection notification
                await NotificationService.notifyApprovalRejected(
                    workflowId,
                    tenantId,
                    workflowId,
                    requesterUserId,
                    requesterEmail,
                    approverName,
                    workflowName
                )
            }

            console.log(`✅ Approval completion event handled: ${workflowId}`)
        } catch (err) {
            console.error(`❌ Error handling approval completion: ${err}`)
            throw err
        }
    }

    /**
     * Handle ECL calculation job completion
     * Updates workflow, logs result, triggers compliance checks
     */
    async handleECLCalculationCompleted(
        workflowId: string,
        tenantId: string,
        jobId: string,
        result: Record<string, unknown>,
        userId: string
    ): Promise<void> {
        console.log(`🧮 Handling ECL calculation completion: ${jobId}`)

        const socket = getNotificationSocket()

        try {
            // 1. Update job status
            await this.workflowRepo.updateJobStatus(jobId, 'COMPLETED', result)

            // 2. Transition workflow to completed
            const { transition } = await this.workflowRepo.transitionWorkflow(
                workflowId,
                'COMPLETED',
                userId,
                'ECL calculation successful',
                JSON.stringify(result)
            )

            // 2b. Broadcast ECL completion to admins
            socket.broadcastECLEvent(tenantId, workflowId, 'completed', {
                message: 'ECL calculation completed successfully',
                result,
            })

            // 3. Could trigger compliance check here if needed
            console.log(`✅ ECL calculation completed: ${workflowId}`)
        } catch (err) {
            console.error(`❌ Error handling ECL completion: ${err}`)

            // Broadcast ECL failure to admins
            socket.broadcastECLEvent(tenantId, workflowId, 'failed', {
                message: `ECL calculation failed: ${(err as Error).message}`,
            })

            // Mark job as failed
            await this.workflowRepo.updateJobStatus(jobId, 'FAILED', undefined, (err as Error).message)
        }
    }
}

/**
 * Export repository factory
 */
export function createWorkflowRepository(db: PostgresJsDatabase<any>): WorkflowRepository {
    return new WorkflowRepository(db)
}

export function createWorkflowEventHandler(
    workflowRepo: WorkflowRepository,
    db: PostgresJsDatabase<any>
): WorkflowEventHandler {
    return new WorkflowEventHandler(workflowRepo, db)
}
