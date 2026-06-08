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
    Alert,
    Avatar,
    Tooltip,
} from '@mui/material';
import {
    Save as SaveIcon,
    Article as ArticleIcon,
    AccountBalance as BankingIcon,
    Build as BuildIcon,
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { bankingAPI, api } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

interface MatrixLevelEditor {
    level: number;
    name: string;
    requiredRoleCodes: string[];
    requiredPermissionCodes: string[];
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

interface PermissionOption {
    code: string;
    label: string;
    description?: string;
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
    entityType?: string;
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

const ENTITY_TYPES = [
    { value: 'user', label: 'User Management', icon: <SecurityIcon />, desc: 'Create, update, delete user accounts and profiles' },
    { value: 'configuration', label: 'Application Settings', icon: <SettingsIcon />, desc: 'Modify system-wide application configuration and settings' },
    { value: 'parameter', label: 'Business Parameters', icon: <ArticleIcon />, desc: 'Change business rules, rates, and reference data' },
    { value: 'product_parameter', label: 'Product Settings', icon: <BankingIcon />, desc: 'Configure loan products, pricing, and product parameters' },
    { value: 'journal_parameter', label: 'Journal Settings', icon: <ArticleIcon />, desc: 'Configure accounting journal entries and mapping rules' },
    { value: 'segmentation', label: 'Segmentation Rules', icon: <BuildIcon />, desc: 'Manage portfolio segmentation criteria and buckets' },
    { value: 'rule_base_setting', label: 'Rule Base Settings', icon: <BuildIcon />, desc: 'Configure IFRS9 staging and rule base logic' },
    { value: 'bucket_parameter', label: 'Bucket Parameters', icon: <BuildIcon />, desc: 'Define collective impairment bucket thresholds' },
    { value: 'pd_configuration', label: 'PD Configuration', icon: <BuildIcon />, desc: 'Set Probability of Default models and parameters' },
    { value: 'lgd_configuration', label: 'LGD Configuration', icon: <BuildIcon />, desc: 'Set Loss Given Default models and parameters' },
    { value: 'ead_configuration', label: 'EAD Configuration', icon: <BuildIcon />, desc: 'Set Exposure at Default models and parameters' },
    { value: 'ecl_configuration', label: 'ECL Configuration', icon: <BuildIcon />, desc: 'Configure Expected Credit Loss calculation rules' },
    { value: 'fl_scalar', label: 'FL Scalar', icon: <BuildIcon />, desc: 'Configure forward-looking scalar adjustments' },
];

const LEVEL_TEMPLATES: Record<string, { name: string; permissionHint: string }[]> = {
    user: [
        { name: 'Maker', permissionHint: 'Approval for creating user changes' },
        { name: 'Checker', permissionHint: 'Review and verify user changes' },
        { name: 'Approver', permissionHint: 'Final approval for user changes' },
    ],
    configuration: [
        { name: 'Inputter', permissionHint: 'Submit configuration changes' },
        { name: 'Reviewer', permissionHint: 'Verify configuration accuracy' },
        { name: 'Authorizer', permissionHint: 'Authorize configuration deployment' },
    ],
    parameter: [
        { name: 'Inputter', permissionHint: 'Submit parameter updates' },
        { name: 'Reviewer', permissionHint: 'Review parameter changes' },
        { name: 'Authorizer', permissionHint: 'Approve parameter changes' },
    ],
};

const toCodeArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return Array.from(new Set(value.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean)));
    }
    if (typeof value === 'string') {
        return Array.from(new Set(value.split(',').map((s) => s.trim()).filter(Boolean)));
    }
    return [];
};

const clampRequiredCount = (count: number, roleCount: number): number => {
    const normalizedCount = Math.max(1, Number(count || 1));
    if (roleCount > 0) return Math.min(normalizedCount, roleCount);
    return normalizedCount;
};

