import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    ShieldAlert, Plus, Trash2, CheckCircle, XCircle,
    Filter, Download, FileText, Edit2, Search, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { usePagination } from '../hooks/usePagination';
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from './ui/pagination';

// ─── Offense Catalog ────────────────────────────────────────────────────────
const OFFENSE_CATALOG: Record<string, { offense: string; points: number }[]> = {
    'Level 1': [
        { offense: 'Littering', points: 1 },
        { offense: 'Vandalism', points: 2 },
        { offense: 'Improper spitting', points: 2 },
        { offense: 'Making boisterous noise', points: 3 },
        { offense: 'Uniform violation', points: 1 },
        { offense: 'Failure to register in the Logbook/Attendance', points: 5 },
        { offense: 'Leaving personal belongings in shared spaces', points: 3 },
        { offense: 'Improper garbage segregation and disposal', points: 3 },
        { offense: 'Topless and improper clothes outside the sleeping quarter', points: 2 },
        { offense: 'Sleeping in dorm rooms earlier than stipulated', points: 2 },
        { offense: 'Displaying disorderly conduct (e.g. bullying, oral defamation, public display of affection)', points: 2 },
        { offense: 'Failure to turn off lights, electric fan, and electrical appliances', points: 3 },
        { offense: 'Not attending meetings and activities called by the Dorm Manager', points: 3 },
    ],
    'Level 2': [
        { offense: 'Gambling', points: 8 },
        { offense: 'Immoral Acts', points: 5 },
        { offense: 'Insubordination', points: 5 },
        { offense: 'Dishonesty in any form', points: 5 },
        { offense: 'Non-compliance with sleeping arrangement', points: 5 },
        { offense: 'Violation of curfew, study and visiting hours', points: 5 },
        { offense: 'Sleeping overnight outside the dorm without permission', points: 5 },
        { offense: 'Spreading rumors that damage the reputation of other occupants', points: 5 },
        { offense: "No resident's Leave Pass when going out of the dormitory or when coming home late", points: 5 },
        { offense: 'Disrespect towards dormitory staff or other residents', points: 8 },
        { offense: 'Allowing outsiders to enter restricted areas for guests', points: 8 },
    ],
    'Level 3': [
        { offense: 'Drinking/consumption of intoxicating beverages within dormitory premises', points: 15 },
        { offense: 'Drugs: possession, use, or sale of marijuana, narcotics, and hallucinogens', points: 15 },
        { offense: 'Smoking (including electronic) within dormitory premises', points: 15 },
        { offense: 'Stealing or attempting to steal money and other property', points: 15 },
        { offense: 'Vandalism to glass panes, walls, and dormitory properties', points: 15 },
        { offense: 'Immoral/Indecent behavior including possession of obscene literature, pornographic materials', points: 15 },
        { offense: 'Misbehavior such as fighting, physical assaulting, intimidating other residents', points: 15 },
        { offense: 'Cooking inside the room', points: 15 },
        { offense: 'Unauthorized use of electrical appliances', points: 15 },
        { offense: 'Repeated/habitual violation of dormitory policies', points: 15 },
    ],
};

