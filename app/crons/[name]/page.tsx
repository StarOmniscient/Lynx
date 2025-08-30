import { Cron } from "@/bot/structures/Cron";
import CronPageComponent from "@/components/CronPageComponent";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CronPage({ params }: {
  params: Promise<{ name: string }>}) {
    const { name } = await params;
    
      if (!name) return notFound();
    
      const res = await fetch(
        `http://localhost:${process.env.BOT_API_PORT}/crons/${name}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store", // always fetch fresh
        }
      );
      console.log(name)
      const logs = await prisma.log.findMany({
        where: {
          context: name
        }
      })

      
    
      if (!res.ok) return notFound();
    
      const data: Cron = await res.json();
    return (
        <CronPageComponent data={data} logs={logs} />
    )
}