import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const level = (url.searchParams.get("level") || "ALL").toUpperCase();
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(Number(limitParam), 1000) : 100;

    const where =
      level !== "ALL"
        ? { level }
        : undefined;

    const logs = await prisma.log.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
