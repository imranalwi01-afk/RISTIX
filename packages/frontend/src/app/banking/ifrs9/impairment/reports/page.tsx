'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    Breadcrumbs,
    Link,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Download as DownloadIcon,
    Assessment as AssessmentIcon,
    TableChart as TableChartIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('ecl-summary');
    const [reportPeriod, setReportPeriod] = useState('current');
    const [reportFormat, setReportFormat] = useState('xlsx');

    const handleExport = () => {
        console.log('Exporting report:', { reportType, reportPeriod, reportFormat });
        // Implementation for report export
    };

    const reports = [
        {
            id: 'ecl-summary',
            title: 'ECL Summary Report',
            description: 'Comprehensive ECL calculation summary with stage breakdown',
            icon: <AssessmentIcon />
        },
        {
            id: 'staging-analysis',
            title: 'Staging Analysis Report',
            description: 'Stage transition analysis and migration trends',
            icon: <TableChartIcon />
        },
        {
            id: 'provision-detail',
            title: 'Provision Detail Report',
            description: 'Detailed provision breakdown by account and segment',
            icon: <TableChartIcon />
        },
        {
            id: 'watchlist',
            title: 'Watchlist Report',
            description: 'Individual impairment watchlist with assessment status',
            icon: <AssessmentIcon />
        },
        {
            id: 'coverage-analysis',
            title: 'Coverage Analysis Report',
            description: 'ECL coverage ratio analysis by portfolio and stage',
            icon: <AssessmentIcon />
        },
        {
            id: 'regulatory',
            title: 'Regulatory Report',
            description: 'IFRS 9 regulatory reporting format',
            icon: <PdfIcon />
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box mb={3}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link color="inherit" href="/banking">Banking</Link>
                    <Link color="inherit" href="/banking/ifrs9">IFRS 9</Link>
                    <Link color="inherit" href="/banking/ifrs9/impairment">Impairment</Link>
                    <Typography color="text.primary">Reports</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Impairment Reports
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Generate and export IFRS 9 impairment reports in various formats.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Available Reports
                            </Typography>
                            <List>
                                {reports.map((report, index) => (
                                    <React.Fragment key={report.id}>
                                        <ListItem
                                            button
                                            selected={reportType === report.id}
                                            onClick={() => setReportType(report.id)}
                                        >
                                            <ListItemIcon>{report.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={report.title}
                                                secondary={report.description}
                                            />
                                        </ListItem>
                                        {index < reports.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Report Options
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Report Period</InputLabel>
                                <Select
                                    value={reportPeriod}
                                    label="Report Period"
                                    onChange={(e) => setReportPeriod(e.target.value)}
                                >
                                    <MenuItem value="current">Current Period</MenuItem>
                                    <MenuItem value="previous">Previous Period</MenuItem>
                                    <MenuItem value="ytd">Year to Date</MenuItem>
                                    <MenuItem value="custom">Custom Range</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Export Format</InputLabel>
                                <Select
                                    value={reportFormat}
                                    label="Export Format"
                                    onChange={(e) => setReportFormat(e.target.value)}
                                >
                                    <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                                    <MenuItem value="csv">CSV (.csv)</MenuItem>
                                    <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                                size="large"
                            >
                                Generate Report
                            </Button>

                            <Alert severity="info" sx={{ mt: 2 }}>
                                Reports are generated based on the latest available data in the system.
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Button variant="outlined" fullWidth>
                                    Schedule Report
                                </Button>
                                <Button variant="outlined" fullWidth>
                                    View History
                                </Button>
                                <Button variant="outlined" fullWidth>
                                    Report Templates
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
