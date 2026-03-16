import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Chip,
    Checkbox,
    ListItemText,
    Stack,
    Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { bankingAPI, api } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

// Internal types mirrored from page.tsx logic
interface MatrixLevelEditor {
    level: number;
    name: string;
    requiredRoleCodes: string[];
    requiredPermissionCodes: string;
    requiredCount: number;
    timeoutHours: string;
}

interface RoleOption {
    code: string;
    label: string;
    description?: string;
    hierarchyLevel?: number | null;
    levelLabel: string;
}

interface MatrixPayloadLevel {
    level?: number;
    name?: string;
    requiredRoleCodes?: unknown;
    required_role_codes?: unknown;
    requiredRoles?: unknown;
    requiredPermissionCodes?: string[] | null;
    requiredCount?: number;
    required_count?: number;
    timeoutHours?: number | null;
}

interface MatrixPayload {
    id?: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
    levels?: MatrixPayloadLevel[];
}

interface ApprovalMatrixEditorDialogProps {
    open: boolean;
    onClose: () => void;
    matrix?: MatrixPayload;
    onSuccess: () => void;
    onError: (message: string, severity: 'error' | 'warning') => void;
}

const parseCodeList = (value: string): string[] => {
    const unique = new Set(
        String(value || '')
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
    );
    return Array.from(unique);
};

const formatCodeList = (values?: string[] | null): string =>
    Array.isArray(values) ? values.join(', ') : '';

const toCodeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return Array.from(
            new Set(
                value
                    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter((entry) => entry.length > 0)
            )
        );
    }
    if (typeof value === 'string') return parseCodeList(value);
    return [];
};

const clampRequiredCount = (count: number, roleCount: number): number => {
    const normalizedCount = Math.max(1, Number(count || 1));
    if (roleCount > 0) return Math.min(normalizedCount, roleCount);
    return normalizedCount;
};

const extractRoleRecords = (input: unknown): Record<string, unknown>[] => {
    if (Array.isArray(input)) {
        return input.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object');
    }

    if (!input || typeof input !== 'object') return [];

    const record = input as Record<string, unknown>;
    const directKeys = ['roles', 'items', 'results', 'data'];
    for (const key of directKeys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object');
        }
    }

    if (record.data && typeof record.data === 'object') {
        const nestedData = record.data as Record<string, unknown>;
        const nestedKeys = ['roles', 'items', 'results'];
        for (const key of nestedKeys) {
            const value = nestedData[key];
            if (Array.isArray(value)) {
                return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object');
            }
        }
    }

    return [];
};

const normalizeRoleOptions = (input: unknown): RoleOption[] => {
    const options = extractRoleRecords(input)
        .map((role) => {
            const code = String(
                role.roleCode
                ?? role.role_code
                ?? role.code
                ?? role.name
                ?? role.roleName
                ?? role.role_name
                ?? ''
            ).trim();
            if (!code) return null;

            const label = String(
                role.displayName
                ?? role.display_name
                ?? role.roleName
                ?? role.role_name
                ?? role.name
                ?? role.roleCode
                ?? role.role_code
                ?? code
            ).trim();

            const hierarchyLevelValue = role.hierarchyLevel ?? role.hierarchy_level;
            const hierarchyLevel =
                typeof hierarchyLevelValue === 'number'
                    ? hierarchyLevelValue
                    : typeof hierarchyLevelValue === 'string' && hierarchyLevelValue.trim().length > 0
                        ? Number(hierarchyLevelValue)
                        : null;
            const normalizedHierarchyLevel =
                typeof hierarchyLevel === 'number' && Number.isFinite(hierarchyLevel) ? hierarchyLevel : null;
            const description = typeof role.description === 'string' ? role.description.trim() : '';

            return {
                code,
                label: label || code,
                description: description || undefined,
                hierarchyLevel: normalizedHierarchyLevel,
                levelLabel: normalizedHierarchyLevel == null ? 'Unassigned hierarchy' : `Hierarchy ${normalizedHierarchyLevel}`,
            } as RoleOption;
        })
        .filter((entry): entry is RoleOption => !!entry);

    const dedup = new Map<string, RoleOption>();
    options.forEach((option) => {
        dedup.set(option.code, option);
    });

    return Array.from(dedup.values()).sort((left, right) => {
        const leftHierarchy = left.hierarchyLevel ?? Number.NEGATIVE_INFINITY;
        const rightHierarchy = right.hierarchyLevel ?? Number.NEGATIVE_INFINITY;
        if (leftHierarchy !== rightHierarchy) return rightHierarchy - leftHierarchy;
        return left.label.localeCompare(right.label);
    });
};

