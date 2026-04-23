'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export function usePlatformAccessGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isPlatformRoute = pathname?.startsWith('/platform') ?? false;
  const isLoginRoute = pathname === '/platform/login';

  const isPlatformAdmin = useMemo(() => {
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    return (
      user?.stakeholderType === 'platform' ||
      user?.isPlatformAdmin ||
      permissions.includes('admin.super_admin') ||
      permissions.includes('PLATFORM_ADMIN')
    );
  }, [user]);

  useEffect(() => {
    if (!isPlatformRoute || isLoginRoute || isLoading) return;

    if (!isAuthenticated) {
      router.replace('/platform/login?error=unauthorized');
      return;
    }

    if (!isPlatformAdmin) {
      router.replace('/banking/dashboard');
    }
  }, [isAuthenticated, isLoading, isLoginRoute, isPlatformAdmin, isPlatformRoute, router]);

  return {
    isLoading,
    isAuthenticated,
    isPlatformAdmin,
    isLoginRoute,
    canRenderPlatformShell: isLoginRoute || (!isLoading && isAuthenticated && isPlatformAdmin),
  };
}
