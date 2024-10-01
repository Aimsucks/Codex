import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/prisma"
import {Plugin, Preset} from "@prisma/client"
import {Session} from "next-auth";

export async function PUT(request: NextRequest, {params}: { params: { slug: string } }) {
    const session: Session | null = await auth();
    const data: any = await request.json()

    // Can't define a type because of multiple identifier types in Prisma
    const id = parseInt(params.slug)

    if (!session) return NextResponse.json({message: "Unauthorized"}, {status: 401})

    const preset: Preset | null = await prisma.preset.findUnique({where: {id}})

    if (!preset) return NextResponse.json({message: "Preset not found"}, {status: 404})

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            id: preset.pluginId,
            user: {some: {userId: session.user?.id}}
        }
    })

    if (!plugin) return NextResponse.json({message: "Unauthorized to edit this plugin"}, {status: 403})

    try {
        const updatedPreset: Preset | null = await prisma.preset.update({
            where: {id},
            data: {
                name: data.name,
                description: data.description,
                data: data.data
            }
        })

        return NextResponse.json(updatedPreset, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Server error"}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, {params}: { params: { slug: string } }) {
    const session: Session | null = await auth();

    // Can't define a type because of multiple identifier types in Prisma
    const id = parseInt(params.slug)

    if (!session) return NextResponse.json({message: "Unauthorized"}, {status: 401})

    const preset: Preset | null = await prisma.preset.findUnique({
        where: {id}
    })

    if (!preset) return NextResponse.json({message: "Preset not found"}, {status: 404})

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            id: preset.pluginId,
            user: {some: {userId: session.user?.id}}
        }
    })

    if (!plugin) return NextResponse.json({message: "Unauthorized to edit this plugin"}, {status: 403})

    try {
        const deletedPreset: Preset | null = await prisma.preset.delete({
            where: {id}
        })

        return NextResponse.json(deletedPreset, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Server error"}, {status: 500});
    }
}
