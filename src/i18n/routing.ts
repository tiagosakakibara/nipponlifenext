import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['pt', 'en', 'ja'],
    defaultLocale: 'pt',
    localePrefix: 'always' // Ensures SEO consistency: /pt, /en, /ja
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
