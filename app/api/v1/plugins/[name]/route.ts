import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/prisma";
import {Plugin} from "@prisma/client"

export async function GET(request: NextRequest, {params}: { params: { name: string } }) {
    const name: string = decodeURI(params.name)

    const plugin: Plugin | null = await prisma.plugin.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive"
            }
        },
        include: {
            categories: {
                include: {
                    presets: true,
                    subcategories: recursiveCategories(2)
                },
                where: {parentCategoryId: null},
                orderBy: {name: "asc"}
            },
            presets: true
        }
    })

    if (plugin) return NextResponse.json(plugin, {status: 200});

    return NextResponse.json({message: `Plugin ${name} not found`}, {status: 404});
}

const recursiveCategories: any = (level: number) => {
    if (level === 0) {
        return {
            include: {
                subcategories: false,
                presets: {
                    include: true,
                    orderBy: {name: "asc",},
                },
            },
            orderBy: {name: "asc",},
        };
    }

    return {
        include: {
            subcategories: recursiveCategories(level - 1),
            presets: {
                include: true,
                orderBy: {name: "asc",},
            },
        },
        orderBy: {name: "asc",},
    };
};