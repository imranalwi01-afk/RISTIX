import BrandingSettingsPanel from '@/components/platform/settings/BrandingSettingsPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Platform Branding Settings | Platform Admin',
    description: 'Configure platform-wide branding, titles, and logos',
};

export default function BrandingSettingsPage() {
    return <BrandingSettingsPanel />;
}
