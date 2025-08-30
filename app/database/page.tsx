import { Card, CardContent } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function DatabasePage() {
    
    const data = Object.keys(prisma).filter(obj =>  !obj.startsWith("$") && !obj.startsWith("_") && obj != "constructor")

    return (
        <>
            {data.map((name: string) => {
                return (
                    <Link href={`/database/${name}`} key={name}>
                        <Card className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-md hover:shadow-lg max-w-64 w-full transition-all inline-flex items-start ml-1">
                            <CardContent className="p-4">
                                <h3 className="text-white text-lg font-semibold">{name}</h3>
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </>
    )
}