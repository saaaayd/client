import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Calendar, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';

interface AttendanceLogDto {
  id: number;
  student_id: number;
  student: { _id: string; name: string; studentProfile?: { roomNumber?: string } } | null;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: 'present' | 'absent' | 'late';
}

interface StudentOption {
  _id: string;
  name: string;
  studentProfile?: { roomNumber?: string };
}

export function AttendanceManagement() {
  const [attendance, setAttendance] = useState<AttendanceLogDto[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    fetchAttendance(selectedDate);
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const fetchAttendance = async (date: string) => {
    try {
      const res = await axios.get('/api/attendance', { params: { date } });
      setAttendance(res.data);
    } catch (error) {
      console.error('Error fetching attendance', error);
      Swal.fire('Error', 'Failed to load attendance logs.', 'error');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  const filteredAttendance = attendance;

  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;

  const handleRecord = async (type: 'check_in' | 'check_out') => {
    if (!selectedStudentId) {
      Swal.fire('Select student', 'Please choose a student to record attendance for.', 'warning');
      return;
    }

    try {
      const payload = {
        student_id: Number(selectedStudentId),
        date: selectedDate,
        status: 'present',
        [type]: new Date().toISOString().slice(11, 19), // HH:MM:SS
      };

      // Try to find existing log for this student/date
      const existing = attendance.find(
        a => a.student_id === Number(selectedStudentId) && a.date === selectedDate
      );

      if (existing) {
        await axios.put(`/api/attendance/${existing.id}`, payload);
      } else {
        await axios.post('/api/attendance', payload);
      }

      await fetchAttendance(selectedDate);
      Swal.fire(
        'Recorded',
        type === 'check_in' ? 'Check-in recorded successfully.' : 'Check-out recorded successfully.',
        'success'
      );
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to record attendance.', 'error');
    }
  };

  const formatTime = (time?: string | null) => {
    if (!time) return null;
    // time is HH:MM:SS from DB; create a Date for formatting
    const [h, m, s] = time.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), Number(s || 0));
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[#001F3F]">Attendance & Curfew Management</h2>
        <p className="text-gray-600 text-sm mt-1">Track student check-in and check-out logs</p>
      </div>

      {/* Date & Student Selector */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <label className="text-sm text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Student:</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl text-[#001F3F]">{filteredAttendance.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Present</p>
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-green-700">{presentCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Late</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-700">{lateCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Absent</p>
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl text-red-700">{absentCount}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-[#001F3F]">
            Attendance Log -{' '}
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#001F3F] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Student Name</th>
                <th className="px-6 py-3 text-left text-sm">Room Number</th>
                <th className="px-6 py-3 text-left text-sm">Check-In Time</th>
                <th className="px-6 py-3 text-left text-sm">Check-Out Time</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.map((log) => {
                const name = log.student?.name || 'Unknown';
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('');
                const room = log.student?.studentProfile?.roomNumber || 'N/A';

                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#001F3F] text-white rounded-full flex items-center justify-center text-sm">
                          {initials}
                        </div>
                        <span>{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 rounded text-sm">{room}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTime(log.check_in) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatTime(log.check_in)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTime(log.check_out) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatTime(log.check_out)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${log.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'late'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {log.status === 'present' ? (
                          <UserCheck className="w-3 h-3" />
                        ) : log.status === 'late' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curfew Info + quick record */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#FFD700] text-[#001F3F] p-3 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[#001F3F] mb-2">Curfew Policy</h3>
            <p className="text-gray-600 text-sm">
              All students must check in by 10:00 PM on weekdays and 11:00 PM on weekends.
              Late arrivals after curfew will be marked as "Late" and may be subject to disciplinary action.
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleRecord('check_in')}
                className="bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors text-sm"
              >
                Record Check-In
              </button>
              <button
                onClick={() => handleRecord('check_out')}
                className="bg-[#FFD700] text-[#001F3F] px-4 py-2 rounded-lg hover:bg-[#FFC700] transition-colors text-sm"
              >
                Record Check-Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
