import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session: Session | null = await auth();

    if (!session || !session.user?.isAdmin)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const users: User[] = await prisma.user.findMany({});

    if (users.length) return NextResponse.json(users, { status: 200 });

    return NextResponse.json({ message: `No users found` }, { status: 404 });
}
