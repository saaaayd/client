import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LEVEL_COLORS: Record<string, string> = {
    'Level 1': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Level 2': 'bg-orange-100 text-orange-800 border-orange-300',
    'Level 3': 'bg-red-100 text-red-800 border-red-300',
};

export function StudentDiscipline() {
    const { user } = useAuth();
    const [data, setData] = useState<{ violations: any[]; totalPoints: number }>({ violations: [], totalPoints: 0 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { fetchMyViolations(); }, []);

    const fetchMyViolations = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/violations/my');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching violations:', err);
        } finally { setIsLoading(false); }
    };

    const getWarningLevel = (pts: number) => {
        if (pts >= 20) return { label: 'Critical – Risk of Dismissal', color: 'bg-red-600', text: 'text-white' };
        if (pts >= 10) return { label: 'Warning – High Demerit Points', color: 'bg-orange-500', text: 'text-white' };
        if (pts >= 5) return { label: 'Caution – Moderate Demerit Points', color: 'bg-yellow-400', text: 'text-[#001F3F]' };
        return { label: 'Good Standing', color: 'bg-green-500', text: 'text-white' };
    };

    const warn = getWarningLevel(data.totalPoints);

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-[#001F3F] text-2xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-red-600" /> My Discipline Record
                </h2>
                <p className="text-gray-600 text-sm mt-1">View your demerit points and violation history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-[#001F3F]">
                    <p className="text-sm text-gray-500">Total Demerit Points</p>
                    <p className="text-5xl font-black text-[#001F3F] mt-1">{data.totalPoints}</p>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${warn.color} ${warn.text}`}>
                        {warn.label}
                    </span>
                </div>
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Total Violations</p>
                    <p className="text-4xl font-bold text-red-600 mt-1">{data.violations.length}</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                    <strong>Demerit System:</strong> Points are cumulative and may lead to corrective actions.
                    Level 1 (Minor), Level 2 (Major), Level 3 (Grounds for Separation).
                    Contact your dormitory manager for concerns.
                </div>
            </div>

            {/* Violations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-[#001F3F]">Violation History</h3>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center gap-2 py-12 text-gray-500">
                        <div className="w-4 h-4 border-2 border-[#001F3F] border-t-transparent rounded-full animate-spin" />
                        Loading...
                    </div>
                ) : data.violations.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        No violation records. Keep it up!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#001F3F] text-white text-left">
                                <tr>
                                    <th className="px-6 py-4">Offense Level</th>
                                    <th className="px-6 py-4">Violation</th>
                                    <th className="px-6 py-4">Points</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.violations.map((v: any) => (
                                    <tr key={v._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${LEVEL_COLORS[v.offenseLevel]}`}>
                                                {v.offenseLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-medium text-gray-800">{v.offense}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-red-600">
                                                {v.points}
                                            </span>
                                            <span className="text-gray-400 text-xs ml-1">pts</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            {moment(v.dateOfOffense).format('MMM DD, YYYY')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs italic max-w-xs truncate">
                                            {v.notes || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
