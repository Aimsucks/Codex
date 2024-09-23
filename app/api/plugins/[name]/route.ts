import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export const dynamic = "force-static";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  // Find plugin by name, case insensitive
  const plugin = await prisma.plugin.findFirst({
    where: { name: { equals: params.name, mode: "insensitive" } },
    include: {
      categories: {
        include: {
          presets: true,
        },
      },
    },
  });

  // Return entirety of plugin data if the plugin exists
  if (plugin) return NextResponse.json(plugin, { status: 200 });

  // Return 404 if no plugin was found by the provided name
  return NextResponse.json({ message: "Plugin not found." }, { status: 404 });
}
