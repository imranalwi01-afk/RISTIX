// packages/frontend/src/components/navigation/DynamicBreadcrumbs.tsx
// ============================================================================
// Dynamic Breadcrumbs Component
// ============================================================================
// Generated: 2025-01-12
// Purpose: Breadcrumb navigation using database-driven menu system
// Methodology: Core Platform MVP - Frontend Breadcrumbs
// Dependencies: React, Material-UI, Redux, Menu API
// ============================================================================

import React, { useEffect } from 'react';
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Skeleton,
  Chip,
  useTheme
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBreadcrumbs, selectBreadcrumbs, selectIsMenuLoading } from '../../store/slices/menuSlice';
import { selectMenuConfiguration, selectMenuContext } from '../../store/slices/menuSlice';

export interface BreadcrumbItem {
  title: string;
  url?: string;
  active: boolean;
}

interface DynamicBreadcrumbsProps {
  maxItems?: number;
  showHomeIcon?: boolean;
  showCurrentPath?: boolean;
  enableAnalytics?: boolean;
  customSeparator?: React.ReactNode;
  className?: string;
  sx?: any;
}

export const DynamicBreadcrumbs: React.FC<DynamicBreadcrumbsProps> = ({
  maxItems = 8,
  showHomeIcon = true,
  showCurrentPath = false,
  enableAnalytics = true,
  customSeparator,
  className,
  sx
}) => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const breadcrumbs = useSelector(selectBreadcrumbs);
  const isLoading = useSelector(selectIsMenuLoading);
  const menuConfiguration = useSelector(selectMenuConfiguration);
  const menuContext = useSelector(selectMenuContext);

  // Fetch breadcrumbs when location changes
  useEffect(() => {
    if (location.pathname) {
      dispatch(fetchBreadcrumbs(location.pathname) as any);
    }
  }, [dispatch, location.pathname]);

  // Handle breadcrumb click for analytics
  const handleBreadcrumbClick = (breadcrumb: BreadcrumbItem) => {
    if (enableAnalytics && breadcrumb.url) {
      // Log breadcrumb navigation (could be enhanced with menu access logging)
      console.log('Breadcrumb clicked:', breadcrumb.title, breadcrumb.url);
    }
  };

  // Generate fallback breadcrumbs if API fails
  const generateFallbackBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const fallbackBreadcrumbs: BreadcrumbItem[] = [
      { title: 'Home', url: '/', active: false }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Clean up segment name
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      fallbackBreadcrumbs.push({
        title,
        url: isLast ? undefined : currentPath,
        active: isLast
      });
    });

    return fallbackBreadcrumbs;
  };

  // Determine which breadcrumbs to use
  const displayBreadcrumbs = breadcrumbs.length > 0 
    ? breadcrumbs 
    : generateFallbackBreadcrumbs(location.pathname);

  // Truncate breadcrumbs if they exceed maxItems
  const truncatedBreadcrumbs = displayBreadcrumbs.length > maxItems
    ? [
        displayBreadcrumbs[0], // Always keep home
        { title: '...', active: false } as BreadcrumbItem,
        ...displayBreadcrumbs.slice(-maxItems + 2) // Keep last items
      ]
    : displayBreadcrumbs;

  // Loading state
  if (isLoading && breadcrumbs.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
        <Skeleton variant="text" width={60} height={24} />
        <NavigateNextIcon fontSize="small" color="disabled" />
        <Skeleton variant="text" width={80} height={24} />
        <NavigateNextIcon fontSize="small" color="disabled" />
        <Skeleton variant="text" width={120} height={24} />
      </Box>
    );
  }

  // No breadcrumbs to show
  if (displayBreadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box 
      className={className}
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        py: 1,
        ...sx 
      }}
    >
      {/* Context info */}
      {menuContext && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          {menuContext.tenant_name && (
            <Chip 
              label={menuContext.tenant_name}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {menuContext.banking_type && (
            <Chip 
              label={menuContext.banking_type.charAt(0).toUpperCase() + menuContext.banking_type.slice(1)}
              size="small"
              color={menuContext.banking_type === 'syariah' ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={customSeparator || <NavigateNextIcon fontSize="small" />}
        maxItems={maxItems}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.text.secondary,
            mx: 0.5
          }
        }}
      >
        {truncatedBreadcrumbs.map((breadcrumb, index) => {
          const key = `breadcrumb-${index}`;

          // Ellipsis item
          if (breadcrumb.title === '...') {
            return (
              <Typography 
                key={key}
                color="text.secondary"
                sx={{ cursor: 'default' }}
              >
                ...
              </Typography>
            );
          }

          // Active (current) item
          if (breadcrumb.active || !breadcrumb.url) {
            return (
              <Typography 
                key={key}
                color="text.primary"
                fontWeight={breadcrumb.active ? 600 : 400}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {index === 0 && showHomeIcon && (
                  <HomeIcon fontSize="small" />
                )}
                {breadcrumb.title}
              </Typography>
            );
          }

          // Clickable link
          return (
            <Link
              key={key}
              component={RouterLink}
              to={breadcrumb.url}
              underline="hover"
              color="primary"
              onClick={() => handleBreadcrumbClick(breadcrumb)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {index === 0 && showHomeIcon && (
                <HomeIcon fontSize="small" />
              )}
              {breadcrumb.title}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Current path info (for debugging) */}
      {showCurrentPath && (
        <Box sx={{ ml: 'auto', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="caption" color="text.secondary">
            {location.pathname}
          </Typography>
        </Box>
      )}

      {/* Menu version info */}
      {menuConfiguration && process.env.NODE_ENV === 'development' && (
        <Box sx={{ ml: 'auto', display: { xs: 'none', lg: 'block' } }}>
          <Typography variant="caption" color="text.secondary">
            Menu v{menuConfiguration.version}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DynamicBreadcrumbs;