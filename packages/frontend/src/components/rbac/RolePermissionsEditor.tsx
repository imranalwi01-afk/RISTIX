'use client'

import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { apiClient as api } from '@/services/api-client'

interface PermissionDefinition {
    label: string
    description: string
}

interface PermissionGroup {
    label: string
    icon: string
    permissions: Record<string, PermissionDefinition>
}

interface RolePermissionsEditorProps {
    roleId: string
    roleName?: string
    onSave?: () => void
    readonly?: boolean
}

export const RolePermissionsEditor: React.FC<RolePermissionsEditorProps> = ({
    roleId,
    roleName,
    onSave,
    readonly = false
}) => {
    const [permissionGroups, setPermissionGroups] = useState<Record<string, PermissionGroup>>({})
    const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        loadData()
    }, [roleId])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            // Load permission structure
            const groupsRes = await api.get('/rbac/permissions')
            setPermissionGroups(groupsRes.data)

            // Load current role permissions
            const roleRes = await api.get(`/rbac/roles/${roleId}/permissions`)
            setSelectedPermissions(roleRes.data.permissions || {})
            setHasChanges(false)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load permissions')
            console.error('Failed to load permissions', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePermissionToggle = (permission: string) => {
        if (readonly) return

        setSelectedPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }))
        setHasChanges(true)
    }

    const handleGroupToggle = (groupKey: string) => {
        if (readonly) return

        const group = permissionGroups[groupKey]
        const groupPermissions = Object.keys(group.permissions)

        // Check if all permissions in group are selected
        const allSelected = groupPermissions.every(p => selectedPermissions[p])

        // Toggle all permissions in group
        const updates: Record<string, boolean> = {}
        groupPermissions.forEach(p => {
            updates[p] = !allSelected
        })

        setSelectedPermissions(prev => ({
            ...prev,
            ...updates
        }))
        setHasChanges(true)
    }

    const isGroupFullySelected = (groupKey: string): boolean => {
        const group = permissionGroups[groupKey]
        const groupPermissions = Object.keys(group.permissions)
        return groupPermissions.every(p => selectedPermissions[p])
    }

    const isGroupPartiallySelected = (groupKey: string): boolean => {
        const group = permissionGroups[groupKey]
        const groupPermissions = Object.keys(group.permissions)
        const selectedCount = groupPermissions.filter(p => selectedPermissions[p]).length
        return selectedCount > 0 && selectedCount < groupPermissions.length
    }

    const getSelectedCount = (groupKey: string): number => {
        const group = permissionGroups[groupKey]
        const groupPermissions = Object.keys(group.permissions)
        return groupPermissions.filter(p => selectedPermissions[p]).length
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            await api.put(`/rbac/roles/${roleId}/permissions`, {
                permissions: selectedPermissions
            })
            setHasChanges(false)
            onSave?.()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save permissions')
            console.error('Failed to save permissions', err)
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        loadData()
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        )
    }

    const totalPermissions = Object.values(permissionGroups).reduce(
        (sum, group) => sum + Object.keys(group.permissions).length,
        0
    )
    const selectedCount = Object.values(selectedPermissions).filter(Boolean).length

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">
                        {roleName ? `Permissions for ${roleName}` : 'Role Permissions'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {selectedCount} of {totalPermissions} permissions selected
                    </Typography>
                </Box>
                {!readonly && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            disabled={!hasChanges || saving}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                )}
            </Box>

            {readonly && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    This is a system role. Permissions cannot be modified.
                </Alert>
            )}

            {Object.entries(permissionGroups).map(([groupKey, group]) => {
                const selectedInGroup = getSelectedCount(groupKey)
                const totalInGroup = Object.keys(group.permissions).length

                return (
                    <Accordion key={groupKey} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isGroupFullySelected(groupKey)}
                                            indeterminate={isGroupPartiallySelected(groupKey)}
                                            onChange={(e) => {
                                                e.stopPropagation()
                                                handleGroupToggle(groupKey)
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={readonly}
                                        />
                                    }
                                    label={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {group.label}
                                        </Typography>
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Chip
                                    label={`${selectedInGroup}/${totalInGroup}`}
                                    size="small"
                                    color={selectedInGroup === totalInGroup ? 'primary' : 'default'}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGroup>
                                {Object.entries(group.permissions).map(([permKey, perm]) => (
                                    <FormControlLabel
                                        key={permKey}
                                        control={
                                            <Checkbox
                                                checked={selectedPermissions[permKey] || false}
                                                onChange={() => handlePermissionToggle(permKey)}
                                                disabled={readonly}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {perm.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {perm.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ ml: 2, mb: 1, alignItems: 'flex-start' }}
                                    />
                                ))}
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                )
            })}
        </Box>
    )
}
