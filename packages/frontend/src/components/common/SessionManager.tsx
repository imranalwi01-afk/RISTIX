'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { securityConfigAPI } from '@/services/api/security-config.api';

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only enforce session management on authenticated routes
    if (pathname === '/login' || pathname === '/login-platform') return;

    let timeoutDurationMs = 30 * 60 * 1000; // Default 30 minutes

    const fetchConfig = async () => {
      try {
        const config = await securityConfigAPI.get();
        if (config?.sessionTimeout) {
          timeoutDurationMs = config.sessionTimeout * 60 * 1000;
        }
        resetTimer();
      } catch (err) {
        console.error('Failed to fetch security config for session manager', err);
      }
    };

    const handleLogout = () => {
      dispatch(logout());
      router.push('/login');
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleLogout, timeoutDurationMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    fetchConfig();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, dispatch, router]);

  return null;
}
