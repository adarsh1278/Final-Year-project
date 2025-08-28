'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ClientTranslatedText({ textKey, fallback = '', values = {}, ...props }) {
    const [isClient, setIsClient] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <span {...props}>{fallback}</span>;
    }

    return <span {...props}>{t(textKey, fallback, values)}</span>;
}
