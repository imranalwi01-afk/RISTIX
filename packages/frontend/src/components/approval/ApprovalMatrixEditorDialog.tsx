import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { bankingAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

// Internal types mirrored from page.tsx logic
interface MatrixLevelEditor {
    level: number;
    name: string;
    requiredRoleCodes: string;
    requiredPermissionCodes: string;
    requiredCount: number;
    timeoutHours: string;
}

interface ApprovalMatrixEditorDialogProps {
    open: boolean;
    onClose: () => void;
    matrix?: any; // The raw matrix object to edit
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
                    requiredRoleCodes: formatCodeList(level.requiredRoleCodes),
                    requiredPermissionCodes: formatCodeList(level.requiredPermissionCodes),
                    requiredCount: Math.max(1, Number(level.requiredCount || 1)),
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
                requiredRoleCodes: '',
                requiredPermissionCodes: 'approval.requests.approve',
                requiredCount: 1,
                timeoutHours: ''
            }]);
        }
    }, [open, matrix]);

    const updateMatrixLevel = (
        index: number,
        field: keyof MatrixLevelEditor,
        value: string | number
    ) => {
        setLevels((prev) =>
            prev.map((level, levelIndex) =>
                levelIndex === index ? { ...level, [field]: value } : level
            )
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
                        requiredRoleCodes: parseCodeList(level.requiredRoleCodes),
                        requiredPermissionCodes: parseCodeList(level.requiredPermissionCodes),
                        requiredCount: Math.max(1, Number(level.requiredCount || 1)),
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
                                            inputProps={{ min: 1 }}
                                            value={level.requiredCount}
                                            onChange={(e) => updateMatrixLevel(index, 'requiredCount', Math.max(1, Number(e.target.value || 1)))}
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
                                        <TextField
                                            fullWidth
                                            label="Required Role Codes"
                                            helperText="Comma-separated role codes (e.g. CHECKER, APPROVER)"
                                            value={level.requiredRoleCodes}
                                            onChange={(e) => updateMatrixLevel(index, 'requiredRoleCodes', e.target.value)}
                                            disabled={saving}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Required Permission Codes"
                                            helperText="Comma-separated permission codes (e.g. approval.requests.approve)"
                                            value={level.requiredPermissionCodes}
                                            onChange={(e) => updateMatrixLevel(index, 'requiredPermissionCodes', e.target.value)}
                                            disabled={saving}
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
                >
                    {saving ? 'Saving...' : 'Save Matrix'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
