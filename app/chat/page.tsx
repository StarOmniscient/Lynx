import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"   // ✅ make sure this is from next/image

export default async function ChatPage() {
    const data = await fetch(`http://localhost:${process.env.BOT_API_PORT}/guilds`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: "no-store",
    })
    const guilds: { guilds: { id: string; name: string; iconUrl: string }[] } = await data.json()

    return (
        <>
            {guilds.guilds.map((guild) => (
                <Link href={`/chat/${guild.id}`} key={guild.id}>
                    <Card className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-md hover:shadow-lg max-w-64 w-full transition-all inline-flex items-start ml-1">
                        <CardContent className="p-4 flex items-center gap-3">
                            {guild.iconUrl ? (
                                <Image
                                    src={guild.iconUrl}
                                    alt={guild.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full border border-[#2a3042]"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white">
                                    {guild.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h3 className="text-white text-lg font-semibold">{guild.name}</h3>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </>
    )
}
