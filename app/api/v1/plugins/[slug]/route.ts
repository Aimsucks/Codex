import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Plugin, UserPlugin } from '@prisma/client';
import { Session } from 'next-auth';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const pluginId: number | string =
        parseInt(params.slug) || decodeURI(params.slug);

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where:
            typeof pluginId === 'number'
                ? { id: pluginId }
                : { name: { equals: pluginId, mode: 'insensitive' } },
        include: {
            categories: {
                include: {
                    presets: true,
                    subcategories: recursiveCategories(2),
                },
                where: { parentCategoryId: null },
            },
            presets: true,
        },
    });

    if (plugin) return NextResponse.json(plugin, { status: 200 });

    return NextResponse.json({ message: `Plugin not found` }, { status: 404 });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session: Session | null = await auth();
    const data: any = await request.json();

    // Can't define a type because of multiple identifier types in Prisma
    const id = parseInt(params.slug);

    if (!session)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const plugin: (Plugin & { user: UserPlugin[] }) | null =
        await prisma.plugin.findUnique({
            where: { id },
            include: { user: true },
        });

    if (!plugin)
        return NextResponse.json(
            { message: 'Plugin not found' },
            { status: 404 }
        );

    if (
        !session.user.id ||
        !session.user.isAdmin ||
        !plugin.user.map((u) => u.userId).includes(session.user.id)
    )
        return NextResponse.json(
            { message: 'Unauthorized to edit this plugin' },
            { status: 403 }
        );

    const userIdData = data.user.filter(
        (userId: string) => userId !== session.user.id
    );
    // console.log({ userIdData });

    const currentUserIds = plugin.user
        .map((userPlugin) => userPlugin.userId)
        .filter((userId: string) => userId !== session.user.id);
    // console.log({ currentUserIds });

    const usersToDisconnect = currentUserIds.filter(
        (userId: string) => !userIdData.includes(userId)
    );
    // console.log({ usersToDisconnect });

    const usersToConnect = userIdData.filter(
        (userId: string) => !currentUserIds.includes(userId)
    );
    // console.log({ usersToConnect });

    try {
        const updatedPlugin = await prisma.plugin.update({
            where: { id },
            data: {
                description: data.description,
                githubLink: data.githubLink,
                discordLink: data.discordLink,
                icon: data.icon,
                user: {
                    // Disconnect users no longer in the list
                    deleteMany: {
                        OR: usersToDisconnect.map((userId: string) => ({
                            userId: userId,
                            pluginId: id,
                        })),
                    },
                    // Connect new users that are now in the list
                    connectOrCreate: usersToConnect.map((userId: string) => {
                        return {
                            where: {
                                userId_pluginId: {
                                    userId: userId,
                                    pluginId: id,
                                },
                            },
                            create: {
                                userId: userId,
                            },
                        };
                    }),
                },
            },
            include: { user: { include: { user: true } } },
        });

        // Work-around for not wanting to access session inside PluginContext, will need to fix at some point
        // Just kidding, I know I'm never going to fix this

        const updatedPluginWithoutOwner = {
            ...updatedPlugin,
            user: updatedPlugin.user.filter(
                (userPlugin) => userPlugin.userId !== session.user.id
            ),
        };

        return NextResponse.json(updatedPluginWithoutOwner, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

const recursiveCategories: any = (level: number) => {
    if (level === 0) {
        return {
            include: {
                subcategories: false,
                presets: { include: true },
            },
        };
    }

    return {
        include: {
            subcategories: recursiveCategories(level - 1),
            presets: {
                include: true,
                orderBy: { name: 'asc' },
            },
        },
    };
};
