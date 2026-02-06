
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Calendar, Clock, UserCheck, UserX, Scan } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { usePagination } from '../hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface AttendanceLogDto {
  _id: string; // Changed from id: number
  student: { _id: string; name: string; studentProfile?: { roomNumber?: string } } | string;
  date: string;
  timeIn?: string | null; // Changed from check_in
  timeOut?: string | null; // Changed from check_out
  status: 'present' | 'absent' | 'late';
}

interface StudentOption {
  _id: string;
  name: string;
  studentProfile?: { roomNumber?: string };
}

export function AttendanceManagement() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceLogDto[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  const recordAttendance = async (studentId: string, date: string, type: 'check_in' | 'check_out', logId?: string) => {
    try {
      // Backend expects 'student', 'date', 'timeIn', 'timeOut'
      const payload: any = {
        student: studentId,
        date: date,
        status: 'present',
      };

      if (type === 'check_in') {
        payload.timeIn = new Date();
      } else {
        payload.timeOut = new Date();
      }

      if (logId) {
        await axios.put(`/api/attendance/${logId}`, payload);
      } else {
        await axios.post('/api/attendance', payload);
      }
      await fetchAttendance(selectedDate);
    } catch (error: any) {
      throw error;
    }
  };

  const handleScan = async (text: string) => {
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!data.id) throw new Error('Invalid QR Code: Missing ID');

      setIsScannerOpen(false);

      const today = new Date().toISOString().split('T')[0];
      // Refresh logs for today to ensure we have latest status
      const res = await axios.get('/api/attendance', { params: { date: today } });
      const logs: AttendanceLogDto[] = res.data;

      const studentId = data.id;
      const studentName = data.name;

      const existingLog = logs.find((l) => {
        const sId = typeof l.student === 'string' ? l.student : l.student?._id;
        return sId === studentId;
      });

      let type: 'check_in' | 'check_out' = 'check_in';

      // Logic: If no log OR (has timeIn but NO timeOut), then check_out?
      // Wait, if no log -> Check In.
      // If log with timeIn and NO timeOut -> Check Out.
      // If log with timeIn AND timeOut -> Already done.

      if (existingLog) {
        if (existingLog.timeIn && !existingLog.timeOut) {
          type = 'check_out';
        } else if (existingLog.timeIn && existingLog.timeOut) {
          Swal.fire('Already Recorded', `${studentName} has already checked in and out today.`, 'info');
          return;
        }
      }

      await recordAttendance(studentId, today, type, existingLog?._id);
      Swal.fire(
        'Success',
        `${type === 'check_in' ? 'Check-In' : 'Check-Out'} recorded for ${studentName}`,
        'success'
      );

    } catch (error: any) {
      console.error('Scan Error', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Invalid QR Code or Scan Failed';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const formatTime = (time?: string | null) => {
    if (!time) return null;
    const date = new Date(time);
    if (isNaN(date.getTime())) return null; // Invalid date
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredAttendance = attendance;
  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;

  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(filteredAttendance, 10);
  const currentLogs = currentData();

  if (user?.role === 'student') {
    const qrData = JSON.stringify({
      id: user.id || (user as any)._id,
      name: user.name,
      room: user.studentProfile?.roomNumber || 'N/A'
    });

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold text-[#001F3F] mb-6">My Digital ID</h2>
        <div className="bg-white p-4 rounded-xl border-4 border-[#001F3F]">
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={qrData}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">Room: {user.studentProfile?.roomNumber || 'N/A'}</p>

        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg w-full text-center">
          <p className="text-sm text-[#001F3F]">
            Show this QR code to the admin to Check In or Check Out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[#001F3F]">Attendance & Curfew Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track student check-in and check-out logs</p>
        </div>
        <Button
          onClick={() => setIsScannerOpen(true)}
          className="bg-[#001F3F] text-white hover:bg-[#003366] flex items-center gap-2"
        >
          <Scan className="w-5 h-5" />
          Scan QR
        </Button>
      </div>

      {/* Scanner Modal */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Student QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm aspect-square overflow-hidden rounded-lg bg-black relative">
              <Scanner
                onScan={(result) => result?.[0]?.rawValue && handleScan(result[0].rawValue)}
                onError={(error) => console.error(error)}
                components={{ torch: false }}
              />
              <div className="absolute inset-0 border-2 border-[#FFD700] opacity-50 pointer-events-none"></div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Align the QR code within the frame to scan.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <label className="text-sm text-gray-700">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
        />
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
              {currentLogs.map((log) => {
                const student = typeof log.student === 'string' ? null : log.student;
                const name = student?.name || 'Unknown';
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('');
                const room = student?.studentProfile?.roomNumber || 'N/A';

                return (
                  <tr key={log._id} className="hover:bg-gray-50">
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
                      {formatTime(log.timeIn) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatTime(log.timeIn)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTime(log.timeOut) ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {formatTime(log.timeOut)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline - flex items - center gap - 1 px - 3 py - 1 rounded text - xs ${log.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : log.status === 'late'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                          } `}
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

          {/* Pagination Controls */}
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
      </div>
    </div>
  );
}

