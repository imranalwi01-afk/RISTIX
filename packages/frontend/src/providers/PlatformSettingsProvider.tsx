'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PlatformSettings {
    platformName: string | null;
    logoUrl: string | null;
}

interface PlatformSettingsContextType {
    settings: PlatformSettings;
    loading: boolean;
}

const defaultSettings: PlatformSettings = {
    platformName: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'IFRSPro',
    logoUrl: process.env.NEXT_PUBLIC_PLATFORM_LOGO || null,
};

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
    settings: defaultSettings,
    loading: true,
});

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchSettings() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/platform/settings/public`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && mounted) {
                        setSettings({
                            platformName: result.data.platformName || process.env.NEXT_PUBLIC_PLATFORM_NAME || 'IFRSPro',
                            logoUrl: result.data.logoUrl || process.env.NEXT_PUBLIC_PLATFORM_LOGO || null,
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

    return (
        <PlatformSettingsContext.Provider value={{ settings, loading }}>
            {children}
        </PlatformSettingsContext.Provider>
    );
}

export function usePlatformSettings() {
    return useContext(PlatformSettingsContext);
}
