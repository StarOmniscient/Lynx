import { Command } from "@/bot/structures/Command";
import CommandPageComponent from "@/components/CommandPageComponent";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";


export default async function CommandPage({ params }: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params;

  if (!name) return notFound();

  const res = await fetch(
    `http://localhost:${process.env.BOT_API_PORT}/commands/${name}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // always fetch fresh
    }
  );

  const logs = await prisma.log.findMany({
    where: {
      context: name
    }
  })

  if (!res.ok) return notFound();

  const data: Command = await res.json();

  return (
    <CommandPageComponent data={data} logs={logs} />
  );
}

