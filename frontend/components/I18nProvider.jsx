'use client';

import { useEffect } from 'react';
import '@/i18n';

export default function I18nProvider({ children }) {
    useEffect(() => {
        // i18n is already initialized in the import above
        // This component just ensures client-side hydration is handled properly
    }, []);

    return <>{children}</>;
}
