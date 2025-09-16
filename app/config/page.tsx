"use client";
import EduChannelSettingsComponent from "@/components/EduChannelSettingsComponent";
import RewindGuildSettingsComponent from "@/components/RewindGuildSettingsComponent";

const Settings = () => {

  return (
    <>
    <EduChannelSettingsComponent />
    <RewindGuildSettingsComponent />
    </>

            

  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <div className="text-base">{value}</div>
  </div>
);

export default Settings;
