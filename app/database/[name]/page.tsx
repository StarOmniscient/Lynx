import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";





export default async function DatabasePage({ params }: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params;

    if (!name) return notFound()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = await (prisma as any)[name as keyof PrismaClient].findMany()
    if (db.length == 0) {
        return (
            <p>No data found</p>
        )
    }
    const keys = Object.keys(db[0])

    return (
        <>
            {db.map((item: string, index: number) => (
                <div
                    key={index}
                    className="w-full border border-[#2a3042] rounded-xl overflow-hidden mb-4 bg-[#141826] text-white"
                >
                    <div className="flex flex-col md:flex-row">
                        {keys.map((key: string) => {
                            const value = item[key as keyof typeof item];
                            return (
                                <div
                                    key={`${key}-${String(value)}`}
                                    className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-[#2a3042] last:border-r-0"
                                >
                                    <div className="text-gray-400 text-sm mb-1">{key}</div>
                                    <div>
                                        {value instanceof Date
                                            ? value.toLocaleString()
                                            : typeof value === "object"
                                                ? <pre className="whitespace-pre-wrap break-words text-sm">
                                                    {JSON.stringify(value, null, 2)}
                                                </pre>
                                                : String(value)}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </div>
            ))}

        </>
    )
}