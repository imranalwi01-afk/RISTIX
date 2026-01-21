import React, { useEffect, useMemo } from 'react';
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
} from '@mui/material'; // Fixed imports
import { useFormik } from 'formik';
import * as yup from 'yup';

// Type definition based on backend schema
export interface UserFormData {
    id?: string;
    email: string;
    fullName: string;
    username: string;
    password?: string; // Optional for edit
    phone?: string;
    department?: string;
    position?: string;
    isActive?: boolean;
}

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
    const validationSchema = useMemo(() => {
        return yup.object({
            email: yup.string().email('Enter a valid email').required('Email is required'),
            fullName: yup.string().min(2, 'Name should be of minimum 2 characters length').required('Full Name is required'),
            username: yup.string().min(2, 'Username should be of minimum 2 characters length').required('Username is required'),
            password: yup.string().when([], {
                is: () => mode === 'create',
                then: (schema) => schema.min(8, 'Password must be at least 8 characters').required('Password is required'),
                otherwise: (schema) => schema.min(8, 'Password must be at least 8 characters')
            }),
            phone: yup.string().nullable(),
            department: yup.string().nullable(),
            position: yup.string().nullable(),
        });
    }, [mode]);

    const formik = useFormik({
        initialValues: {
            email: '',
            fullName: '',
            username: '',
            password: '',
            phone: '',
            department: '',
            position: '',
            isActive: true,
        },
        validationSchema: validationSchema,
        validateOnMount: false, // Don't validate on mount to avoid showing errors immediately
        enableReinitialize: true,
        onSubmit: (values) => {
            // Filter out empty strings for optional fields if needed, or backend handles it
            const submissionData: UserFormData = {
                ...values,
                id: initialData?.id
            };

            // Remove password if empty in edit mode
            if (mode === 'edit' && !values.password) {
                delete submissionData.password;
            }

            onSubmit(submissionData);
        },
    });

    // Reset form when opening or changing initialData
    useEffect(() => {
        if (open) {
            if (initialData && mode === 'edit') {
                formik.setValues({
                    email: initialData.email || '',
                    fullName: initialData.fullName || '',
                    username: initialData.username || '',
                    password: '', // Always blank for security
                    phone: initialData.phone || '',
                    department: initialData.department || '',
                    position: initialData.position || '',
                    isActive: initialData.isActive ?? true,
                });
            } else {
                formik.resetForm();
            }
        }
    }, [open, initialData, mode]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={formik.handleSubmit}>
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
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email Address"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                disabled={mode === 'edit'} // Often email is immutable or requires specific flow
                            />
                        </Grid>

                        {/* Username */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="username"
                                name="username"
                                label="Username"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.username && Boolean(formik.errors.username)}
                                helperText={formik.touched.username && formik.errors.username}
                            />
                        </Grid>

                        {/* Password */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label={mode === 'edit' ? "Password (Leave blank to keep)" : "Password"}
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                Personal Details
                            </Typography>
                        </Grid>

                        {/* Full Name */}
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                value={formik.values.fullName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                helperText={formik.touched.fullName && formik.errors.fullName}
                            />
                        </Grid>

                        {/* Phone */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="phone"
                                name="phone"
                                label="Phone Number"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                helperText={formik.touched.phone && formik.errors.phone}
                            />
                        </Grid>

                        {/* Department */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="department"
                                name="department"
                                label="Department"
                                value={formik.values.department}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.department && Boolean(formik.errors.department)}
                                helperText={formik.touched.department && formik.errors.department}
                            />
                        </Grid>

                        {/* Position */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="position"
                                name="position"
                                label="Position"
                                value={formik.values.position}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.position && Boolean(formik.errors.position)}
                                helperText={formik.touched.position && formik.errors.position}
                            />
                        </Grid>

                        {/* Active Status */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box display="flex" alignItems="center" height="100%">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.isActive}
                                            onChange={formik.handleChange}
                                            name="isActive"
                                            color="primary"
                                        />
                                    }
                                    label={formik.values.isActive ? "Active Account" : "Inactive Account"}
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
                        disabled={loading || !formik.isValid}
                    >
                        {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserForm;
