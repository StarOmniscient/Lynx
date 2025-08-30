// app/api/getMessages/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guild = searchParams.get("guild");
  const channel = searchParams.get("channel");

  const res = await fetch(`http://localhost:${process.env.BOT_API_PORT}/guilds/${guild}/channels/${channel}`);
  const data = await res.json();
  return NextResponse.json(data);
}
