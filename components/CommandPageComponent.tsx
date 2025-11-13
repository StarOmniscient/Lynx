import { Command } from "@/bot/structures/Command";
import { ApplicationCommandOption, ApplicationCommandOptionChoiceData } from "discord.js";
import LogsList from "./LogList";



export default function CommandPageComponent({ data, logs }: { data: Command, logs: {
    id: number;
    timestamp: Date;
    level: string;
    message: string;
    context: string | null;
}[] }) {

  return (
    <div className="p-8 text-white bg-[#0c0f1a] min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Command: {data.name}</h1>

      {/* Card Container */}
      <div className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Description" value={data.description} />
          <InfoRow label="Category" value={data.category} />
          <InfoRow label="Cooldown" value={String(data.cooldown)} />
          <InfoRow label="Developer Only" value={data.dev == "development" ? "Yes" : "No"} />
          <InfoRow label="Server Only" value={data.serverOnly ? "Yes" : "No"} />
          <InfoRow label="Enabled" value={data.enabled ? "Yes" : "No"} />
          <InfoRow label="NSFW" value={data.nsfw ? "Yes" : "No"} />
          <InfoRow label="Allow DM" value={data.allowDm ? "Yes" : "No"} />
          <InfoRow
            label="User Permissions"
            value={
              Array.isArray(data.userPermissions)
                ? data.userPermissions.join(", ")
                : String(data.userPermissions)
            }
          />
          <InfoRow
            label="Client Permissions"
            value={
              Array.isArray(data.clientPermissions)
                ? data.clientPermissions.join(", ")
                : String(data.clientPermissions)
            }
          />
          <InfoRow
            label="Cooldown Filtered Users"
            value={
              Array.isArray(data.cooldownFilteredUsers)
                ? data.cooldownFilteredUsers.join(", ")
                : String(data.cooldownFilteredUsers)
            }
          />
        </div>

        {/* Options Section */}
        {data.options && data.options.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-6 mb-2">Options</h2>
            <div className="space-y-4">
              {data.options.map((opt: ApplicationCommandOption, i: number) => (
                <div
                  key={i}
                  className="bg-[#1f2435] rounded-xl p-4 border border-[#2a3042]"
                >
                  <p className="text-lg font-medium">
                    <span className="font-semibold">Name: </span>{opt.name}
                  </p>

                  <p className="text-sm">
                    <span className="font-semibold">Description: </span> {opt.description}
                  </p>

                  <p className="text-sm">
                    <span className="font-semibold">Type: </span> {opt.type}
                  </p>

                  {"required" in opt && (
                    <p className="text-sm">
                      <span className="font-semibold">Required: </span>{" "}
                      {opt.required ? "Yes" : "No"}
                    </p>
                  )}

                  {"autocomplete" in opt && opt.autocomplete && (
                    <p className="text-sm">
                      <span className="font-semibold">Autocomplete: </span> Yes
                    </p>
                  )}
                  
                  {"choices" in opt && (opt.choices?.length ?? 0) > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Choices:</p>
                      <ul className="list-disc ml-6 mt-1 space-y-1 text-sm">
                        {opt.choices!.map(
                          (choice: ApplicationCommandOptionChoiceData, j: number) => (
                            <li key={j}>
                              <span className="text-gray-300">
                                <span className="font-semibold">Name:</span>{" "}
                                {choice.name},{" "}
                                <span className="font-semibold">Value:</span>{" "}
                                {choice.value}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
