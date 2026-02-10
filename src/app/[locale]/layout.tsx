import type { Metadata } from 'next';
import { DM_Sans, Montserrat, Shippori_Mincho, Outfit } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { generateSEOMetadata } from '@/lib/metadata';
import '@/app/globals.css';

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    display: "swap",
});

const shippori = Shippori_Mincho({
    variable: "--font-shippori",
    weight: "400",
    preload: false,
    display: "swap",
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const messages = await getMessages({ locale });

    // Use i18n messages for title and description
    const title = (messages as any).seo?.siteTitle || 'Portal da Cultura Japonesa';
    const description = (messages as any).seo?.siteDescription ||
        'Seu portal completo sobre o Japão: notícias, empregos, eventos, negócios e comunidade brasileira no Japão.';

    return generateSEOMetadata({
        title: 'NipponLife',
        description,
        locale,
        type: 'website',
        url: '',
        images: ['/images/logo-full.png'],
    });
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/images/logo-icon.png" />
                <meta name="theme-color" content="#D70F24" />
            </head>
            <body
                className={`${dmSans.variable} ${montserrat.variable} ${shippori.variable} ${outfit.variable} antialiased font-sans bg-app text-primary`}
            >
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Header />
                        <main className="min-h-screen">
                            {children}
                        </main>
                        <Footer />
                        <Toaster position="bottom-right" />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
