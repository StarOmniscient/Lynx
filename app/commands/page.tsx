import CommandCard, { ICommand } from "@/components/CommandCard";

export const dynamic = "force-dynamic";


const Commands = async () => {
    async function fetchData() {
        const res = await fetch(`http://localhost:${process.env.BOT_API_PORT}/commands`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
        return data
    }
    return (
        <div>
            {await fetchData().then((data) => {
                return (
                    <div>
                        {data.commands.map((command: ICommand) => (
                            <CommandCard key={command.name} command={command} />
                        ))}
                    </div>
                )
            }
            )
            }



        </div>
    )
}
export default Commands