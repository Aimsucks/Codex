import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                port: '',
                pathname: '/avatars/**',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default withNextIntl(nextConfig);
