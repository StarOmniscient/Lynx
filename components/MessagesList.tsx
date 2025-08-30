"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  channelId: string;
  createdTimestamp: number;
  author: { username: string; globalName: string; id: string };
}

interface Props {
  guild: string;
  channel: string;
}

export default function MessagesList({ guild, channel }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/get/messages?guild=${guild}&channel=${channel}`);
    const data = await res.json();
    setMessages(data.sort((a: Message, b: Message) => a.createdTimestamp - b.createdTimestamp));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // every 3 seconds
    return () => clearInterval(interval);
  }, [guild, channel]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => {
        const date = new Date(message.createdTimestamp);
        const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateString = date.toLocaleDateString();
        return (
          <Card key={message.id} className="bg-[#141826] border border-[#1f2435] rounded-xl shadow-md w-full">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2a3042] flex items-center justify-center text-white text-sm">
                  {message.author.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 font-semibold">{message.author.globalName || message.author.username}</span>
                <span className="text-gray-500 text-xs">{dateString} {timeString}</span>
              </div>
              <p className="text-white ml-10">{message.content}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
