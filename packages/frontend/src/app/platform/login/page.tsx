
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformLoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login?role=platform_admin');
    }, [router]);

    return null;
}