const LEVEL_COLORS: Record<string, string> = {
    'Level 1': 'bg-yellow-100 text-yellow-800',
    'Level 2': 'bg-orange-100 text-orange-800',
    'Level 3': 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
    Active: 'bg-red-100 text-red-700',
    Resolved: 'bg-green-100 text-green-700',
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function DisciplineManagement() {
    const { user } = useAuth();
    const [violations, setViolations] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingViolation, setEditingViolation] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const [formData, setFormData] = useState({
        student: '',
        offenseLevel: 'Level 1',
        offense: OFFENSE_CATALOG['Level 1'][0].offense,
        points: OFFENSE_CATALOG['Level 1'][0].points,
        dateOfOffense: moment().format('YYYY-MM-DD'),
        notes: '',
    });

    useEffect(() => { fetchViolations(); fetchStudents(); }, []);

    const fetchViolations = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/violations');
            setViolations(res.data);
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to load violations', 'error');
        } finally { setIsLoading(false); }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/students');
            setStudents(res.data);
        } catch { /* silently fail */ }
    };

    const handleLevelChange = (level: string) => {
        const first = OFFENSE_CATALOG[level][0];
        setFormData(f => ({ ...f, offenseLevel: level, offense: first.offense, points: first.points }));
    };

    const handleOffenseChange = (offense: string) => {
        const found = OFFENSE_CATALOG[formData.offenseLevel].find(o => o.offense === offense);
        setFormData(f => ({ ...f, offense, points: found?.points ?? 0 }));
    };

    const openCreateModal = () => {
        setEditingViolation(null);
        const first = OFFENSE_CATALOG['Level 1'][0];
        setFormData({
            student: '', offenseLevel: 'Level 1',
            offense: first.offense, points: first.points,
            dateOfOffense: moment().format('YYYY-MM-DD'), notes: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (v: any) => {
        setEditingViolation(v);
        setFormData({
            student: v.student?._id || '',
            offenseLevel: v.offenseLevel,
            offense: v.offense,
            points: v.points,
            dateOfOffense: moment(v.dateOfOffense).format('YYYY-MM-DD'),
            notes: v.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student) { Swal.fire('Warning', 'Please select a student.', 'warning'); return; }
        try {
            if (editingViolation) {
                await axios.patch(`/api/violations/${editingViolation._id}`, formData);
                Swal.fire('Success', 'Violation updated.', 'success');
            } else {
                await axios.post('/api/violations', formData);
                Swal.fire('Success', 'Violation recorded.', 'success');
            }
            setIsModalOpen(false);
            fetchViolations();
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to save violation.', 'error');
        }
    };

    const handleResolve = async (id: string) => {
        const confirm = await Swal.fire({ title: 'Mark as Resolved?', icon: 'question', showCancelButton: true, confirmButtonColor: '#001F3F' });
        if (!confirm.isConfirmed) return;
        try {
            await axios.patch(`/api/violations/${id}`, { status: 'Resolved' });
            Swal.fire('Done', 'Violation marked as resolved.', 'success');
            fetchViolations();
        } catch (err: any) { Swal.fire('Error', err.response?.data?.message || 'Failed.', 'error'); }
    };

    const handleDelete = async (id: string) => {
        const confirm = await Swal.fire({ title: 'Delete Violation?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
        if (!confirm.isConfirmed) return;
        try {
            await axios.delete(`/api/violations/${id}`);
            Swal.fire('Deleted', 'Violation removed.', 'success');
            fetchViolations();
        } catch (err: any) { Swal.fire('Error', err.response?.data?.message || 'Failed.', 'error'); }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('DormSync – Discipline Records', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated: ${moment().format('MMMM DD, YYYY HH:mm')}`, 14, 30);
        autoTable(doc, {
            head: [['Student', 'Level', 'Offense', 'Points', 'Date', 'Status']],
            body: filtered.map(v => [
                v.student?.name || 'N/A',
                v.offenseLevel, v.offense, v.points,
                moment(v.dateOfOffense).format('MMM DD, YYYY'),
                v.status,
            ]),
            startY: 38,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 31, 63] },
        });
        doc.save(`Discipline_${moment().format('YYYYMMDD')}.pdf`);
    };

    const exportToCSV = () => {
        const headers = ['Student', 'Student ID', 'Level', 'Offense', 'Points', 'Date', 'Status', 'Notes', 'Reported By'];
        const rows = filtered.map(v => [
            v.student?.name || 'N/A', v.student?.studentId || 'N/A',
            v.offenseLevel, `"${v.offense}"`, v.points,
            moment(v.dateOfOffense).format('YYYY-MM-DD'),
            v.status, `"${v.notes || ''}"`, v.reportedBy?.name || 'N/A',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Discipline_${moment().format('YYYYMMDD')}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    const filtered = violations.filter(v => {
        const matchSearch = !search || v.student?.name?.toLowerCase().includes(search.toLowerCase()) || v.student?.studentId?.includes(search);
        const matchLevel = filterLevel === 'All' || v.offenseLevel === filterLevel;
        const matchStatus = filterStatus === 'All' || v.status === filterStatus;
        return matchSearch && matchLevel && matchStatus;
    });

    const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(filtered, 10);
    const currentRows = currentData();

    const totalActive = violations.filter(v => v.status === 'Active').length;
    const totalResolved = violations.filter(v => v.status === 'Resolved').length;
    const canDelete = user?.role === 'admin' || user?.role === 'manager';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-[#001F3F] text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-600" /> Discipline Management
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Track and manage student violation records</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportToCSV} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        <Download className="w-4 h-4 mr-2" /> CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                        <FileText className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button onClick={openCreateModal} className="bg-[#001F3F] text-white hover:bg-[#003366]">
                        <Plus className="w-4 h-4 mr-2" /> Add Violation
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-[#001F3F]">
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="text-3xl font-bold text-[#001F3F]">{violations.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-3xl font-bold text-red-600">{totalActive}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{totalResolved}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-[#FFD700] outline-none"
                        placeholder="Search by name or student ID..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD700] outline-none" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                    <option value="All">All Levels</option>
                    <option>Level 1</option><option>Level 2</option><option>Level 3</option>
                </select>
                <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD700] outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option>Active</option><option>Resolved</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#001F3F] text-white text-left">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4">Offense</th>
                                <th className="px-6 py-4">Points</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#001F3F] border-t-transparent rounded-full animate-spin" />
                                        Loading records...
                                    </div>
                                </td></tr>
                            ) : currentRows.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">No violation records found.</td></tr>
                            ) : currentRows.map((v: any) => (
                                <tr key={v._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{v.student?.name}</div>
                                        <div className="text-xs text-gray-500">{v.student?.studentId}</div>
                                        {v.student?.studentProfile?.roomNumber && (
                                            <div className="text-xs text-gray-400">Room {v.student.studentProfile.roomNumber}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[v.offenseLevel]}`}>
                                            {v.offenseLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="truncate" title={v.offense}>{v.offense}</div>
                                        {v.notes && <div className="text-xs text-gray-400 italic truncate" title={v.notes}>{v.notes}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-[#001F3F]">{v.points}</span>
                                        <span className="text-gray-400 text-xs ml-1">pts</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{moment(v.dateOfOffense).format('MMM DD, YYYY')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v.status]}`}>
                                            {v.status === 'Active' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditModal(v)} className="text-[#001F3F] border-[#001F3F] hover:bg-blue-50">
                                                <Edit2 className="w-3 h-3" />
                                            </Button>
                                            {v.status === 'Active' && (
                                                <Button size="sm" onClick={() => handleResolve(v._id)} className="bg-green-600 text-white hover:bg-green-700">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(v._id)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {maxPage > 1 && (
                    <div className="p-4 border-t">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious onClick={prev} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                </PaginationItem>
                                {Array.from({ length: maxPage }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink isActive={currentPage === i + 1} onClick={() => jump(i + 1)} className="cursor-pointer">{i + 1}</PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext onClick={next} className={currentPage === maxPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingViolation ? 'Edit Violation' : 'Record New Violation'}</DialogTitle>
                        <DialogDescription>Fill in the details of the offense below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="vStudent">Student</Label>
                            <select id="vStudent" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFD700]"
                                value={formData.student} onChange={e => setFormData(f => ({ ...f, student: e.target.value }))} required>
                                <option value="">— Select Student —</option>
                                {students.map((s: any) => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vLevel">Offense Level</Label>
                                <select id="vLevel" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFD700]"
                                    value={formData.offenseLevel} onChange={e => handleLevelChange(e.target.value)}>
                                    <option>Level 1</option><option>Level 2</option><option>Level 3</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vDate">Date of Offense</Label>
                                <Input id="vDate" type="date" value={formData.dateOfOffense}
                                    onChange={e => setFormData(f => ({ ...f, dateOfOffense: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vOffense">Specific Offense</Label>
                            <select id="vOffense" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFD700]"
                                value={formData.offense} onChange={e => handleOffenseChange(e.target.value)}>
                                {OFFENSE_CATALOG[formData.offenseLevel].map(o => (
                                    <option key={o.offense} value={o.offense}>{o.offense} ({o.points} pts)</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Demerit points: <span className="font-semibold text-[#001F3F]">{formData.points} pts</span> (auto-set by offense)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vNotes">Notes (optional)</Label>
                            <Textarea id="vNotes" placeholder="Additional context or details..."
                                value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-[#001F3F] text-white hover:bg-[#003366]">
                                {editingViolation ? 'Save Changes' : 'Record Violation'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