export const ApprovalMatrixEditorDialog: React.FC<ApprovalMatrixEditorDialogProps> = ({
    open,
    onClose,
    matrix,
    onSuccess,
    onError,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [levels, setLevels] = useState<MatrixLevelEditor[]>([]);
    const [saving, setSaving] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const roleLabelMap = useMemo(
        () => new Map(availableRoles.map((role) => [role.code, role.label])),
        [availableRoles]
    );
    const rolesByHierarchy = useMemo(() => {
        const grouped = new Map<string, RoleOption[]>();
        availableRoles.forEach((role) => {
            const key = role.levelLabel;
            const existing = grouped.get(key) ?? [];
            existing.push(role);
            grouped.set(key, existing);
        });

        return Array.from(grouped.entries())
            .map(([groupLabel, roles]) => ({
                groupLabel,
                hierarchyLevel: roles[0]?.hierarchyLevel ?? null,
                roles: [...roles].sort((left, right) => left.label.localeCompare(right.label)),
            }))
            .sort((left, right) => {
                const leftHierarchy = left.hierarchyLevel ?? Number.NEGATIVE_INFINITY;
                const rightHierarchy = right.hierarchyLevel ?? Number.NEGATIVE_INFINITY;
                return rightHierarchy - leftHierarchy;
            });
    }, [availableRoles]);
    const resolveSelectedRoles = (selectedCodes: string[]): RoleOption[] =>
        selectedCodes.map((code) => {
            const existingRole = availableRoles.find((role) => role.code === code);
            if (existingRole) return existingRole;

            return {
                code,
                label: code,
                levelLabel: 'Unavailable roles',
                hierarchyLevel: null,
            };
        });

    // Initialize state when matrix prop changes or dialog opens
    useEffect(() => {
        if (open && matrix) {
            setName(matrix.name || '');
            setDescription(matrix.description || '');
            setIsActive(Boolean(matrix.isActive ?? true));

            const initialLevels = [...(matrix.levels || [])]
                .sort((a, b) => (a.level || 0) - (b.level || 0))
                .map((level) => ({
                    level: Number(level.level || 0),
                    name: String(level.name || `Level ${level.level || '-'}`),
                    requiredRoleCodes: toCodeArray(level.requiredRoleCodes ?? level.required_role_codes ?? level.requiredRoles),
                    requiredPermissionCodes: formatCodeList(level.requiredPermissionCodes),
                    requiredCount: clampRequiredCount(
                        Number(level.requiredCount || level.required_count || 1),
                        toCodeArray(level.requiredRoleCodes ?? level.required_role_codes ?? level.requiredRoles).length
                    ),
                    timeoutHours: level.timeoutHours == null ? '' : String(level.timeoutHours),
                }));
            setLevels(initialLevels);
        } else if (open && !matrix) {
            // Reset for new matrix if needed (though current UI only uses it for edit)
            setName('');
            setDescription('');
            setIsActive(true);
            setLevels([{
                level: 1,
                name: 'Level 1',
                requiredRoleCodes: [],
                requiredPermissionCodes: 'approval.requests.approve',
                requiredCount: 1,
                timeoutHours: ''
            }]);
        }
    }, [open, matrix]);

    useEffect(() => {
        if (!open) return;

        const loadRoles = async () => {
            try {
                setRolesLoading(true);
                const response = await api.roles.getAll({ limit: 500 });
                setAvailableRoles(normalizeRoleOptions(response));
            } catch (error) {
                console.error('Error loading roles for approval matrix editor:', error);
                onError(getErrorMessage(error, 'Failed to load roles for matrix editor.'), 'warning');
                setAvailableRoles([]);
            } finally {
                setRolesLoading(false);
            }
        };

        void loadRoles();
    }, [open, onError]);

    const updateMatrixLevel = (
        index: number,
        field: keyof MatrixLevelEditor,
        value: string | number | string[]
    ) => {
        setLevels((prev) =>
            prev.map((level, levelIndex) =>
                levelIndex === index ? { ...level, [field]: value } : level
            )
        );
    };

    const updateLevelRoles = (index: number, selectedRoleCodes: string[]) => {
        const normalizedRoles = toCodeArray(selectedRoleCodes);
        setLevels((prev) =>
            prev.map((level, levelIndex) => {
                if (levelIndex !== index) return level;
                return {
                    ...level,
                    requiredRoleCodes: normalizedRoles,
                    requiredCount: clampRequiredCount(level.requiredCount, normalizedRoles.length),
                };
            })
        );
    };

    const handleSave = async () => {
        if (!matrix?.id && !name.trim()) return;

        try {
            setSaving(true);

            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                isActive: isActive,
                levels: levels
                    .sort((a, b) => a.level - b.level)
                    .map((level) => ({
                        level: Math.max(1, Number(level.level || 1)),
                        name: String(level.name || `Level ${level.level || '-'}`).trim(),
                        requiredRoleCodes: toCodeArray(level.requiredRoleCodes),
                        requiredPermissionCodes: parseCodeList(level.requiredPermissionCodes),
                        requiredCount: clampRequiredCount(Number(level.requiredCount || 1), toCodeArray(level.requiredRoleCodes).length),
                        timeoutHours: level.timeoutHours === '' ? undefined : Math.max(1, Number(level.timeoutHours)),
                    })),
            };

            if (matrix?.id) {
                await bankingAPI.approval.updateMatrix(matrix.id, payload);
            } else {
                // New matrix creation logic could go here
                await bankingAPI.approval.createMatrix({
                    ...payload,
                    entityType: 'custom', // Default for now
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Error saving approval matrix:', error);
            onError(getErrorMessage(error, 'Failed to save approval matrix.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !saving && onClose()}
            maxWidth="md"
            fullWidth
            data-testid="approval-matrix-editor-dialog"
        >
            <DialogTitle>{matrix?.id ? 'Edit Approval Matrix' : 'Create Approval Matrix'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Matrix Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={saving}
                                slotProps={{ htmlInput: { 'data-testid': 'approval-matrix-name-input' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setIsActive(e.target.value === 'active')}
                                    disabled={saving}
                                    data-testid="approval-matrix-status-select"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                minRows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                                slotProps={{ htmlInput: { 'data-testid': 'approval-matrix-description-input' } }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Approval Levels
                        </Typography>
                        {levels.map((level, index) => (
                            <Paper
                                key={`matrix-level-${index}`}
                                variant="outlined"
                                sx={{ p: 1.5, mb: 1.5 }}
                            >
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Level"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={level.level}
                                            onChange={(e) => updateMatrixLevel(index, 'level', Math.max(1, Number(e.target.value || 1)))}
                                            disabled={saving}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            value={level.name}
                                            onChange={(e) => updateMatrixLevel(index, 'name', e.target.value)}
                                            disabled={saving}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Required Count"
                                            type="number"
                                            inputProps={{
                                                min: 1,
                                                max: level.requiredRoleCodes.length > 0 ? level.requiredRoleCodes.length : undefined,
                                            }}
                                            value={level.requiredCount}
                                            onChange={(e) => {
                                                const rawValue = Math.max(1, Number(e.target.value || 1));
                                                updateMatrixLevel(
                                                    index,
                                                    'requiredCount',
                                                    clampRequiredCount(rawValue, level.requiredRoleCodes.length)
                                                );
                                            }}
                                            disabled={saving}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <TextField
                                            fullWidth
                                            label="Timeout (Hours)"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={level.timeoutHours}
                                            onChange={(e) => updateMatrixLevel(index, 'timeoutHours', e.target.value)}
                                            disabled={saving}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Grid container spacing={1.5}>
                                            <Grid size={{ xs: 12, md: 7 }}>
                                                <Autocomplete
                                                    multiple
                                                    disableCloseOnSelect
                                                    options={availableRoles}
                                                    groupBy={(option) => option.levelLabel}
                                                    value={resolveSelectedRoles(level.requiredRoleCodes)}
                                                    onChange={(_, selectedRoles) =>
                                                        updateLevelRoles(
                                                            index,
                                                            selectedRoles.map((role) => role.code)
                                                        )
                                                    }
                                                    loading={rolesLoading}
                                                    disabled={saving || rolesLoading}
                                                    isOptionEqualToValue={(option, value) => option.code === value.code}
                                                    getOptionLabel={(option) => option.label}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Required Roles"
                                                            inputProps={{
                                                                ...params.inputProps,
                                                                'data-testid': `approval-matrix-required-roles-input-${index}`,
                                                            }}
                                                            placeholder={availableRoles.length > 0 ? 'Search and assign approver roles' : 'No roles available'}
                                                            helperText={
                                                                rolesLoading
                                                                    ? 'Loading tenant roles...'
                                                                    : availableRoles.length === 0
                                                                        ? 'No roles found. Leave empty to rely on permission codes.'
                                                                        : 'Search by role name/code or pick from the hierarchy panel.'
                                                            }
                                                        />
                                                    )}
                                                    renderOption={(props, option, { selected }) => (
                                                        <Box component="li" {...props}>
                                                            <Checkbox sx={{ mr: 1 }} checked={selected} />
                                                            <ListItemText
                                                                primary={option.label}
                                                                secondary={`${option.code}${option.hierarchyLevel == null ? '' : ` • Hierarchy ${option.hierarchyLevel}`}`}
                                                            />
                                                        </Box>
                                                    )}
                                                    renderTags={(selectedRoles, getTagProps) =>
                                                        selectedRoles.map((role, tagIndex) => (
                                                            <Chip
                                                                {...getTagProps({ index: tagIndex })}
                                                                key={`${index}-${role.code}`}
                                                                size="small"
                                                                label={roleLabelMap.get(role.code) || role.code}
                                                            />
                                                        ))
                                                    }
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 5 }}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.25,
                                                        borderStyle: 'dashed',
                                                        height: '100%',
                                                        minHeight: 180,
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                                                        Role Hierarchy
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                        Click a role below to add or remove it from this approval level.
                                                    </Typography>
                                                    {rolesLoading ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Loading hierarchy...
                                                        </Typography>
                                                    ) : rolesByHierarchy.length === 0 ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            No hierarchy data available for this tenant.
                                                        </Typography>
                                                    ) : (
                                                        <Stack spacing={1}>
                                                            {rolesByHierarchy.map((group, groupIndex) => (
                                                                <Box key={`${index}-${group.groupLabel}`}>
                                                                    {groupIndex > 0 ? <Divider sx={{ mb: 1 }} /> : null}
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                                                                        {group.groupLabel}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                                                        {group.roles.map((role) => {
                                                                            const selected = level.requiredRoleCodes.includes(role.code);
                                                                            return (
                                                                                <Chip
                                                                                    key={`${index}-${group.groupLabel}-${role.code}`}
                                                                                    label={role.label}
                                                                                    variant={selected ? 'filled' : 'outlined'}
                                                                                    color={selected ? 'primary' : 'default'}
                                                                                    onClick={() => {
                                                                                        const nextSelected = selected
                                                                                            ? level.requiredRoleCodes.filter((code) => code !== role.code)
                                                                                            : [...level.requiredRoleCodes, role.code];
                                                                                        updateLevelRoles(index, nextSelected);
                                                                                    }}
                                                                                    title={role.description || role.code}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Required Permission Codes"
                                            helperText="Comma-separated permission codes (e.g. approval.requests.approve)"
                                            value={level.requiredPermissionCodes}
                                            onChange={(e) => updateMatrixLevel(index, 'requiredPermissionCodes', e.target.value)}
                                            disabled={saving}
                                            slotProps={{ htmlInput: { 'data-testid': `approval-matrix-required-permissions-input-${index}` } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    data-testid="approval-matrix-save-button"
                >
                    {saving ? 'Saving...' : 'Save Matrix'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
