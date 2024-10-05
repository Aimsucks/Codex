import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const pluginId: number | string =
        parseInt(params.slug) || decodeURI(params.slug);

    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const query: string | null = searchParams.get('query');

    if (!query) {
        return NextResponse.json(
            { message: 'No query parameters provided.' },
            { status: 400 }
        );
    }

    const presetIds: number[] = query.split(',').map((id) => parseInt(id));

    const presets = await prisma.preset.findMany({
        where: {
            id: { in: presetIds },
            plugin:
                typeof pluginId === 'number'
                    ? { id: pluginId }
                    : { name: { equals: pluginId, mode: 'insensitive' } },
        },
        select: {
            id: true,
            name: true,
            version: true,
            updatedAt: true,
            description: true,
            data: true,
        },
    });

    if (presets.length) return NextResponse.json(presets, { status: 200 });

    return NextResponse.json({ message: 'Plugin not found.' }, { status: 404 });
}
