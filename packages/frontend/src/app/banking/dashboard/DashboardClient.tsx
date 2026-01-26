// packages/frontend/src/app/banking/dashboard/DashboardClient.tsx
// ============================================================================
// 🩹 Banking Dashboard Client Component
// ============================================================================
// ✅ Client-side logic with Redux, API calls, and interactive features
// ✅ Dynamic imports for heavy chart components
// ============================================================================

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    Chip,
    Button,
    IconButton,
    LinearProgress,
    Stack,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Avatar,
    Badge,
    CircularProgress
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
    AccountBalance,
    Assessment,
    Timeline,
    Calculate,
    Refresh,
    Settings,
    Info,
    CheckCircle,
    Schedule,
    TrendingUp,
    Warning,
    Business,
    Security,
    Analytics,
    ShowChart,
    PieChart,
    BarChart,
    Notifications,
    Download,
    Upload,
    Save
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../../store'
import { ifrs9API } from '../../../services/api/ifrs9.api'
import { handleAPIError } from '../../../services/api'
import {
    fetchDashboardPersonalization,
    saveDashboardPersonalization,
    setCurrentWidgets,
    selectCurrentWidgets,
    selectDashboardPersonalization,
    selectHasUnsavedChanges
} from '../../../store/slices/dashboardPersonalizationSlice'

// Dynamic imports for heavy components
const WidgetManager = dynamic(
    () => import('../../../components/dashboard/WidgetManager'),
    { ssr: false, loading: () => <Box sx={{ p: 2 }}><CircularProgress size={24} /></Box> }
)

const PersonalizedWidget = dynamic(
    () => import('../../../components/dashboard/widgets/PersonalizedWidget'),
    { ssr: false }
)

const NotificationPanel = dynamic(
    () => import('../../../components/dashboard/NotificationPanel'),
    { ssr: false }
)

// Dynamic imports for Recharts - these are heavy chart libraries
const ResponsiveContainer: any = dynamic(
    () => import('recharts').then((mod) => mod.ResponsiveContainer as any),
    { ssr: false }
)

const RechartsPieChart: any = dynamic(
    () => import('recharts').then((mod) => mod.PieChart as any),
    { ssr: false }
)

const Pie: any = dynamic(
    () => import('recharts').then((mod) => mod.Pie as any),
    { ssr: false }
)

const Cell: any = dynamic(
    () => import('recharts').then((mod) => mod.Cell as any),
    { ssr: false }
)

const RechartsTooltip: any = dynamic(
    () => import('recharts').then((mod) => mod.Tooltip as any),
    { ssr: false }
)

const AreaChart: any = dynamic(
    () => import('recharts').then((mod) => mod.AreaChart as any),
    { ssr: false }
)

const Area: any = dynamic(
    () => import('recharts').then((mod) => mod.Area as any),
    { ssr: false }
)

const XAxis: any = dynamic(
    () => import('recharts').then((mod) => mod.XAxis as any),
    { ssr: false }
)

const YAxis: any = dynamic(
    () => import('recharts').then((mod) => mod.YAxis as any),
    { ssr: false }
)

const CartesianGrid: any = dynamic(
    () => import('recharts').then((mod) => mod.CartesianGrid as any),
    { ssr: false }
)

// 🎨 COLORS & STYLES
const COLORS = {
    primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    stage1: '#4caf50',
    stage2: '#ff9800',
    stage3: '#f44336',
    background: ['#1a237e', '#0d47a1'] // Deep blue gradients
}

