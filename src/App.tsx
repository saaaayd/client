import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { UserManagement } from './components/UserManagement';
import { PaymentsManagement } from './components/PaymentsManagement';
import { MaintenanceManagement } from './components/MaintenanceManagement';
import { AttendanceManagement } from './components/AttendanceManagement';
import { CleaningSchedule } from './components/CleaningSchedule';
import { AnnouncementsManagement } from './components/AnnouncementsManagement';
import RoomsManagement from './components/RoomsManagement';
import { SystemLogs } from './components/SystemLogs';


function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#001F3F] border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Force redirect if user is rejected (optional, maybe just logout?)
  const userStatus = (user as any).status || (user as any).studentProfile?.status;

  if (userStatus === 'rejected') {
    // For rejected, maybe show Login with error? 
    // Or just return Login component (which effectively logs them out of view, but state remains?)
    // Ideally we should logout. 
    // For now, let's just return Login.
    return <Login />;
  }

  // Pending users technically shouldn't reach here if we block them at Login/AuthContext, 
  // but if they do, we can just show Login (which will show the pending error if they try to interact or we can force logout)
  if (userStatus === 'pending') {
    return <Login />;
  }

  const renderPage = () => {
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'rooms':
          return <RoomsManagement />;
        case 'students':
          // Use UserManagement for admin users
          return <UserManagement />;
        case 'payments':
          return <PaymentsManagement />;
        case 'maintenance':
          return <MaintenanceManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        case 'cleaning':
          return <CleaningSchedule />;
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'logs':
          return <SystemLogs />;
        default:
          return <AdminDashboard />;
      }
    } else if (user.role === 'staff') { // Staff role
      switch (currentPage) {
        case 'dashboard':
          // Staff might share admin dashboard or have a reduced one. 
          // For now, let's reuse AdminDashboard or give them access to common modules.
          // Prompt says: "Staff can view room assignments, student lists"
          return <AdminDashboard />;
        case 'rooms':
          return <RoomsManagement />;
        case 'students':
          return <UserManagement />;
        case 'maintenance':
          return <MaintenanceManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        default:
          return <AdminDashboard />;
      }
    } else { // Student role
      switch (currentPage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'profile':
          return <StudentProfile />;
        case 'payments':
          return <StudentPayments />;
        case 'maintenance':
          return <MaintenanceManagement />; // Assuming MaintenanceManagement can be used by students too, or needs a StudentMaintenance component
        case 'cleaning':
          return <CleaningSchedule />; // Assuming CleaningSchedule can be used by students too, or needs a StudentCleaningSchedule component
        case 'attendance':
          return <AttendanceManagement />;
        case 'announcements':
          return <AnnouncementsManagement />; // Assuming AnnouncementsManagement can be used by students too
        default:
          return <StudentDashboard />;
      }
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

// Student-specific components (simplified versions)
function StudentProfile() {
  const { user, login } = useAuth(); // Re-use login to update local state if possible or reload
  // Ideally, useAuth should expose a setUser function, but we can just reload or rely on backend response.
  // Actually, login function sets session. We might need a way to just update the user in context.
  // For now, we will just update the UI state.

  const [profile, setProfile] = useState(user?.studentProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    phoneNumber: user?.studentProfile?.phoneNumber || '',
    emergencyContactName: user?.studentProfile?.emergencyContactName || '',
    emergencyContactPhone: user?.studentProfile?.emergencyContactPhone || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        studentProfile: {
          phoneNumber: formData.phoneNumber,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone
        }
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await axios.put('/api/auth/profile', payload);

      Swal.fire('Success', 'Profile updated successfully. Please re-login to see changes.', 'success').then(() => {
        window.location.reload();
      });
      setIsEditing(false);
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#001F3F]">My Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[#001F3F] hover:text-[#003366] underline text-sm"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Emergency Contact Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Emergency Contact Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-[#001F3F] text-white px-6 py-2 rounded hover:bg-[#003366]">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-8 pb-6 border-b">
              <div className="w-24 h-24 bg-[#001F3F] text-white rounded-full flex items-center justify-center text-3xl">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-[#001F3F]">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600 text-sm mt-1">Room {profile?.roomNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-[#001F3F]">{profile?.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrollment Date</p>
                <p className="text-[#001F3F]">
                  {profile?.enrollmentDate && new Date(profile.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                <p className="text-[#001F3F]">{profile?.emergencyContactName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Emergency Phone</p>
                <p className="text-[#001F3F]">{profile?.emergencyContactPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 text-sm">
                  {profile?.status}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get('/api/payments/my-history');
        setPayments(res.data);
      } catch (error) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  const handleFileChange = (paymentId: number, file: File | null) => {
    setFiles((prev) => ({ ...prev, [paymentId]: file }));
  };

  const handleSubmitReceipt = async (payment: any) => {
    const file = files[payment._id] || null;
    if (!file) {
      Swal.fire('Missing receipt', 'Please attach a photo of your receipt first.', 'warning');
      return;
    }

    setSubmittingId(payment._id);

    const formData = new FormData();
    formData.append('status', 'paid');
    formData.append('receipt_image', file);

    try {
      await axios.put(`/api/payments/${payment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Swal.fire('Submitted', 'Your receipt was uploaded. Please wait for admin approval.', 'success');
      setFiles((prev) => ({ ...prev, [payment._id]: null }));

      // Refresh payments
      const res = await axios.get('/api/payments/my-history');
      setPayments(res.data);

    } catch (error: any) {
      console.error(error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to submit receipt. Please try again.',
        'error',
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalDue = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#001F3F]">My Payments</h2>
        <p className="text-gray-600 text-sm mt-1">
          View your payment history and outstanding balance
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#001F3F] to-[#003366] text-white rounded-lg shadow-lg p-6">
        <p className="text-white/80 mb-2">Current Balance</p>
        <p className="text-4xl text-[#FFD700] mb-1">
          {currencyFormatter.format(totalDue)}
        </p>
        <p className="text-white/80 text-sm">
          {pendingPayments.length} pending payment(s)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payments have been posted for your account yet.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#001F3F] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Type</th>
                  <th className="px-6 py-3 text-left text-sm">Amount</th>
                  <th className="px-6 py-3 text-left text-sm">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Notes</th>
                  <th className="px-6 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="capitalize bg-gray-100 px-3 py-1 rounded text-sm">
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {currencyFormatter.format(Number(payment.amount || 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.dueDate
                        ? new Date(payment.dueDate).toLocaleDateString()
                        : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs ${payment.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(payment.status === 'pending' || payment.status === 'overdue') && !payment.receiptUrl ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) =>
                              handleFileChange(payment._id, e.target.files?.[0] || null)
                            }
                            className="text-xs w-full"
                          />
                          <button
                            onClick={() => handleSubmitReceipt(payment)}
                            disabled={submittingId === payment._id}
                            className="bg-[#001F3F] text-white px-3 py-1 rounded text-xs hover:bg-[#003366] disabled:opacity-50"
                          >
                            {submittingId === payment._id ? 'Submitting...' : 'Submit Receipt'}
                          </button>
                        </div>
                      ) : payment.receiptUrl ? (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-xs"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentMaintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urgency: 'low',
  });

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/maintenance', {
        params: { student_id: user.id },
      });
      setRequests(res.data);
    } catch (error) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      Swal.fire('Missing fields', 'Please fill in title and description.', 'warning');
      return;
    }

    try {
      await axios.post('/api/maintenance', {
        student_id: user?.id,
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency,
        room_number: user?.studentProfile?.roomNumber,
      });
      Swal.fire('Submitted', 'Your maintenance request has been sent.', 'success');
      setFormData({ title: '', description: '', urgency: 'low' });
      setIsFormOpen(false);
      fetchRequests();
    } catch (error) {
      Swal.fire('Error', 'Failed to submit request.', 'error');
    }
  };

  const statusColor = (status: string) => {
    if (status === 'resolved') return 'bg-green-100 text-green-700';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#001F3F]">Maintenance Requests</h2>
          <p className="text-gray-600 text-sm mt-1">
            Submit and track your maintenance requests
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors"
        >
          Submit Request
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-[#001F3F] mb-4">New Maintenance Request</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Urgency Level</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
                placeholder="Provide detailed information about the issue"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#001F3F] text-white px-6 py-2 rounded-lg hover:bg-[#003366] transition-colors"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-[#001F3F] mb-4">My Requests</h3>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven’t submitted any requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[#001F3F] font-semibold">{req.title}</h4>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{req.description}</p>
                <div className="text-xs text-gray-500 flex gap-3">
                  <span className="capitalize">Urgency: {req.urgency}</span>
                  <span>Room: {req.room_number || user?.studentProfile?.roomNumber || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentCleaningSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get('/api/cleaning-schedule', {
          params: { student_id: user.id },
        });
        setSchedules(res.data);
      } catch (error) {
        console.error('Error fetching cleaning schedules', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#001F3F]">Cleaning Schedule</h2>
        <p className="text-gray-600 text-sm mt-1">
          View the cleaning tasks assigned to your room
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading schedule...</div>
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No cleaning tasks assigned to your room yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#001F3F] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Area</th>
                <th className="px-6 py-3 text-left text-sm">Scheduled Date</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{schedule.area}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(schedule.scheduled_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${schedule.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {schedule.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
