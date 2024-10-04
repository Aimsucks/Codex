import { prisma } from '@/prisma';
import { Prisma } from '@prisma/client';

type UserPluginPermissions = Prisma.PluginGetPayload<{
    include: { user: true };
}>;

export async function checkUserCanEditPlugin(userId: string, pluginId: number) {
    const plugin: UserPluginPermissions | null = await prisma.plugin.findUnique(
        {
            where: { id: pluginId },
            include: { user: { where: { userId: userId } } },
        }
    );

    return !!plugin;
}
