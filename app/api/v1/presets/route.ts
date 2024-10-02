import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { Plugin, Preset } from '@prisma/client';
import { Session } from 'next-auth';

export async function POST(request: NextRequest) {
    const session: Session | null = await auth();
    const data: any = await request.json();

    if (!session)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            id: data.pluginId,
            user: { some: { userId: session.user?.id } },
        },
    });

    if (!plugin)
        return NextResponse.json(
            { message: 'Unauthorized to edit this plugin' },
            { status: 403 }
        );

    try {
        const createdPreset: Preset | null = await prisma.preset.create({
            data: {
                name: data.name,
                description: data.description,
                data: data.data,
                version: data.version,
                categoryId: data.categoryId,
                pluginId: plugin.id,
            },
        });

        return NextResponse.json(createdPreset, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
