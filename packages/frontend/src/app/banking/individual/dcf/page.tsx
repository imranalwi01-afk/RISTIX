'use client';

import React, { useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Divider,
    Stepper,
    Step,
    StepLabel,
    Grid
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    TableChart as TableIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Save as SaveIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import PageHeader from '@/components/banking/shared/PageHeader';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

// --- Types ---
interface DcfRow {
    id: number;
    accountId: string;
    periodDate: string;
    cashflowAmount: number;
    discountRate: number;
    status: 'VALID' | 'INVALID';
    message?: string;
}

const STEPS = ['Select File', 'Validate Data', 'Upload'];

export default function DcfUploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [rows, setRows] = useState<DcfRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setActiveStep(1);
        }
    };

    const parseCsv = (text: string): DcfRow[] => {
        const lines = text.split('\n');
        const result: DcfRow[] = [];

        // Skip header (assuming row 0 is header)
        // Expected Header: ACCOUNT_ID,PERIOD_DATE,AMOUNT,RATE

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            if (cols.length < 3) continue; // Basic check

            const accountId = cols[0]?.trim();
            const periodDate = cols[1]?.trim();
            const amount = parseFloat(cols[2]?.trim());
            const rate = parseFloat(cols[3]?.trim()) || 0;

            let status: 'VALID' | 'INVALID' = 'VALID';
            let message = '';

            // Validation
            if (!accountId) { status = 'INVALID'; message += 'Missing Account ID. '; }
            if (isNaN(new Date(periodDate).getTime())) { status = 'INVALID'; message += 'Invalid Date. '; }
            if (isNaN(amount) || amount < 0) { status = 'INVALID'; message += 'Invalid Amount. '; }
            if (isNaN(rate) || rate < 0 || rate > 100) { status = 'INVALID'; message += 'Invalid Rate (0-100). '; }

            result.push({
                id: i,
                accountId,
                periodDate, // Keep as string for display
                cashflowAmount: amount || 0,
                discountRate: rate || 0,
                status,
                message
            });
        }
        return result;
    };

    const handleProcessFile = () => {
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsedRows = parseCsv(text);

                if (parsedRows.length === 0) {
                    setError("No valid rows found in file.");
                } else {
                    setRows(parsedRows);
                    setActiveStep(1); // Ready to validate/review
                }
            } catch (err) {
                setError("Failed to parse file.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        const validRows = rows.filter(r => r.status === 'VALID');
        if (validRows.length === 0) {
            setError("No valid rows to upload.");
            return;
        }

        setLoading(true);
        try {
            await api.individualImpairment.createBatchUpload({
                fileName: file?.name || 'unknown.csv',
                cashflows: validRows
            });
            setSuccess(`Successfully uploaded ${validRows.length} records.`);
            setActiveStep(3); // Done
            setRows([]); // Clear grid logic if needed, or keep for reference
        } catch (e: any) {
            setError(e.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setRows([]);
        setActiveStep(0);
        setError(null);
        setSuccess(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Columns ---
    const columns: GridColDef[] = [
        { field: 'accountId', headerName: 'Account ID', flex: 1 },
        { field: 'periodDate', headerName: 'Date', width: 150 },
        {
            field: 'cashflowAmount',
            headerName: 'Amount',
            width: 150,
            type: 'number',
            valueFormatter: (value) => {
                if (typeof value !== 'number') return value;
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            }
        },
        { field: 'discountRate', headerName: 'Rate (%)', width: 120, type: 'number' },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={params.value === 'VALID' ? 'success' : 'error'}
                    size="small"
                    icon={params.value === 'VALID' ? <CheckIcon /> : <ErrorIcon />}
                />
            )
        },
        { field: 'message', headerName: 'Issues', flex: 2, renderCell: (p) => <Typography variant="caption" color="error">{p.value}</Typography> }
    ];

    const validCount = rows.filter(r => r.status === 'VALID').length;
    const invalidCount = rows.length - validCount;

    return (
        <Container maxWidth="xl">
            <FullstackIndicator />
            <PageHeader
                title="DCF Upload"
                subtitle="Batch upload discounted cash flows for individual impairment."
            />

            <Box sx={{ width: '100%', mb: 4 }}>
                <Stepper activeStep={activeStep}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} action={
                    <Button size="small" onClick={() => router.push('/banking/individual/history/dcf-upload')}>
                        View History
                    </Button>
                }>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Step 1: File Selection */}
                <Grid size={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h6" gutterBottom>Upload CSV File</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Expected Format: AccountID, PeriodDate(YYYY-MM-DD), Amount, Rate
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<UploadIcon />}
                                        component="label"
                                    >
                                        Select File
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            hidden
                                            accept=".csv"
                                            onChange={handleFileSelect}
                                        />
                                    </Button>
                                    {file && (
                                        <Chip
                                            label={file.name}
                                            onDelete={handleReset}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )}
                                    <Button
                                        variant="contained"
                                        disabled={!file || activeStep > 0}
                                        onClick={handleProcessFile}
                                    >
                                        Process File
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Step 2: Validation Grid */}
                {rows.length > 0 && (
                    <Grid size={12}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box>
                                        <Typography variant="h6">Data Preview</Typography>
                                        <Stack direction="row" spacing={1} mt={0.5}>
                                            <Chip label={`${rows.length} Total`} size="small" />
                                            <Chip label={`${validCount} Valid`} color="success" size="small" />
                                            <Chip label={`${invalidCount} Invalid`} color={invalidCount > 0 ? "error" : "default"} size="small" />
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            color="inherit"
                                            onClick={handleReset}
                                            startIcon={<DeleteIcon />}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<SaveIcon />}
                                            disabled={validCount === 0 || loading || success !== null}
                                            onClick={handleUpload}
                                        >
                                            {loading ? 'Uploading...' : 'Upload Valid Records'}
                                        </Button>
                                    </Stack>
                                </Stack>

                                <Box sx={{ height: 500, width: '100%' }}>
                                    <SafeDataGrid
                                        rows={rows}
                                        columns={columns}
                                        disableRowSelectionOnClick
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}