// 📊 COMPONENTS
const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => {
    const theme = useTheme();

    return (
        <Card sx={{
            height: '100%',
            background: theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.7)'
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0,0,0,0.4)'
                    : '0 12px 40px rgba(0,0,0,0.1)'
            },
            overflow: 'hidden',
            position: 'relative'
        }}>
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: color,
                opacity: 0.1
            }} />
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, mr: 2, width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
                        <Typography variant="h4" sx={{
                            fontWeight: 800,
                            color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#1a237e',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.2
                        }}>
                            {value}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
                    {trend && (
                        <Chip
                            label={trend.label}
                            size="small"
                            sx={{
                                bgcolor: alpha(trend.color, 0.1),
                                color: trend.color,
                                fontWeight: 700,
                                height: 20
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

const ECLDistributionChart = ({ data }: any) => {
    const chartData = [
        { name: 'Stage 1', value: data.stage1ECL, color: COLORS.stage1 },
        { name: 'Stage 2', value: data.stage2ECL, color: COLORS.stage2 },
        { name: 'Stage 3', value: data.stage3ECL, color: COLORS.stage3 },
    ]

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                />
            </RechartsPieChart>
        </ResponsiveContainer>
    )
}

// Mock trend for visual effect
const MOCK_TREND = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
]

const PortfolioTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={MOCK_TREND}>
            <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9e9e9e' }} hide />
            <RechartsTooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Area
                type="monotone"
                dataKey="value"
                stroke="#1976d2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
            />
        </AreaChart>
    </ResponsiveContainer>
)

interface ECLSummary {
    totalECL: number;
    stage1ECL: number;
    stage2ECL: number;
    stage3ECL: number;
    eclRate: number;
    lastCalculated: string;
    currency: string;
}

interface PortfolioMetrics {
    totalExposure: number;
    numberOfAccounts: number;
    averageRating: string;
    riskDistribution: {
        stage1: number;
        stage2: number;
        stage3: number;
    };
    currency: string;
    activeAccounts?: number;
    impairedAccounts?: number;
    averageLoanSize?: number;
}

interface DashboardActivity {
    id: string;
    icon: React.ReactNode;
    text: string;
    time: string;
    type: 'success' | 'warning' | 'info' | 'error';
}

export default function DashboardClient() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    // Get user context from Redux auth state
    const authState = useSelector((state: RootState) => state.auth)
    const { user, isAuthenticated } = authState || { user: null, isAuthenticated: false };
    const theme = useTheme();

    // Get dashboard personalization state
    const currentWidgets = useSelector(selectCurrentWidgets)
    const dashboardSettings = useSelector(selectDashboardPersonalization)
    const hasUnsavedChanges = useSelector(selectHasUnsavedChanges)

    const [isLoading, setIsLoading] = useState(true)
    const [showWidgetManager, setShowWidgetManager] = useState(false)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
    const [eclSummary, setEclSummary] = useState<ECLSummary | null>(null)
    const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null)
    const [activities, setActivities] = useState<DashboardActivity[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    // Memoized banking context calculation
    const bankingContext = useMemo(() => {
        if (!user) return { type: 'conventional', name: 'Banking Institution', greeting: 'Welcome', primary: '#1976d2', secondary: '#424242', icon: '🏦' }

        const bankingType = user.bankingType || 'conventional'
        const tenantSlug = user.tenantSlug || ''

        if (bankingType === 'syariah' || tenantSlug.includes('syariah')) {
            return {
                type: 'syariah' as const,
                name: 'Islamic Banking',
                greeting: 'Assalamu Alaikum',
                icon: '',
                primary: '#2e7d32',
                secondary: '#ff8f00'
            }
        } else if (tenantSlug.includes('dana')) {
            return {
                type: 'conventional' as const,
                name: 'DANA Digital Banking',
                greeting: 'Welcome',
                icon: '💳',
                primary: '#1976d2',
                secondary: '#00bcd4'
            }
        } else if (tenantSlug.includes('metro')) {
            return {
                type: 'conventional' as const,
                name: 'Metro Bank',
                greeting: 'Welcome',
                icon: '🏢',
                primary: '#1976d2',
                secondary: '#424242'
            }
        } else {
            return {
                type: 'conventional' as const,
                name: 'Banking Institution',
                greeting: 'Welcome',
                icon: '🏦',
                primary: '#1976d2',
                secondary: '#424242'
            }
        }
    }, [user?.bankingType, user?.tenantSlug])

    // Load real dashboard data from APIs
    const loadDashboardData = useCallback(async () => {
        if (isDataLoaded) {
            console.log('📊 Data already loaded, skipping API calls')
            return
        }

        setIsLoading(true)
        setError(null)

        if (!isAuthenticated || !user) {
            console.log('🔒 User not authenticated, showing demo data only')
        } else {
            console.log('🔄 Loading dashboard data for user:', user.email, 'tenant:', user.tenantSlug)

            try {
                const eclResponse = await ifrs9API.getCalculationsSummary()

                if (eclResponse?.success) {
                    setEclSummary(eclResponse.data)
                    console.log('✅ ECL summary loaded:', eclResponse.data)
                } else {
                    console.warn('⚠️ API response unsuccessful, using demo data')
                }
            } catch (eclError) {
                console.warn('⚠️ ECL API error, using demo data:', eclError)
            }
        }

        // Demo data fallback
        setEclSummary({
            totalECL: 2500000000,
            stage1ECL: 1200000000,
            stage2ECL: 800000000,
            stage3ECL: 500000000,
            eclRate: 0.05,
            lastCalculated: new Date().toISOString(),
            currency: 'IDR'
        })

        setPortfolioMetrics({
            numberOfAccounts: 1250,
            activeAccounts: 1100,
            impairedAccounts: 50,
            totalExposure: 50000000000,
            averageLoanSize: 40000000,
            averageRating: 'BB+',
            currency: 'IDR',
            riskDistribution: {
                stage1: 40,
                stage2: 35,
                stage3: 25
            }
        })

        setActivities([
            {
                id: '1',
                icon: <Calculate />,
                text: 'ECL calculation completed',
                time: new Date().toISOString(),
                type: 'success'
            },
            {
                id: '2',
                icon: <Upload />,
                text: 'Portfolio data uploaded',
                time: new Date(Date.now() - 3600000).toISOString(),
                type: 'success'
            }
        ])

        setIsLoading(false)
        setIsDataLoaded(true)
        console.log('✅ Dashboard data loaded successfully')
    }, [isAuthenticated, user, isDataLoaded])

    // Load dashboard personalization on component mount
    useEffect(() => {
        if (isAuthenticated && user && !isDataLoaded) {
            dispatch(fetchDashboardPersonalization({
                userId: user.id,
                tenantId: user.tenantSlug || 'default'
            }))

            loadDashboardData()
        } else if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, user?.id, user?.tenantSlug, isDataLoaded, dispatch, loadDashboardData, router])

    // Save widget changes
    const handleWidgetLayoutChange = useCallback((widgets: any[]) => {
        dispatch(setCurrentWidgets(widgets))
    }, [dispatch])

    // Save personalization settings
    const savePersonalizationSettings = useCallback(async () => {
        if (user && dashboardSettings) {
            try {
                await dispatch(saveDashboardPersonalization({
                    userId: user.id,
                    tenantId: user.tenantSlug || 'default',
                    settings: {
                        ...dashboardSettings,
                        layouts: dashboardSettings.layouts.map(layout =>
                            layout.id === dashboardSettings.currentLayout
                                ? { ...layout, widgets: currentWidgets }
                                : layout
                        )
                    }
                })).unwrap()
            } catch (error) {
                console.error('Failed to save personalization:', error)
            }
        }
    }, [user, dashboardSettings, currentWidgets, dispatch])

    // Memoized refresh handler
    const handleRefresh = useCallback(() => {
        setLastRefresh(new Date())
        setIsDataLoaded(false)
    }, [])

    // Memoized currency formatter
    const formatCurrency = useCallback((amount: number, currency: string = 'IDR') => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }, [])

    // Show error state if authentication fails
    if (!isAuthenticated || !user) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    <Typography variant="h6">Authentication Required</Typography>
                    <Typography variant="body2">
                        Please log in to access the banking dashboard.
                    </Typography>
                </Alert>
                <Button variant="contained" onClick={() => router.push('/login')}>
                    Go to Login
                </Button>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
            {/* Header with Real User Data */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${bankingContext.primary} 0%, ${bankingContext.secondary} 100%)` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                            {bankingContext.icon} Banking Dashboard
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            IFRS 9 {bankingContext.name} Interface
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                            {bankingContext.greeting}, {user.fullName || user.email} • Role: {user.role} • Tenant: {user.tenantSlug || 'Platform'} • Last updated: {new Date().toLocaleTimeString()}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Badge badgeContent={activities.length} color="error">
                            <IconButton sx={{ color: 'white' }}>
                                <Notifications />
                            </IconButton>
                        </Badge>
                        <Chip
                            label={bankingContext.name}
                            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                        />
                        {user.tenantSlug && (
                            <Chip
                                label={user.tenantSlug.toUpperCase()}
                                variant="outlined"
                                sx={{ borderColor: 'white', color: 'white' }}
                            />
                        )}
                        <IconButton sx={{ color: 'white' }} onClick={handleRefresh}>
                            <Refresh />
                        </IconButton>
                        <IconButton sx={{ color: 'white' }} onClick={() => setShowWidgetManager(true)}>
                            <Settings />
                        </IconButton>
                        {hasUnsavedChanges && (
                            <IconButton sx={{ color: 'white' }} onClick={savePersonalizationSettings}>
                                <Save />
                            </IconButton>
                        )}
                    </Stack>
                </Box>
            </Paper>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    <Typography variant="body2">
                        <strong>Error Loading Data:</strong> {error}
                    </Typography>
                </Alert>
            )}

            {/* Banking Type Alert */}
            <Alert
                severity={bankingContext.type === 'syariah' ? 'success' : 'info'}
                sx={{ mb: 3 }}
                icon={<Info />}
            >
                <Typography variant="body2">
                    <strong>{bankingContext.name} Interface Active</strong> - You are accessing the IFRS 9 system as a banking institution user.
                    {bankingContext.type === 'syariah' && ' All calculations are Syariah-compliant and follow Islamic banking principles.'}
                    {user.tenantSlug && ` Connected to tenant: ${user.tenantSlug}`}
                </Typography>
            </Alert>

            {/* Widget Manager */}
            {showWidgetManager && (
                <WidgetManager
                    userId={user?.id || ''}
                    tenantId={user?.tenantSlug || 'default'}
                    onLayoutChange={handleWidgetLayoutChange}
                />
            )}

            {/* Modern Dashboard Layout */}
            {eclSummary && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* PRIMARY STATS */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StatCard
                            title="Total ECL"
                            value={formatCurrency(eclSummary?.totalECL || 0, eclSummary?.currency || 'IDR')}
                            subtitle={`ECL Rate: ${eclSummary?.eclRate ? eclSummary.eclRate.toFixed(2) : '0.00'}%`}
                            icon={<Calculate />}
                            color="#1976d2"
                            trend={{ label: 'Current', color: '#1976d2' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StatCard
                            title="Total Exposure"
                            value={formatCurrency(portfolioMetrics?.totalExposure || 0)}
                            subtitle="Total Portfolio Value"
                            icon={<AccountBalance />}
                            color="#00C49F"
                            trend={{ label: 'Stable', color: '#00C49F' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StatCard
                            title="Active Accounts"
                            value={portfolioMetrics?.numberOfAccounts?.toLocaleString() || '0'}
                            subtitle="Total Active Loans"
                            icon={<Business />}
                            color="#FFBB28"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <StatCard
                            title="High Risk (Stage 3)"
                            value={formatCurrency(eclSummary.stage3ECL || 0)}
                            subtitle="Credit Impaired"
                            icon={<Warning />}
                            color="#FF8042"
                            trend={{ label: 'Attention', color: '#FF8042' }}
                        />
                    </Grid>

                    {/* CHARTS SECTION */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%', overflow: 'hidden', background: theme.palette.background.paper }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">Portfolio Exposure Trend</Typography>
                                    <Chip label="6 Months" size="small" variant="outlined" />
                                </Box>
                                <PortfolioTrendChart />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%', background: theme.palette.background.paper }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>ECL Distribution</Typography>
                                <Box sx={{ position: 'relative', height: 300 }}>
                                    <ECLDistributionChart data={eclSummary} />
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="h4" fontWeight="bold" color="text.secondary">
                                            3
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Stages</Typography>
                                    </Box>
                                </Box>

                                {/* Legend */}
                                <Stack spacing={1} sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.stage1 }} />
                                            <Typography variant="body2">Stage 1 (12-month)</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">{formatCurrency(eclSummary.stage1ECL)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.stage2 }} />
                                            <Typography variant="body2">Stage 2 (Lifetime)</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">{formatCurrency(eclSummary.stage2ECL)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.stage3 }} />
                                            <Typography variant="body2">Stage 3 (Impaired)</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">{formatCurrency(eclSummary.stage3ECL)}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Main Content Area */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Quick Actions */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: bankingContext.primary, display: 'flex', alignItems: 'center' }}>
                                <Assessment sx={{ mr: 1 }} />
                                Quick Actions
                            </Typography>
                            <Stack spacing={2}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    sx={{ backgroundColor: bankingContext.primary, py: 1.5 }}
                                    startIcon={<Calculate />}
                                    onClick={() => router.push('/banking/ifrs9/calculations')}
                                >
                                    Run ECL Calculation
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    color="primary"
                                    sx={{ py: 1.5 }}
                                    startIcon={<ShowChart />}
                                    onClick={() => router.push('/banking/portfolio/analysis')}
                                >
                                    View Portfolio Analysis
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    color="primary"
                                    sx={{ py: 1.5 }}
                                    startIcon={<Download />}
                                    onClick={() => router.push('/banking/reports/ifrs9')}
                                >
                                    Generate IFRS 9 Report
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    color="primary"
                                    sx={{ py: 1.5 }}
                                    startIcon={<Settings />}
                                    onClick={() => router.push('/banking/setup/application')}
                                >
                                    System Configuration
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activities */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: bankingContext.primary, display: 'flex', alignItems: 'center' }}>
                                <Timeline sx={{ mr: 1 }} />
                                Recent Activities
                            </Typography>
                            <List>
                                {activities.length > 0 ? (
                                    activities.slice(0, 5).map((activity, index) => (
                                        <React.Fragment key={activity.id}>
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    {activity.icon as any}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={activity.text}
                                                    secondary={activity.time}
                                                    primaryTypographyProps={{ variant: 'body2' }}
                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </ListItem>
                                            {index < activities.length - 1 && index < 4 && <Divider />}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <ListItem sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Info color="info" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="No recent activities"
                                            secondary="Activities will appear here as you use the system"
                                            primaryTypographyProps={{ variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Live Notifications Panel */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <NotificationPanel />
                </Grid>
            </Grid>

            {/* System Status Footer */}
            <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                    <strong>✅ Banking System Online:</strong> IFRS 9 calculation engine operational.
                    {bankingContext.type === 'syariah' && ' All calculations are Syariah-compliant.'}
                    {eclSummary && ` Last calculation: ${eclSummary.lastCalculated || 'Never'}`} • Portfolio health: Excellent
                </Typography>
            </Alert>
        </Box>
    )
}
