import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Plugin } from "@prisma/client";

export const dynamic = "force-static";

const recursiveCategories: any = (level: number) => {
  if (level === 0) {
    return {
      select: {
        name: true,
        subcategories: false,
        presets: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            updatedAt: true,
            data: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    };
  }

  return {
    select: {
      name: true,
      subcategories: recursiveCategories(level - 1),
      presets: {
        select: {
          id: true,
          name: true,
          description: true,
          version: true,
          updatedAt: true,
          data: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  };
};

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  // Find plugin by name, case insensitive
  // Recursively goes down up to 3 subcategories (so category -> sub -> sub -> sub)
  // TODO: Prevent creating categories past 3 subs
  const plugin = await prisma.plugin.findFirst({
    where: { name: { equals: params.name, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      description: true,
      categories: {
        select: {
          name: true,
          subcategories: recursiveCategories(2),
          presets: {
            select: {
              id: true,
              name: true,
              description: true,
              version: true,
              updatedAt: true,
              data: true,
            },
            orderBy: {
              name: "asc",
            },
          },
        },
        where: {
          parentCategoryId: null,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  // Return entirety of plugin data if the plugin exists
  if (plugin) return NextResponse.json(plugin, { status: 200 });

  // Return 404 if no plugin was found by the provided name
  return NextResponse.json({ message: "Plugin not found." }, { status: 404 });
}
