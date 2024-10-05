import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // log: ['query', 'info', 'warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type PluginType = Prisma.PluginGetPayload<{
    include: {
        user: { include: { user: true } };
        categories: true;
        presets: true;
    };
}>;

export type UserPluginType = Prisma.UserPluginGetPayload<{
    include: { user: true };
}>;

export type UserType = Prisma.UserGetPayload<{
    include: { plugins: true };
}>;