const extractRoleRecords = (input: unknown): Record<string, unknown>[] => {
    if (Array.isArray(input)) return input.filter((e): e is Record<string, unknown> => !!e && typeof e === 'object');
    if (!input || typeof input !== 'object') return [];
    const record = input as Record<string, unknown>;
    for (const key of ['roles', 'items', 'results', 'data']) {
        const val = record[key];
        if (Array.isArray(val)) return val.filter((e): e is Record<string, unknown> => !!e && typeof e === 'object');
    }
    if (record.data && typeof record.data === 'object') {
        const nested = record.data as Record<string, unknown>;
        for (const key of ['roles', 'items', 'results']) {
            const val = nested[key];
            if (Array.isArray(val)) return val.filter((e): e is Record<string, unknown> => !!e && typeof e === 'object');
        }
    }
    return [];
};

const normalizeRoleOptions = (input: unknown): RoleOption[] => {
    const map = new Map<string, RoleOption>();
    extractRoleRecords(input).forEach((role) => {
        const code = String(role.roleCode ?? role.role_code ?? role.code ?? role.name ?? role.roleName ?? role.role_name ?? '').trim();
        if (!code) return;
        const label = String(role.displayName ?? role.display_name ?? role.roleName ?? role.role_name ?? role.name ?? role.roleCode ?? role.role_code ?? code).trim();
        const hl = role.hierarchyLevel ?? role.hierarchy_level;
        const hierarchyLevel = (typeof hl === 'number' && Number.isFinite(hl)) ? hl : null;
        const description = typeof role.description === 'string' ? role.description.trim() : '';
        if (!map.has(code)) {
            map.set(code, { code, label: label || code, description: description || undefined, hierarchyLevel, levelLabel: hierarchyLevel == null ? 'Unassigned hierarchy' : `Hierarchy ${hierarchyLevel}` });
        }
    });
    return Array.from(map.values()).sort((a, b) => (b.hierarchyLevel ?? -Infinity) - (a.hierarchyLevel ?? -Infinity) || a.label.localeCompare(b.label));
};

