"use client"; // ✅ marks this as a Client Component

interface Props {
    guild: string;
    channel: string;
}

export default function MessageForm({ guild, channel }: Props) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget; // ✅ correctly typed as HTMLFormElement
        const formData = new FormData(form);
        const content = formData.get("content") as string;

        if (!content) return;

        await fetch(`/api/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guild, channel, content }),
        });

        form.reset(); // ✅ safe, form is not null
    };


    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="text"
                name="content"
                placeholder="Message #channel"
                className="flex-1 bg-[#0c0f1a] text-white p-3 rounded-xl border border-[#2a3042] focus:outline-none"
            />
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
            >
                Send
            </button>
        </form>
    );
}
