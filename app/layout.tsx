import type {Metadata} from "next";
import {Inter as FontSans} from "next/font/google";
import {cn} from "@/lib/utils";
import "./globals.css";
import SessionWrapper from "@/components/auth/SessionWrapper";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

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
                    "min-h-screen bg-background font-sans antialiased container",
                    fontSans.variable
                )}
            >
            <NextIntlClientProvider messages={messages}>
                {children}
            </NextIntlClientProvider>
            </body>
            </html>
        </SessionWrapper>
    );
}
