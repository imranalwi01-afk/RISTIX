import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControlLabel,
    Switch,
    Typography,
    Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Type definition based on backend schema
export interface UserFormData {
    id?: string;
    email: string;
    fullName: string;
    username: string;
    password?: string;
    phone?: string;
    department?: string;
    position?: string;
    isActive?: boolean;
}

// Zod schemas for create and edit modes
const createUserSchema = z.object({
    email: z.string().email('Enter a valid email'),
    fullName: z.string().min(2, 'Name should be of minimum 2 characters length'),
    username: z.string().min(2, 'Username should be of minimum 2 characters length'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().default(true),
});

const editUserSchema = z.object({
    email: z.string().email('Enter a valid email'),
    fullName: z.string().min(2, 'Name should be of minimum 2 characters length'),
    username: z.string().min(2, 'Username should be of minimum 2 characters length'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().default(true),
});

type UserFormSchema = z.infer<typeof createUserSchema>;

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    initialData?: UserFormData | null;
    mode: 'create' | 'edit';
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    mode,
    loading = false,
}) => {
    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<UserFormSchema>({
        resolver: zodResolver((mode === 'create' ? createUserSchema : editUserSchema) as any),
        mode: 'onBlur',
        defaultValues: {
            email: '',
            fullName: '',
            username: '',
            password: '',
            phone: '',
            department: '',
            position: '',
            isActive: true,
        },
    });

    const onFormSubmit = (values: UserFormSchema) => {
        const submissionData: UserFormData = {
            ...values,
            id: initialData?.id
        };

        // Remove password if empty in edit mode
        if (mode === 'edit' && !values.password) {
            delete submissionData.password;
        }

        onSubmit(submissionData);
    };

    // Reset form when opening or changing initialData
    useEffect(() => {
        if (open) {
            if (initialData && mode === 'edit') {
                reset({
                    email: initialData.email || '',
                    fullName: initialData.fullName || '',
                    username: initialData.username || '',
                    password: '',
                    phone: initialData.phone || '',
                    department: initialData.department || '',
                    position: initialData.position || '',
                    isActive: initialData.isActive ?? true,
                });
            } else {
                reset({
                    email: '',
                    fullName: '',
                    username: '',
                    password: '',
                    phone: '',
                    department: '',
                    position: '',
                    isActive: true,
                });
            }
        }
    }, [open, initialData, mode, reset]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onFormSubmit)}>
                <DialogTitle>
                    {mode === 'create' ? 'Create New User' : 'Edit User'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>

                        <Grid size={12}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                Account Information
                            </Typography>
                        </Grid>

                        {/* Email */}
                        <Grid size={12}>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Email Address"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        disabled={mode === 'edit'}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Username */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Username"
                                        error={!!errors.username}
                                        helperText={errors.username?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Password */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label={mode === 'edit' ? "Password (Leave blank to keep)" : "Password"}
                                        type="password"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                Personal Details
                            </Typography>
                        </Grid>

                        {/* Full Name */}
                        <Grid size={12}>
                            <Controller
                                name="fullName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Full Name"
                                        error={!!errors.fullName}
                                        helperText={errors.fullName?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Phone */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Department */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Department"
                                        error={!!errors.department}
                                        helperText={errors.department?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Position */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="position"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Position"
                                        error={!!errors.position}
                                        helperText={errors.position?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Active Status */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box display="flex" alignItems="center" height="100%">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    color="primary"
                                                />
                                            }
                                            label={field.value ? "Active Account" : "Inactive Account"}
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || !isValid}
                    >
                        {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserForm;
