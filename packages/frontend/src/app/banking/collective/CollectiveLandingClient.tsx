'use client';
// packages/frontend/src/app/banking/collective/CollectiveLandingClient.tsx

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Breadcrumbs,
    Link,
    Chip,
} from '@mui/material';
import {
    Assessment as PdIcon,
    AccountBalance as LgdIcon,
    TrendingUp as EadIcon,
    Category as BucketIcon,
    People as SegmentIcon,
    TableChart as RuleBaseIcon,
    Psychology as FlScalarIcon,
    Calculate as EclIcon,
    Home as HomeIcon,
    AccountBalanceWallet as ConventionalIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface CollectiveLandingClientProps {
    mode?: string;
}

const sections = [
    {
        title: 'PD Setup',
        description: 'Configure Probability of Default models, methods, bucket groups, and migration intervals.',
        href: '/banking/collective/pd-setup',
        icon: PdIcon,
        color: '#1976d2',
        badge: 'B0018 • B0019',
    },
    {
        title: 'LGD Setup',
        description: 'Configure Loss Given Default models, workout periods, and FL scalar linkage.',
        href: '/banking/collective/lgd-setup',
        icon: LgdIcon,
        color: '#388e3c',
        badge: 'B0022 • B0023',
    },
    {
        title: 'EAD Setup',
        description: 'Configure Exposure at Default parameters and credit conversion factors.',
        href: '/banking/collective/ead-setup',
        icon: EadIcon,
        color: '#f57c00',
        badge: null,
    },
    {
        title: 'Bucket Parameter',
        description: 'Define bucket groups and DPD ranges used in PD staging and migration analysis.',
        href: '/banking/collective/bucket',
        icon: BucketIcon,
        color: '#7b1fa2',
        badge: null,
    },
    {
        title: 'Segmentation',
        description: 'Set up portfolio segmentation rules for collective impairment grouping.',
        href: '/banking/collective/segmentation',
        icon: SegmentIcon,
        color: '#c62828',
        badge: null,
    },
    {
        title: 'Rule Base Settings',
        description: 'Configure rule-based parameters including GL groups and classification rules.',
        href: '/banking/collective/rule-base',
        icon: RuleBaseIcon,
        color: '#00838f',
        badge: null,
    },
    {
        title: 'FL Scalar',
        description: 'Configure Forward-Looking scalar adjustments for macroeconomic overlay.',
        href: '/banking/collective/fl-scalar',
        icon: FlScalarIcon,
        color: '#558b2f',
        badge: null,
    },
    {
        title: 'ECL Configuration',
        description: 'Configure Expected Credit Loss calculation parameters and scenarios.',
        href: '/banking/collective/ecl-config',
        icon: EclIcon,
        color: '#ad1457',
        badge: null,
    },
];

export default function CollectiveLandingClient({ mode = 'conventional' }: CollectiveLandingClientProps) {
    const router = useRouter();

    return (
        <Container maxWidth="xl">
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HomeIcon fontSize="small" />
                    Dashboard
                </Link>
                <Typography color="text.primary">Collective Impairment</Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Collective Impairment
                    </Typography>
                    <Chip
                        label="Conventional"
                        color="primary"
                        size="small"
                        variant="outlined"
                    />
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage collective impairment models, parameters, and calculations for IFRS 9 compliance.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Grid key={section.href} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: section.color,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 20px ${section.color}22`,
                                    },
                                }}
                            >
                                <CardActionArea
                                    onClick={() => router.push(`${section.href}?mode=${mode}`)}
                                    sx={{ height: '100%', p: 0 }}
                                >
                                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {/* Icon + Badge Row */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    backgroundColor: `${section.color}18`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Icon sx={{ color: section.color, fontSize: 26 }} />
                                            </Box>
                                            {section.badge && (
                                                <Chip
                                                    label={section.badge}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '10px', height: 20, borderColor: section.color, color: section.color }}
                                                />
                                            )}
                                        </Box>

                                        {/* Title */}
                                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                            {section.title}
                                        </Typography>

                                        {/* Description */}
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, flex: 1 }}>
                                            {section.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
}
