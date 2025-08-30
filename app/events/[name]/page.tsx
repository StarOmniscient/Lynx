import { Event } from "@/bot/structures/Event";
import EventPageComponent from "@/components/EventPageComponent";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EventPage({ params }: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params;

    if (!name) return notFound();

    const res = await fetch(
        `http://localhost:${process.env.BOT_API_PORT}/events/${name}`,
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

    const data: Event = await res.json();
    
    return (
        <EventPageComponent data={data} logs={logs} />
    )
}