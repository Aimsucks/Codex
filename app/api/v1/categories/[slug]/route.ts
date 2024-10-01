import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';
import { Category, Plugin } from '@prisma/client';
import { Session } from 'next-auth';

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

    const category: Category | null = await prisma.category.findUnique({
        where: { id },
    });

    if (!category)
        return NextResponse.json(
            { message: 'Category not found' },
            { status: 404 }
        );

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            id: category.pluginId,
            user: { some: { userId: session.user?.id } },
        },
    });

    if (!plugin)
        return NextResponse.json(
            { message: 'Unauthorized to edit this plugin' },
            { status: 403 }
        );

    try {
        const updatedCategory: Category | null = await prisma.category.update({
            where: { id },
            data: { name: data.name },
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session: Session | null = await auth();

    // Can't define a type because of multiple identifier types in Prisma
    const id = parseInt(params.slug);

    if (!session)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const category: (Category & { subcategories: Category[] }) | null =
        await prisma.category.findUnique({
            where: { id },
            include: { subcategories: true },
        });

    if (!category)
        return NextResponse.json(
            { message: 'Category not found' },
            { status: 404 }
        );

    if (category.subcategories.length)
        return NextResponse.json(
            { message: 'Cannot delete category that has presets' },
            { status: 400 }
        );

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            id: category.pluginId,
            user: { some: { userId: session.user?.id } },
        },
    });

    if (!plugin)
        return NextResponse.json(
            { message: 'Unauthorized to edit this plugin' },
            { status: 403 }
        );

    try {
        const deletedCategory: Category | null = await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json(deletedCategory, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
