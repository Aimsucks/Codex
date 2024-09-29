import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma";

// TODO: Add plugin name checking

export async function GET(request: NextRequest) {
    const searchParams: URLSearchParams = request.nextUrl.searchParams
    const query: string | null = searchParams.get("query")

    if (!query) {
        return NextResponse.json({message: "No query parameters provided."}, {status: 400})
    }

    const ids: number[] = query.split(",").map(id => parseInt(id))

    const presets = await prisma.preset.findMany({
        where: {id: {in: ids}},
        select: {
            id: true,
            name: true,
            version: true,
            updatedAt: true,
            description: true,
            data: true
        }
    })

    if (presets) return NextResponse.json(presets, {status: 200});

    return NextResponse.json({message: "Plugin not found."}, {status: 404});
}
