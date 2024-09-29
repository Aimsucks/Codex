import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma";

export async function GET(
    request: NextRequest,
    {params}: { params: { name: string } }
) {
    const plugin = await prisma.plugin.findFirst({
        where: {name: {equals: decodeURI(params.name), mode: "insensitive"}},
        select: {
            id: true,
            name: true,
            description: true
        },
    });

    // Return entirety of plugin data if the plugin exists
    if (plugin) return NextResponse.json(plugin, {status: 200});

    // Return 404 if no plugin was found by the provided name
    return NextResponse.json({message: "Plugin not found."}, {status: 404});
}
