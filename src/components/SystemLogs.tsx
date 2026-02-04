import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Search, Filter, Calendar } from 'lucide-react';
import { Input } from './ui/input';

interface SystemLog {
    _id: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
    action: string;
    details: string;
    ipAddress: string;
    timestamp: string;
}

export function SystemLogs() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterAction, setFilterAction] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterAction) params.action = filterAction;
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;

            const res = await axios.get('/api/logs', { params });
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-[#001F3F] text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8" />
                        System Audit Logs
                    </h2>
                    <p className="text-gray-500">Track all critical system activities and security events.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Search Action</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="e.g. LOGIN, PAYMENT"
                                className="pl-10"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#001F3F] text-white px-4 py-2 rounded-md hover:bg-[#003366] flex items-center gap-2 h-10"
                    >
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Timestamp</th>
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Action</th>
                                <th className="px-6 py-3 font-semibold">Details</th>
                                <th className="px-6 py-3 font-semibold">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-[#001F3F]">{log.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{log.user?.email || 'No Email'}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                                                    log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' :
                                                        log.action.includes('create') || log.action.includes('REGISTER') ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 max-w-xs truncate" title={typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}>
                                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-gray-400">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {loading ? 'Loading logs...' : 'No logs found matching criteria.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