export const ApprovalMatrixEditorDialog: React.FC<ApprovalMatrixEditorDialogProps> = ({ open, onClose, matrix, onSuccess, onError }) => {
    const [name, setName] = useState('');
    const [entityType, setEntityType] = useState('configuration');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [levels, setLevels] = useState<MatrixLevelEditor[]>([]);
    const [saving, setSaving] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);

    const roleLabelMap = useMemo(() => new Map(availableRoles.map((r) => [r.code, r.label])), [availableRoles]);
    const rolesByHierarchy = useMemo(() => {
        const grouped = new Map<string, RoleOption[]>();
        availableRoles.forEach((r) => {
            const key = r.levelLabel;
            grouped.set(key, [...(grouped.get(key) || []), r]);
        });
        return Array.from(grouped.entries())
            .map(([k, v]) => ({ groupLabel: k, hierarchyLevel: v[0]?.hierarchyLevel ?? null, roles: v.sort((a, b) => a.label.localeCompare(b.label)) }))
            .sort((a, b) => (b.hierarchyLevel ?? -Infinity) - (a.hierarchyLevel ?? -Infinity));
    }, [availableRoles]);

    const resolveRoles = (codes: string[]): RoleOption[] =>
        codes.map((code) => availableRoles.find((r) => r.code === code) || { code, label: code, levelLabel: 'Unavailable roles', hierarchyLevel: null });

    const entityCfg = ENTITY_TYPES.find((e) => e.value === entityType);

    useEffect(() => {
        if (open && matrix) {
            setName(matrix.name || '');
            setDescription(matrix.description || '');
            setEntityType(matrix.entityType || 'configuration');
            setIsActive(Boolean(matrix.isActive ?? true));
            const initialLevels = [...(matrix.levels || [])].sort((a, b) => (a.level || 0) - (b.level || 0)).map((level) => ({
                level: Number(level.level || 0),
                name: String(level.name || `Level ${level.level || '-'}`),
                requiredRoleCodes: toCodeArray(level.requiredRoleCodes ?? level.required_role_codes ?? level.requiredRoles),
                requiredPermissionCodes: toCodeArray(level.requiredPermissionCodes),
                requiredCount: clampRequiredCount(Number(level.requiredCount || level.required_count || 1), toCodeArray(level.requiredRoleCodes ?? level.required_role_codes ?? level.requiredRoles).length),
                timeoutHours: level.timeoutHours == null ? '' : String(level.timeoutHours),
            }));
            setLevels(initialLevels);
        } else if (open && !matrix) {
            setName('');
            setDescription('');
            setEntityType('configuration');
            setIsActive(true);
            setLevels([{ level: 1, name: 'Level 1', requiredRoleCodes: [], requiredPermissionCodes: ['approval.requests.approve'], requiredCount: 1, timeoutHours: '' }]);
        }
    }, [open, matrix]);

    useEffect(() => {
        if (!open) return;
        const loadRoles = async () => {
            try {
                setRolesLoading(true);
                const [rolesRes, permsRes] = await Promise.all([
                    api.roles.getAll({ limit: 500 }),
                    (api.roles as any).getPermissions({ limit: 500 }).catch(() => null),
                ]);
                setAvailableRoles(normalizeRoleOptions(rolesRes));
                if (permsRes) {
                    const perms = Array.isArray(permsRes) ? permsRes : Array.isArray((permsRes as any).data) ? (permsRes as any).data : [];
                    setAvailablePermissions(perms.map((p: any) => ({ code: p.code || p, label: p.name || p.code || p, description: p.description })));
                }
            } catch (error) {
                console.error('Error loading roles:', error);
                onError(getErrorMessage(error, 'Failed to load roles.'), 'warning');
            } finally {
                setRolesLoading(false);
            }
        };
        void loadRoles();
    }, [open, onError]);

    const updateLevel = (index: number, field: keyof MatrixLevelEditor, value: any) => {
        setLevels((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
    };

    const updateLevelRoles = (index: number, selectedCodes: string[]) => {
        const normalized = toCodeArray(selectedCodes);
        setLevels((prev) => prev.map((l, i) => i !== index ? l : { ...l, requiredRoleCodes: normalized, requiredCount: clampRequiredCount(l.requiredCount, normalized.length) }));
    };

    const applyTemplate = () => {
        const template = LEVEL_TEMPLATES[entityType];
        if (!template) return;
        setLevels(template.map((t, i) => ({
            level: i + 1,
            name: t.name,
            requiredRoleCodes: [],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
            timeoutHours: '',
        })));
    };

    const addLevel = () => {
        const next = levels.length + 1;
        setLevels([...levels, { level: next, name: `Level ${next}`, requiredRoleCodes: [], requiredPermissionCodes: ['approval.requests.approve'], requiredCount: 1, timeoutHours: '' }]);
    };

    const removeLevel = (index: number) => {
        setLevels(levels.filter((_, i) => i !== index).map((l, i) => ({ ...l, level: i + 1 })));
    };

    const handleSave = async () => {
        if (!matrix?.id && !name.trim()) return;
        try {
            setSaving(true);
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                isActive,
                levels: levels.sort((a, b) => a.level - b.level).map((l) => ({
                    level: Math.max(1, Number(l.level || 1)),
                    name: String(l.name || `Level ${l.level || '-'}`).trim(),
                    requiredRoleCodes: toCodeArray(l.requiredRoleCodes),
                    requiredPermissionCodes: l.requiredPermissionCodes,
                    requiredCount: clampRequiredCount(Number(l.requiredCount || 1), toCodeArray(l.requiredRoleCodes).length),
                    timeoutHours: l.timeoutHours === '' ? undefined : Math.max(1, Number(l.timeoutHours)),
                })),
            };
            if (matrix?.id) {
                await bankingAPI.approval.updateMatrix(matrix.id, payload);
            } else {
                await bankingAPI.approval.createMatrix({ ...payload, entityType });
            }
            onSuccess();
        } catch (error) {
            onError(getErrorMessage(error, 'Failed to save approval matrix.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}><SettingsIcon /></Avatar>
                    <Box>
                        <Typography variant="h6">{matrix?.id ? 'Edit Approval Matrix' : 'Create Approval Matrix'}</Typography>
                        <Typography variant="body2" color="text.secondary">Configure approval workflow for changes</Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        {/* Entity Type */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Entity Type</InputLabel>
                                <Select
                                    label="Entity Type"
                                    value={entityType}
                                    onChange={(e) => { setEntityType(e.target.value); applyTemplate(); }}
                                    disabled={saving}
                                    renderValue={(val) => {
                                        const cfg = ENTITY_TYPES.find((e) => e.value === val);
                                        return cfg ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {cfg.icon}
                                                <Typography variant="body2">{cfg.label}</Typography>
                                            </Stack>
                                        ) : val;
                                    }}
                                >
                                    {ENTITY_TYPES.filter((e) => e.value !== 'user' || matrix?.entityType === 'user').map((e) => (
                                        <MenuItem key={e.value} value={e.value}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ color: 'text.secondary', display: 'flex' }}>{e.icon}</Box>
                                                <Box>
                                                    <Typography variant="body2">{e.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{e.desc}</Typography>
                                                </Box>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Matrix Name */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth label="Matrix Name" value={name}
                                onChange={(e) => setName(e.target.value)} disabled={saving}
                                placeholder={entityCfg ? `${entityCfg.label} Approval` : ''}
                            />
                        </Grid>

                        {/* Status */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')} disabled={saving}>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField fullWidth label="Description" multiline minRows={1} value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
                        </Grid>

                        {/* Entity description */}
                        {entityCfg && (
                            <Grid size={12}>
                                <Alert severity="info" variant="outlined" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2"><strong>{entityCfg.label}:</strong> {entityCfg.desc}</Typography>
                                        {!matrix?.id && LEVEL_TEMPLATES[entityType] && (
                                            <Button size="small" variant="outlined" onClick={applyTemplate}>
                                                Apply {LEVEL_TEMPLATES[entityType].length}-Level Template
                                            </Button>
                                        )}
                                    </Stack>
                                </Alert>
                            </Grid>
                        )}
                    </Grid>

                    {/* Approval Levels */}
                    <Box sx={{ mt: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Approval Levels <Chip label={levels.length} size="small" variant="outlined" sx={{ ml: 1 }} />
                            </Typography>
                            <Button size="small" startIcon={<AddIcon />} onClick={addLevel} disabled={saving}>
                                Add Level
                            </Button>
                        </Stack>

                        {levels.length === 0 && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                No approval levels configured. Click <strong>Apply Template</strong> above or <strong>Add Level</strong> to start.
                            </Alert>
                        )}

                        {levels.map((level, index) => (
                            <Paper key={`level-${index}`} variant="outlined" sx={{ p: 2, mb: 1.5, position: 'relative', borderLeft: 3, borderLeftColor: 'primary.main' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                                            {level.level}
                                        </Avatar>
                                        <Typography variant="subtitle2">Level {level.level}</Typography>
                                    </Stack>
                                    {levels.length > 1 && (
                                        <Tooltip title="Remove level">
                                            <Button size="small" color="error" onClick={() => removeLevel(index)} disabled={saving}>
                                                <DeleteIcon fontSize="small" />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </Stack>

                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField fullWidth label="Name" value={level.name} onChange={(e) => updateLevel(index, 'name', e.target.value)} disabled={saving} />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2 }}>
                                        <TextField fullWidth label="Required Count" type="number" inputProps={{ min: 1, max: level.requiredRoleCodes.length || undefined }}
                                            value={level.requiredCount} onChange={(e) => updateLevel(index, 'requiredCount', clampRequiredCount(Number(e.target.value || 1), level.requiredRoleCodes.length))}
                                            disabled={saving} />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2 }}>
                                        <TextField fullWidth label="Timeout (Hrs)" type="number" inputProps={{ min: 1 }} value={level.timeoutHours}
                                            onChange={(e) => updateLevel(index, 'timeoutHours', e.target.value)} disabled={saving} />
                                    </Grid>

                                    {/* Required Roles */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Autocomplete
                                            multiple disableCloseOnSelect options={availableRoles} groupBy={(o) => o.levelLabel}
                                            value={resolveRoles(level.requiredRoleCodes)}
                                            onChange={(_, selected) => updateLevelRoles(index, selected.map((r) => r.code))}
                                            loading={rolesLoading} disabled={saving || rolesLoading}
                                            isOptionEqualToValue={(o, v) => o.code === v.code} getOptionLabel={(o) => o.label}
                                            renderInput={(params) => <TextField {...params} label="Required Roles" placeholder="Search roles..." helperText={rolesLoading ? 'Loading...' : availableRoles.length === 0 ? 'No roles available' : ''} />}
                                            renderOption={(props, option, { selected }) => (
                                                <Box component="li" {...props}>
                                                    <Checkbox sx={{ mr: 1 }} checked={selected} />
                                                    <ListItemText primary={option.label} secondary={`${option.code}${option.hierarchyLevel == null ? '' : ` • Level ${option.hierarchyLevel}`}`} />
                                                </Box>
                                            )}
                                            renderTags={(selected, getTagProps) => selected.map((role, i) => (
                                                <Chip {...getTagProps({ index: i })} key={role.code} size="small" label={roleLabelMap.get(role.code) || role.code} />
                                            ))}
                                        />
                                    </Grid>

                                    {/* Role Hierarchy Quick Pick */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper variant="outlined" sx={{ p: 1.25, borderStyle: 'dashed', minHeight: 100, maxHeight: 160, overflow: 'auto' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
                                                Click to toggle roles
                                            </Typography>
                                            {rolesByHierarchy.map((group) => (
                                                <Box key={group.groupLabel} sx={{ mb: 1 }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>{group.groupLabel}</Typography>
                                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                        {group.roles.map((role) => {
                                                            const selected = level.requiredRoleCodes.includes(role.code);
                                                            return (
                                                                <Chip key={role.code} label={role.label} size="small"
                                                                    variant={selected ? 'filled' : 'outlined'} color={selected ? 'primary' : 'default'}
                                                                    onClick={() => updateLevelRoles(index, selected ? level.requiredRoleCodes.filter((c) => c !== role.code) : [...level.requiredRoleCodes, role.code])}
                                                                />
                                                            );
                                                        })}
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Paper>
                                    </Grid>

                                    {/* Required Permission Codes */}
                                    <Grid size={12}>
                                        <Autocomplete
                                            multiple disableCloseOnSelect freeSolo
                                            options={availablePermissions.map((p) => p.code)}
                                            value={level.requiredPermissionCodes}
                                            onChange={(_, val) => updateLevel(index, 'requiredPermissionCodes', val.map((v: string) => v.trim()).filter(Boolean))}
                                            disabled={saving}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Required Permission Codes"
                                                    helperText="Type or select permission codes. These determine what action this level can approve."
                                                    placeholder="e.g. approval.requests.approve" />
                                            )}
                                            renderTags={(selected, getTagProps) => selected.map((code, i) => {
                                                const perm = availablePermissions.find((p) => p.code === code);
                                                return <Chip {...getTagProps({ index: i })} key={code} size="small" label={perm ? perm.label : code} />;
                                            })}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                    {levels.length} level{levels.length !== 1 ? 's' : ''} · {isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? 'Saving...' : 'Save Matrix'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
