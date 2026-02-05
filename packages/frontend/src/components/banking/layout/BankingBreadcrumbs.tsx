import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Breadcrumbs,
    Typography,
    Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';

interface BankingBreadcrumbsProps {
    drawerWidth: number;
    appBarHeight: number;
}

export const BankingBreadcrumbs: React.FC<BankingBreadcrumbsProps> = ({
    drawerWidth,
    appBarHeight
}) => {
    const theme = useTheme();
    const pathname = usePathname();
    const router = useRouter();

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const pathSegments = (pathname || '').split('/').filter(segment => segment !== '');
        const breadcrumbs: { label: string; href?: string; icon?: React.ReactNode; isLast?: boolean }[] = [];

        breadcrumbs.push({
            label: 'Banking Dashboard',
            href: '/banking/dashboard',
            icon: <HomeIcon sx={{ mr: 0.5, fontSize: 14 }} />
        });

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            if (index === 0 && segment === 'banking') {
                return;
            }

            const isLast = index === pathSegments.length - 1;
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');

            breadcrumbs.push({
                label,
                href: isLast ? undefined : currentPath,
                isLast
            });
        });

        return breadcrumbs;
    };

    return (
        <Paper
            elevation={1}
            sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
                position: 'fixed',
                top: appBarHeight,
                zIndex: theme.zIndex.drawer,
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            <Box sx={{ px: 2, py: 0.4 }}>
                <Breadcrumbs
                    separator={<ChevronRightIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{
                        '& .MuiBreadcrumbs-separator': {
                            mx: 0.8,
                            color: 'text.secondary'
                        }
                    }}
                >
                    {generateBreadcrumbs().map((crumb, index) => (
                        crumb.isLast ? (
                            <Typography
                                key={crumb.href || crumb.label}
                                color="text.primary"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontWeight: 500,
                                    fontSize: '0.8rem'
                                }}
                            >
                                {crumb.label}
                            </Typography>
                        ) : (
                            <Link
                                key={crumb.href || crumb.label}
                                underline="hover"
                                color="inherit"
                                href={crumb.href}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: 'primary.main'
                                    }
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (crumb.href) {
                                        router.push(crumb.href);
                                    }
                                }}
                            >
                                {crumb.icon as any}
                                {crumb.label}
                            </Link>
                        )
                    ))}
                </Breadcrumbs>
            </Box>
        </Paper>
    );
};
