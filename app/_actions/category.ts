'use server';

import { Session } from 'next-auth';
import { auth } from '@/auth';
import { checkUserCanEditPlugin } from '@/lib/authentication';
import { prisma } from '@/prisma';
import { revalidatePath } from 'next/cache';
import { categoryFormSchema } from '@/app/_validation/category';

export type FormState = {
    message: string;
    error?: boolean;
};

export async function createCategoryAction(
    pluginId: number,
    parentCategoryId: number | null,
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
    const validatedFormData = categoryFormSchema.safeParse({
        name: data.get('name'),
    });
    if (!validatedFormData.success)
        return { error: true, message: 'Invalid form submission' };

    // Create preset in database
    try {
        await prisma.category.create({
            data: {
                name: validatedFormData.data.name,
                pluginId: pluginId,
                ...(parentCategoryId !== null && { parentCategoryId }),
            },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error creating category in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Category created' };
}

export async function updateCategoryAction(
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
    const validatedFormData = categoryFormSchema.safeParse({
        name: data.get('name'),
    });
    if (!validatedFormData.success)
        return { error: true, message: 'Invalid form submission' };

    // Update category in database
    try {
        await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: validatedFormData.data.name,
            },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error updating category in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Category updated' };
}

export async function deleteCategoryAction(
    pluginId: number,
    categoryId: number
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

    // Check if category has no subcategories or presets
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { subcategories: true, presets: true },
        });

        if (!category) return { error: true, message: 'Category not found' };

        if (
            category?.subcategories?.length > 0 ||
            category?.presets?.length > 0
        )
            return {
                error: true,
                message:
                    'Cannot delete categories with subcategories or presets',
            };
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error finding category in database' };
    }

    // Delete category in database
    try {
        await prisma.category.delete({
            where: { id: categoryId },
        });
    } catch (error) {
        console.error(error);
        return { error: true, message: 'Error deleting category in database' };
    }

    // Revalidate data
    revalidatePath('/plugins/[slug]', 'page');

    return { message: 'Category deleted' };
}
