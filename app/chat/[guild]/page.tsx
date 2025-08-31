import { Card, CardContent } from "@/components/ui/card";
import { currentBotMode } from "@/lib/utils"
import Link from "next/link";

export default async function GuildPage({ params }: {
    params: Promise<{ guild: string }>
}
) {
    const { guild } = await params
    let token;
    if (currentBotMode() === "development") {
        token = process.env.DEV_BOT_TOKEN
    }
    else if (currentBotMode() === "production") {
        token = process.env.PROD_BOT_TOKEN
    }

    const res = await fetch(`https://discord.com/api/guilds/${guild}/channels`, {
        headers: {
            "Authorization": `Bot ${token}`,
            "Content-Type": "application/json",
        },
    })

    const data = await res.json()
    
    console.log(data)
    if (data.message === "Missing Access") {
        return <div>
            Bot doesnt have permissions to see channels or Discord Api didnt update yet.
        </div>
    }

    const channels = data.filter((channel: { type: number }) => channel.type === 0)

    return (
        <div>
            {channels.map((channel: { id: string, type: number, name: string, guild_id: string }) => {
                return (
                    <Link href={`/chat/${channel.guild_id}/${channel.id}`} key={channel.id}>
                        <Card className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-md hover:shadow-lg max-w-64 w-full transition-all inline-flex items-start ml-1">
                            <CardContent className="p-4 flex items-center gap-3">
                                
                                <h3 className="text-white text-lg font-semibold">{channel.name}</h3>
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}