import MessageForm from "@/components/MessageForm";
import MessagesList from "@/components/MessagesList";

export default async function ChannelPage({ params }: { params: Promise<{ guild: string, channel: string }> }) {
  const { guild, channel } = await params;

  return (
    <div className="flex flex-col h-[90vh] bg-[#0c0f1a] border border-[#1f2435] rounded-2xl shadow-md overflow-hidden">
      <MessagesList guild={guild} channel={channel} />
      <div className="p-4 border-t border-[#1f2435] bg-[#141826]">
        <MessageForm guild={guild} channel={channel} />
      </div>
    </div>
  );
}
