'use server';

import mime from 'mime';

import { Session } from 'next-auth';

import { auth } from '@/auth';
import { prisma } from '@/prisma';

import {
    pluginPermissionsOptionSchema,
    pluginUpdateFormSchema,
} from '@/app/validation/plugin';
import { checkUserCanEditPlugin } from '@/lib/authentication';
import { saveFileInBucket } from '@/lib/s3-file-management';
import { z } from 'zod';

export type FormState = {
    message: string;
    error?: boolean;
};

export async function updatePluginAction(
    pluginId: number,
    prevState: FormState,
    data: FormData
): Promise<FormState> {
    // Check if the user is logged in and as an "admin"
    const session: Session | null = await auth();
    if (!session || !session.user.isAdmin || !session.user.id)
        return { error: true, message: 'Unauthorized to update plugins' };

    // Check if the user has permissions on the specific plugin they're trying to edit
    const pluginEditPermissions: boolean = await checkUserCanEditPlugin(
        session.user.id,
        pluginId
    );
    if (!pluginEditPermissions)
        return { error: true, message: 'Unauthorized to update this plugin' };

    // Parse approvedUsers to an array so it can be validated
    const approvedUsers: z.infer<typeof pluginPermissionsOptionSchema>[] = [];
    data.forEach((value, key) => {
        if (key.startsWith('approvedUsers')) {
            approvedUsers.push(JSON.parse(value as string));
        }
    });

    // Validate form data against the Zod form schema and return an error if it doesn't work
    const validatedFormData = pluginUpdateFormSchema.safeParse({
        description: data.get('description'),
        icon: data.get('icon'),
        githubLink: data.get('githubLink'),
        discordLink: data.get('discordLink'),
        approvedUsers: approvedUsers,
    });

    if (!validatedFormData.success) {
        return { error: true, message: 'Invalid form submission' };
    }

    // Upload image to S3 if an icon was submitted
    let pluginIconUrl = undefined;
    if (validatedFormData.data.icon) {
        const pluginIcon = validatedFormData.data.icon;
        const pluginIconBuffer = Buffer.from(await pluginIcon.arrayBuffer());
        const pluginIconUniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const pluginIconFilename = `${pluginIcon.name.replace(
            /\.[^/.]+$/,
            ''
        )}-${pluginIconUniqueSuffix}.${mime.getExtension(pluginIcon.type)}`;

        try {
            pluginIconUrl = await saveFileInBucket({
                fileName: pluginIconFilename,
                file: pluginIconBuffer,
                size: pluginIcon.size,
                contentType: pluginIcon.type,
            });
        } catch (e) {
            console.error(e);
            return { error: true, message: 'Error uploading plugin icon' };
        }
    }

    // Generate list of users to connect and disconnect from plugin <-> user relationship
    let usersToConnectQuery = undefined;
    let usersToDisconnectQuery = undefined;
    if (validatedFormData.data.approvedUsers) {
        // Filter out current user so we don't overwrite them
        const userIdData = validatedFormData.data.approvedUsers
            .filter((user) => user.value !== session.user.id)
            .map((user) => user.value);

        // Pull current records from user <-> plugin table
        const userPluginRelationships = await prisma.userPlugin.findMany({
            where: { pluginId: pluginId },
        });

        // Get array of current user IDs from the query
        const currentUserIds = userPluginRelationships
            .filter((userPlugin) => userPlugin.userId !== session.user.id)
            .map((userPlugin) => userPlugin.userId);

        // Generate query for users to disconnect
        const usersToDisconnect = currentUserIds.filter(
            (userId: string) => !userIdData.includes(userId)
        );
        usersToDisconnectQuery = usersToDisconnect.map((userId: string) => ({
            userId,
            pluginId,
        }));

        // Generate query for users to connect
        const usersToConnect = userIdData.filter(
            (userId: string) => !currentUserIds.includes(userId)
        );
        usersToConnectQuery = usersToConnect.map((userId: string) => ({
            where: { userId_pluginId: { userId, pluginId } },
            create: { userId: userId },
        }));
    }

    // Update plugin in database
    try {
        await prisma.plugin.update({
            where: { id: pluginId },
            data: {
                description: validatedFormData.data.description,
                githubLink: validatedFormData.data.githubLink,
                discordLink: validatedFormData.data.discordLink,

                // Only update plugin icon URL if a new one was provided
                ...(pluginIconUrl && { icon: pluginIconUrl }),

                // Only update relationships if any were changed
                ...((usersToDisconnectQuery || usersToConnectQuery) && {
                    user: {
                        ...(usersToDisconnectQuery && {
                            deleteMany: { OR: usersToDisconnectQuery },
                        }),
                        ...(usersToConnectQuery && {
                            connectOrCreate: usersToConnectQuery,
                        }),
                    },
                }),
            },
        });
    } catch (e) {
        console.error(e);
        return { error: true, message: 'Error uploading plugin in database' };
    }

    // Revalidate data

    return { message: 'Plugin updated' };
}
