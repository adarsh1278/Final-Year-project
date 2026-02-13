'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { translatePage } from '@/utils/translator';

export default function I18nProvider({ children }) {
    const pathname = usePathname();
    const { i18n } = useTranslation();

    const applyTranslation = useCallback(async () => {
        const lang = i18n.language || localStorage.getItem('selectedLanguage') || 'en';
        if (lang && lang !== 'en') {
            // Wait for DOM to settle after navigation
            await new Promise(r => setTimeout(r, 500));
            try {
                await translatePage(lang);
            } catch (err) {
                console.error('Auto-translation failed:', err);
            }
        }
    }, [i18n.language]);

    // Re-translate when route changes
    useEffect(() => {
        applyTranslation();
    }, [pathname, applyTranslation]);

    // Also observe DOM mutations to translate dynamically added content
    useEffect(() => {
        const lang = i18n.language;
        if (!lang || lang === 'en') return;

        let debounceTimer;
        let isTranslating = false;
        const observer = new MutationObserver(() => {
            if (isTranslating) return; // Prevent infinite loop
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                isTranslating = true;
                try {
                    await translatePage(lang);
                } catch (e) {}
                // Allow future mutations after a cooldown
                setTimeout(() => { isTranslating = false; }, 2000);
            }, 1500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            clearTimeout(debounceTimer);
        };
    }, [i18n.language]);

    return <>{children}</>;
}
