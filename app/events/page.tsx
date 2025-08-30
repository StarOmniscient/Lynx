import { Event } from "@/bot/structures/Event";
import EventCard from "@/components/EventCard";

export const dynamic = "force-dynamic";

export default async function Events() {
    const res = await fetch(`http://localhost:${process.env.BOT_API_PORT}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();

    return (
        <>
        {data.events.map((event: Event) => {
                return (
                    <EventCard event={event} key={event.name} />
                )
            })}
        </>
    )
}