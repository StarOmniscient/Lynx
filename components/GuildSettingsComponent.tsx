import React, { useState } from "react";

interface GuildSettingsProps {
  initialGuildId?: string;
  initialChannels?: Record<string, string>;
  onSave?: (guildId: string, channels: Record<string, string>) => void;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col space-y-2">
    <span className="text-sm font-semibold text-gray-300">{label}</span>
    {value}
  </div>
);

export default function GuildSettings({
  initialGuildId = "",
  initialChannels = {},
  onSave,
}: GuildSettingsProps) {
  const [guildId, setGuildId] = useState(initialGuildId);
  const [channelsText, setChannelsText] = useState(
    JSON.stringify(initialChannels, null, 2)
  );

  const handleSave = () => {
    try {
      const parsed = JSON.parse(channelsText || "{}");
      onSave?.(guildId, parsed);
    } catch (err) {
      alert("Invalid JSON format for channels!");
    }
  };

  return (
    <div className="p-8 text-white bg-[#0c0f1a] min-h-screen">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">Guild Settings</h1>

      <div className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-lg p-6 space-y-6">
        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow
            label="Guild ID"
            value={
              <input
                type="text"
                placeholder="Enter Guild ID"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                className="bg-[#0c0f1a] border border-[#1f2435] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            }
          />

          <InfoRow
            label="Channels JSON"
            value={
              <textarea
                placeholder='{"APM":"12345","SJL":"67890"}'
                value={channelsText}
                onChange={(e) => setChannelsText(e.target.value)}
                className="bg-[#0c0f1a] border border-[#1f2435] rounded-lg px-3 py-2 w-full h-40 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            }
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded-xl shadow-lg"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
