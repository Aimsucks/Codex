'use server';

import { Session } from 'next-auth';
import { auth } from '@/auth';
import { checkUserCanEditPlugin } from '@/lib/authentication';
import { prisma } from '@/prisma';
import { presetFormSchema } from '@/app/_validation/preset';
import { revalidatePath } from 'next/cache';

export type FormState = {
    message: string;
    error?: boolean;
};

export async function createPresetAction(
    pluginId: number,
    categoryId: number,
    prevState: FormState,
    data: FormData
): Promise<FormState> {
    // Check if the user is logged in
    const session: Session | null = await auth();
    if (!session || !session.user.id)
        return { error: true, message: 'Unauthorized to update plugins' };

    // Check if the user has permissions on the specific plugin they're trying to edit
    const pluginEditPermissions: boolean = await checkUserCanEditPlugin(
        session.user.id,
        pluginId
    );
    if (!pluginEditPermissions)
        return { error: true, message: 'Unauthorized to update this plugin' };

    // Validate form data against the Zod form schema and return an error if it doesn't work
    const validatedFormData = presetFormSchema.safeParse({
        name: data.get('name'),
        description: data.get('description'),
        data: data.get('data'),
    });
    if (!validatedFormData.success)
        return { error: true, message: 'Invalid form submission' };

    // Create preset in database
    try {
        await prisma.preset.create({
            data: {
                name: validatedFormData.data.name,
                version: 1,
                description: validatedFormData.data.description,
                data: validatedFormData.data.data,
                pluginId: pluginId,
                categoryId: categoryId,
            },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error creating preset in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Preset created' };
}

export async function updatePresetAction(
    pluginId: number,
    presetId: number,
    prevState: FormState,
    data: FormData
): Promise<FormState> {
    // Check if the user is logged in
    const session: Session | null = await auth();
    if (!session || !session.user.id)
        return { error: true, message: 'Unauthorized to update plugins' };

    // Check if the user has permissions on the specific plugin they're trying to edit
    const pluginEditPermissions: boolean = await checkUserCanEditPlugin(
        session.user.id,
        pluginId
    );
    if (!pluginEditPermissions)
        return { error: true, message: 'Unauthorized to update this plugin' };

    // Validate form data against the Zod form schema and return an error if it doesn't work
    const validatedFormData = presetFormSchema.safeParse({
        name: data.get('name'),
        description: data.get('description'),
        data: data.get('data'),
    });
    if (!validatedFormData.success)
        return { error: true, message: 'Invalid form submission' };

    // Update preset in database
    try {
        await prisma.preset.update({
            where: { id: presetId },
            data: {
                name: validatedFormData.data.name,
                version: { increment: 1 },
                description: validatedFormData.data.description,
                data: validatedFormData.data.data,
            },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error updating preset in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Preset updated' };
}

export async function deletePresetAction(
    pluginId: number,
    presetId: number
): Promise<FormState> {
    // Check if the user is logged in
    const session: Session | null = await auth();
    if (!session || !session.user.id)
        return { error: true, message: 'Unauthorized to update plugins' };

    // Check if the user has permissions on the specific plugin they're trying to edit
    const pluginEditPermissions: boolean = await checkUserCanEditPlugin(
        session.user.id,
        pluginId
    );
    if (!pluginEditPermissions)
        return { error: true, message: 'Unauthorized to update this plugin' };

    // Delete preset in database
    try {
        await prisma.preset.delete({
            where: { id: presetId },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error deleting preset in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Preset deleted' };
}
