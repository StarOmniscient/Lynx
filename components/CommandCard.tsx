import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export interface ICommand {
  name: string;
  description: string;
  enabled: boolean;
}

const CommandCard = ({ command }: { command: ICommand }) => {
  return (
    <>
     <Link
      href={`/commands/${command.name}`}
    >
    <Card className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-md hover:shadow-lg max-w-64 w-full transition-all inline-flex items-start ml-1">
      <CardContent className="p-4">
        <h3 className="text-white text-lg font-semibold">{command.name}</h3>
        <p className="text-gray-400 text-sm mt-1">{command.description}</p>
        <p
          className={`mt-3 font-medium ${
            command.enabled ? "text-green-400" : "text-red-400"
          }`}
        >
          {command.enabled ? "Enabled" : "Disabled"}
        </p>
      </CardContent>
    </Card>
    </Link>
    </>
  );
};

export default CommandCard;
