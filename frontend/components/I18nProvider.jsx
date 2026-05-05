'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { translatePage } from '@/utils/translator';

export default function I18nProvider({ children }) {
    const pathname = usePathname();
    const { i18n } = useTranslation();

    // Extract base language code (e.g. 'en-US' -> 'en')
    const langBase = (i18n.language || 'en').split('-')[0];

    const applyTranslation = useCallback(async () => {
        const lang = langBase || localStorage.getItem('selectedLanguage') || 'en';
        if (lang && lang !== 'en') {
            // Wait for DOM to settle after navigation
            await new Promise(r => setTimeout(r, 500));
            try {
                await translatePage(lang);
            } catch (err) {
                console.error('Auto-translation failed:', err);
            }
        }
    }, [langBase]);

    // Re-translate when route changes
    useEffect(() => {
        applyTranslation();
    }, [pathname, applyTranslation]);

    // Also observe DOM mutations to translate dynamically added content
    useEffect(() => {
        if (!langBase || langBase === 'en') return;

        let debounceTimer;
        let isTranslating = false;
        const observer = new MutationObserver(() => {
            if (isTranslating) return; // Prevent infinite loop
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                isTranslating = true;
                try {
                    await translatePage(langBase);
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
    }, [langBase]);

    return <>{children}</>;
}
