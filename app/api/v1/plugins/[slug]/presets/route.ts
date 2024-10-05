import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const pluginId: number | string =
        parseInt(params.slug) || decodeURI(params.slug);

    // Find plugin by name, case insensitive
    // Recursively goes down up to 3 subcategories (so category -> sub -> sub -> sub)
    // TODO: Prevent creating categories past 3 subs
    const categories = await prisma.category.findMany({
        where: {
            plugin:
                typeof pluginId === 'number'
                    ? { id: pluginId }
                    : { name: { equals: pluginId, mode: 'insensitive' } },
            parentCategoryId: null,
        },
        select: {
            name: true,
            subcategories: recursiveCategories(3),
            presets: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    version: true,
                    updatedAt: true,
                    data: true,
                },
            },
        },
    });

    // Return entirety of plugin data if the plugin exists
    if (categories.length)
        return NextResponse.json(categories, { status: 200 });

    // Return 404 if no plugin was found by the provided name
    return NextResponse.json({ message: 'Plugin not found.' }, { status: 404 });
}

const recursiveCategories: any = (level: number) => {
    if (level === 0) {
        return {
            select: {
                name: true,
                subcategories: false,
                presets: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        version: true,
                        updatedAt: true,
                        data: true,
                    },
                },
            },
        };
    }

    return {
        select: {
            name: true,
            subcategories: recursiveCategories(level - 1),
            presets: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    version: true,
                    updatedAt: true,
                    data: true,
                },
            },
        },
    };
};
