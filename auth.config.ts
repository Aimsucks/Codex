import Discord from 'next-auth/providers/discord';
import type { NextAuthConfig } from 'next-auth';

export default {
    providers: [
        Discord({
            // Set authorization URL to only ask for the "identify"
            // scope so we don't grab people's email addresses
            authorization:
                'https://discord.com/oauth2/authorize?scope=identify',
        }),
    ],
} satisfies NextAuthConfig;
