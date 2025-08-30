import { Cron } from "@/bot/structures/Cron";
import LogsList from "./LogList";

export default function CronPageComponent({ data, logs }: {
  data: Cron, logs: {
    id: number;
    timestamp: Date;
    level: string;
    message: string;
    context: string | null;
  }[]
}) {
  return (
    <div className="p-8 text-white bg-[#0c0f1a] min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Cron Job: {data.name}</h1>

      <div className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-lg p-6 space-y-6">
        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Description" value={data.description} />
          <InfoRow label="Enabled" value={data.enabled ? "Yes" : "No"} />
          <InfoRow label="Repeat Time" value={`${data.repeatTime} seconds (${data.repeatTime / 1000 / 60 /60} hours)`} />
          <InfoRow
            label="Exclude Run On Start"
            value={data.excludeRunOnStart ? "Yes" : "No"}
          />
        </div>

        {/* Logs Section */}
        <LogsList logs={logs} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1f2435] rounded-lg p-3">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white font-medium">{value || "-"}</p>
    </div>
  );
}
