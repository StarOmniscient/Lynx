import CommandCard, { ICommand } from "@/components/CommandCard";

const Commands = async () => {
    async function fetchData() {
        const res = await fetch('http://localhost:4444/commands', {
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