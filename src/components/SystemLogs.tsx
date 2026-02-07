import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ShieldCheck, Search, Filter, Calendar, FileText } from 'lucide-react';
import { Input } from './ui/input';
import { usePagination } from '../hooks/usePagination';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./ui/pagination";

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

    const exportLogsPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('DormSync System Logs', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        if (dateRange.start || dateRange.end) {
            doc.text(`Range: ${dateRange.start || 'Start'} to ${dateRange.end || 'Now'}`, 14, 36);
        }

        const tableColumn = ["Timestamp", "User", "Action", "Details", "IP"];
        const tableRows: any[] = [];

        logs.forEach(log => {
            const rowData = [
                new Date(log.timestamp).toLocaleString(),
                `${log.user?.name || 'Unknown'} (${log.user?.role || 'N/A'})`,
                log.action,
                typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
                log.ipAddress
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 31, 63] }
        });

        doc.save(`dormsync-logs-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(logs, 15);
    const currentLogs = currentData();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-[#001F3F] text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8" />
                        System Audit Logs
                    </h2>
                    <p className="text-gray-500">Track all critical system activities and security events.</p>
                </div>
                <button
                    onClick={exportLogsPDF}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 w-full md:w-auto"
                >
                    <FileText className="w-4 h-4" />
                    Export PDF
                </button>
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
                    <div className="w-full md:w-auto">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#001F3F] text-white px-4 py-2 rounded-md hover:bg-[#003366] flex items-center justify-center gap-2 h-10 w-full md:w-auto"
                    >
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </form>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden border border-gray-100">
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
                            {currentLogs.length > 0 ? (
                                currentLogs.map((log) => (
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

                {/* Pagination Controls Desktop */}
                {maxPage > 1 && (
                    <div className="p-4 border-t border-gray-100">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => { e.preventDefault(); prev(); }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                {Array.from({ length: maxPage }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={(e) => { e.preventDefault(); jump(i + 1); }}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => { e.preventDefault(); next(); }}
                                        className={currentPage === maxPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {currentLogs.length > 0 ? (
                    currentLogs.map((log) => (
                        <div key={log._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit mb-1 ${log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' :
                                            log.action.includes('create') || log.action.includes('REGISTER') ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-[#001F3F] text-sm">{log.user?.name || 'Unknown'}</div>
                                    <div className="text-[10px] text-gray-500">{log.user?.role || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-50 text-sm text-gray-700">
                                <p className="mb-1"><span className="text-gray-500 text-xs uppercase">Details:</span> {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>
                                <p className="text-xs text-gray-400 font-mono">IP: {log.ipAddress}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                        {loading ? 'Loading logs...' : 'No logs found matching criteria.'}
                    </div>
                )}

                {/* Pagination Controls Mobile */}
                {maxPage > 1 && (
                    <div className="flex justify-center pt-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => { e.preventDefault(); prev(); }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="mx-2 text-sm">{currentPage} / {maxPage}</span>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => { e.preventDefault(); next(); }}
                                        className={currentPage === maxPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div >
    );
}
