import { NextRequest, NextResponse } from 'next/server';
import mime from 'mime';
import { Session } from 'next-auth';
import { auth } from '@/auth';
import { Plugin, UserPlugin } from '@prisma/client';
import { prisma } from '@/prisma';
import { saveFileInBucket } from '@/lib/s3-file-management';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const session: Session | null = await auth();

    // Can't define a type because of multiple identifier types in Prisma
    const id = (formData.get('plugin') as string) || null;

    if (!session)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (!id)
        return NextResponse.json(
            { message: 'Plugin not found' },
            { status: 404 }
        );

    const plugin: (Plugin & { user: UserPlugin[] }) | null =
        await prisma.plugin.findUnique({
            where: { id: parseInt(id) },
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

    const image = (formData.get('image') as File) || null;

    const maximumFileSize = 1024 * 1024 * 4; // 4 MB
    const acceptedFileTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/svg',
    ];

    if (image.size >= maximumFileSize) {
        return NextResponse.json(
            { error: 'File is too large' },
            { status: 400 }
        );
    }

    if (!acceptedFileTypes.includes(image.type)) {
        return NextResponse.json(
            { error: 'File type not supported' },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    try {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${image.name.replace(
            /\.[^/.]+$/,
            ''
        )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;

        const response = await saveFileInBucket({
            bucketName: process.env.S3_BUCKET_NAME || 'codex',
            fileName: filename,
            file: buffer,
            size: image.size,
            contentType: image.type,
        });

        return NextResponse.json(response);
    } catch (e) {
        console.error('Error while trying to upload a file\n', e);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
