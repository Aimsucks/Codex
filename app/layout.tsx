import type {Metadata} from "next";
import {Inter as FontSans} from "next/font/google";
import {cn} from "@/lib/utils";
import "./globals.css";
import SessionWrapper from "@/components/auth/SessionWrapper";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import TopBar from "@/components/base/HeaderBar";
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

config.autoAddCss = false

export const metadata: Metadata = {
    title: "Codex",
    description: "Providing an interactive repository of presets for FFXIV home.",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <SessionWrapper>
            <html lang={locale}>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased container mx-auto",
                    fontSans.variable
                )}
            >
            <NextIntlClientProvider messages={messages}>
                <TopBar/>
                {children}
            </NextIntlClientProvider>
            </body>
            </html>
        </SessionWrapper>
    );
}
