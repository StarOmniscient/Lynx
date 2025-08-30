export default function LogsList({ logs }: {
    logs: {
        id: number;
        timestamp: Date;
        level: string;
        message: string;
        context: string | null;
    }[]
}) {

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Logs</h2>
            {logs.length === 0 ? (
                <p className="text-gray-400 text-sm">No logs found.</p>
            ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide" >
                    {[...logs]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((log) => (
                            <div key={log.id} className="p-2 border-b border-[#2a3042]">
                                <p className="text-sm text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </p>
                                <p className="text-white">{log.message}</p>
                            </div>
                        ))}
                </ul>
            )}
        </div>
    );
}