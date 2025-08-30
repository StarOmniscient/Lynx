import { Cron } from "@/bot/structures/Cron";
import CronCard from "@/components/CronCard";

export const dynamic = "force-dynamic";

export default async function Crons() {
    const res = await fetch(`http://localhost:${process.env.BOT_API_PORT}/crons`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
    return (
        <>
        {data.crons.map((cron: Cron) => {
                return (
                    <CronCard cron={cron} key={cron.name} />
                )
            })}
        </>
    )
}