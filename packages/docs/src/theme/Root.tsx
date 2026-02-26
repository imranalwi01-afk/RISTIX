import React from 'react';
import Gatekeeper from '@site/src/components/Gatekeeper';

export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <Gatekeeper>
            {children}
        </Gatekeeper>
    );
}
