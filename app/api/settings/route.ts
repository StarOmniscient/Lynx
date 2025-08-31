// app/api/settings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { guildId, channels } = body;

  if (!guildId || !channels) {
    return NextResponse.json({ error: "guildId and channels are required" }, { status: 400 });
  }

  const result = await prisma.homeWorkChannels.upsert({
    where: { guildId },
    update: { channels },
    create: { guildId, channels },
  });

  return NextResponse.json(result);
}
