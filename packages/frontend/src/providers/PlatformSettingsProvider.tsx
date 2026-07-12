'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend';

interface PlatformSettings {
    platformName: string | null;
    logoUrl: string | null;
    landingTitle: string | null;
    landingSubtitle: string | null;
    badgeText: string | null;
    footerText: string | null;
    sidebarText: string | null;
    navbarText: string | null;
    dashSubtitle: string | null;
    sidebarTenant: string | null;
    sidebarVersion: string | null;
    tabTitleSuffix: string | null;
}

interface PlatformSettingsContextType {
    settings: PlatformSettings;
    loading: boolean;
}

const defaultSettings: PlatformSettings = {
    platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'RISTIX',
    logoUrl: process.env.NEXT_PUBLIC_PLATFORM_LOGO || null,
    landingTitle: 'PSAK 413',
    landingSubtitle: 'Expected Credit Loss',
    badgeText: 'RISTIX ENGINE v2.0',
    footerText: null, // We'll compute the default in the component or set it here if we want a static fallback
    sidebarText: 'RISTIX Platform',
    navbarText: 'RISTIX | Risk Management Platform',
    dashSubtitle: null,
    sidebarTenant: 'RISTIX System',
    sidebarVersion: 'RISTIX Platform v2.0',
    tabTitleSuffix: 'RISTIX Platform',
};

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
    settings: defaultSettings,
    loading: true,
});

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        let mounted = true;

        async function fetchSettings() {
            try {
                const envConfig = frontendEnvironmentLoader.getConfiguration();
                const apiBase = (envConfig?.api?.base || envConfig?.api?.backend || '/api/v1').replace(/\/+$/, '');
                const response = await fetch(`${apiBase}/platform/settings/public`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && mounted) {
                        setSettings({
                            platformName: result.data.platformName || process.env.NEXT_PUBLIC_PLATFORM_NAME || 'RISTIX',
                            logoUrl: result.data.logoUrl || process.env.NEXT_PUBLIC_PLATFORM_LOGO || null,
                            landingTitle: result.data.landingTitle || 'PSAK 413',
                            landingSubtitle: result.data.landingSubtitle || 'Expected Credit Loss',
                            badgeText: result.data.badgeText || 'RISTIX ENGINE v2.0',
                            footerText: result.data.footerText || null,
                            sidebarText: result.data.sidebarText || 'RISTIX Platform',
                            navbarText: result.data.navbarText || 'RISTIX | Risk Management Platform',
                            dashSubtitle: result.data.dashSubtitle || null,
                            sidebarTenant: result.data.sidebarTenant || 'RISTIX System',
                            sidebarVersion: result.data.sidebarVersion || 'RISTIX Platform v2.0',
                            tabTitleSuffix: result.data.tabTitleSuffix || 'RISTIX Platform',
                        });
                    }
                }
            } catch (error) {
                console.warn('⚠️ PlatformSettingsProvider: Failed to fetch global settings, using env fallback.', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchSettings();

        return () => {
            mounted = false;
        };
    }, []);

    // Update document title dynamically based on tabTitleSuffix
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!loading && settings.tabTitleSuffix) {
                const currentTitle = document.title;
                if (currentTitle.includes('|')) {
                    document.title = currentTitle.replace(/\|.*/, `| ${settings.tabTitleSuffix}`);
                } else if (currentTitle) {
                    document.title = `${currentTitle} | ${settings.tabTitleSuffix}`;
                }
            }
        }, 50);

        // Force favicon update to bypass aggressive browser caching
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        link.href = settings.logoUrl || `/icon.png?v=${new Date().getTime()}`;
        document.getElementsByTagName('head')[0].appendChild(link);

        return () => clearTimeout(timeout);
    }, [settings.tabTitleSuffix, settings.logoUrl, loading, pathname]);

    return (
        <PlatformSettingsContext.Provider value={{ settings, loading }}>
            {children}
        </PlatformSettingsContext.Provider>
    );
}

export function usePlatformSettings() {
    return useContext(PlatformSettingsContext);
}
