// app/api/settings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { guildId, config } = body;

  if (!guildId || !config) {
    return NextResponse.json({ error: "guildId and channels are required" }, { status: 400 });
  }

  const result = await prisma.serverConfig.upsert({
    where: { guildID: guildId },
    update: { config },
    create: { guildID: guildId, config },
  });

  return NextResponse.json(result);
}
