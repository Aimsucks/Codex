import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export const dynamic = "force-static";

export async function GET(request: Request) {
  // Find all plugins
  const plugins = await prisma.plugin.findMany({});

  return NextResponse.json(plugins, { status: 200 });
}

// Note: will probably remove this later since it's useless
