"use client";

import { useEffect, useState } from "react";

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    context?: string;
}

const LOG_LEVELS = ["ALL", "INFO", "WARN", "ERROR", "DEBUG", "COMMAND", "EVENT", "CRON", "ALERT"];

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(false);

    async function fetchLogs(level: string) {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/get/logs?level=${level !== "ALL" ? level : ""}&limit=100`,
                { cache: "no-store" }
            );
            if (!res.ok) throw new Error("Failed to fetch logs");
            const data: LogEntry[] = await res.json();
            setLogs(data);
        } catch (err) {
            console.error(err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLogs(filter);
    }, [filter]);

    return (
        <div className="p-8 text-white bg-[#0c0f1a] min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Server Logs</h1>

            {/* Filter Dropdown */}
            <div className="mb-6">
                <label className="mr-2 font-semibold">Filter by Level:</label>
                <select
                    className="bg-[#1f2435] border border-[#2a3042] rounded-lg p-2 text-white"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    {LOG_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                            {lvl}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Loading logs...</p>
            ) : logs.length === 0 ? (
                <p>No logs found.</p>
            ) : (
                <div className="space-y-4">
                    {logs.map((log, i) => (
                        <div
                            key={i}
                            className="bg-[#141826] border border-[#1f2435] rounded-2xl shadow-lg p-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <InfoRow label="Timestamp" value={new Date(log.timestamp).toLocaleString()} />
                                <InfoRow label="Level" value={log.level.toUpperCase()} />
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-400 font-semibold">Message</p>
                                <p className="text-white">{log.message}</p>
                            </div>
                            {log.context && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-400 font-semibold">Context</p>
                                    <p className="text-white">{log.context}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
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
