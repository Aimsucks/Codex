import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';
import { Plugin } from '@prisma/client';

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
