'use client'

import React from 'react'
import { AdminNotificationCenter } from '@/components/AdminNotificationCenter'
import { useNotifications } from '@/hooks/useNotificationSocket'

/**
 * Example admin dashboard with real-time notifications
 */
export function AdminDashboardHeader() {
    const { notifications, unreadCount, isConnected } = useNotifications()

    return (
        <header className="border-b bg-white">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">IFRS9 Admin Dashboard</h1>
                    <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification center */}
                    <AdminNotificationCenter />

                    {/* User menu or other header items */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/avatar.png"
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

/**
 * Example: Approvals page that shows live workflow updates
 */
export function ApprovalsPage() {
    const { notifications, subscribeToApproval, unreadCount } = useNotifications()
    const [approvals, setApprovals] = React.useState<any[]>([])
    const [selectedApprovalId, setSelectedApprovalId] = React.useState<string | null>(null)

    // Subscribe to updates when approval selected
    React.useEffect(() => {
        if (selectedApprovalId) {
            subscribeToApproval(selectedApprovalId)
        }
    }, [selectedApprovalId, subscribeToApproval])

    // Get notifications for this approval
    const relevantNotifications = selectedApprovalId
        ? notifications.filter((n) => n.workflowId === selectedApprovalId)
        : []

    return (
        <div className="grid grid-cols-3 gap-4 p-6">
            {/* Approvals list */}
            <div className="col-span-2">
                <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>

                    {approvals.length === 0 ? (
                        <p className="text-gray-500">No pending approvals</p>
                    ) : (
                        <div className="space-y-2">
                            {approvals.map((approval) => (
                                <button
                                    key={approval.id}
                                    onClick={() => setSelectedApprovalId(approval.id)}
                                    className={`w-full text-left p-3 border rounded transition ${selectedApprovalId === approval.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{approval.name}</p>
                                            <p className="text-sm text-gray-600">{approval.requester}</p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${approval.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {approval.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Notification feed for selected approval */}
            <div className="col-span-1">
                <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
                    <h3 className="font-semibold mb-3">Live Updates</h3>

                    {relevantNotifications.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            {selectedApprovalId
                                ? 'No updates yet. Select an approval to view updates.'
                                : 'Select an approval to see live updates.'}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {relevantNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="bg-white p-2 rounded border-l-2 border-blue-500"
                                >
                                    <p className="text-xs font-medium">{notification.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * Example: ECL Calculations page with live progress
 */
export function ECLCalculationsPage() {
    const { subscribeToECL, notifications } = useNotifications()
    const [activeECLWorkflowId, setActiveECLWorkflowId] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (activeECLWorkflowId) {
            subscribeToECL(activeECLWorkflowId)
        }
    }, [activeECLWorkflowId, subscribeToECL])

    const eclNotifications = activeECLWorkflowId
        ? notifications.filter((n) => n.workflowId === activeECLWorkflowId && n.type.includes('ECL'))
        : []

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">ECL Calculations</h2>

            {/* Active ECL calculation card */}
            {activeECLWorkflowId && eclNotifications.length > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <h3 className="font-semibold mb-2">Current Calculation</h3>

                    {eclNotifications.map((n) => (
                        <div key={n.id} className="flex items-center gap-2 text-sm">
                            <div
                                className={`w-3 h-3 rounded-full ${n.type === 'ECL_STARTED'
                                        ? 'bg-blue-500'
                                        : n.type === 'ECL_COMPLETED'
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                    }`}
                            />
                            <span>{n.message}</span>
                        </div>
                    ))}

                    {eclNotifications.some((n) => n.type === 'ECL_STARTED') &&
                        !eclNotifications.some((n) => n.type === 'ECL_COMPLETED') && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full w-1/2 animate-pulse" />
                            </div>
                        )}
                </div>
            )}

            {/* ECL calculations list */}
            <div className="border rounded-lg p-4">
                <p className="text-gray-500">ECL calculations list would go here</p>
            </div>
        </div>
    )
}
