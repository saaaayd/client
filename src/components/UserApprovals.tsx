import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Check, X, User, Mail, Phone, Calendar } from 'lucide-react';

interface PendingUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    studentProfile?: {
        roomNumber: string;
        phoneNumber: string;
        enrollmentDate: string;
    };
    createdAt: string;
}

const UserApprovals: React.FC = () => {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const response = await axios.get('/api/users/pending');
            setPendingUsers(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setIsLoading(false);
        }
    };

    const handleApprove = async (user: PendingUser) => {
        const result = await Swal.fire({
            title: 'Approve User?',
            text: `Are you sure you want to approve ${user.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Approve'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`/api/users/${user._id}/approve`);
                setPendingUsers(pendingUsers.filter(u => u._id !== user._id));
                Swal.fire('Approved!', 'User account has been activated.', 'success');
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to approve user', 'error');
            }
        }
    };

    const handleReject = async (user: PendingUser) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject User',
            input: 'textarea',
            inputLabel: 'Reason for rejection',
            inputPlaceholder: 'Enter the reason...',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Reject User',
            inputValidator: (value) => {
                if (!value) {
                    return 'You must provide a reason!';
                }
            }
        });

        if (reason) {
            try {
                await axios.put(`/api/users/${user._id}/reject`, { reason });
                setPendingUsers(pendingUsers.filter(u => u._id !== user._id));
                Swal.fire('Rejected!', 'User account has been rejected.', 'success');
            } catch (error: any) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to reject user', 'error');
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Pending User Approvals</h1>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : pendingUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No pending approvals</p>
                    <p className="text-sm">All set! There are no new registration requests at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingUsers.map(user => (
                        <div key={user._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{user.name}</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium uppercase">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {user.email}
                                    </div>
                                    {user.studentProfile?.phoneNumber && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            {user.studentProfile.phoneNumber}
                                        </div>
                                    )}
                                    {user.studentProfile?.roomNumber && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <span className="w-4 flex justify-center text-slate-400 font-bold">#</span>
                                            Room {user.studentProfile.roomNumber}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleReject(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(user)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserApprovals;
