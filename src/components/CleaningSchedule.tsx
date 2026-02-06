import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Calendar, Plus, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

interface RoomDto {
  _id: string;
  roomNumber: string;
}

interface CleaningScheduleDto {
  _id: string;
  area: string;
  assignedTo: string; // Storing roomNumber or ID
  scheduledDate: string;
  status: 'pending' | 'completed';
  notes?: string | null;
}

export function CleaningSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<CleaningScheduleDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    area: '',
    assignedTo: '',
    scheduledDate: '',
    status: 'pending' as 'pending' | 'completed',
    notes: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchRooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/cleaning-schedule');
      setSchedules(res.data);
    } catch (error) {
      console.error('Error fetching cleaning schedules', error);
      Swal.fire('Error', 'Failed to load cleaning tasks.', 'error');
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Error fetching rooms', error);
    }
  };

  const pendingTasks = schedules.filter(s => s.status === 'pending');
  const completedTasks = schedules.filter(s => s.status === 'completed');
  const todayTasks = schedules.filter(
    s => new Date(s.scheduledDate).toDateString() === new Date().toDateString()
  );

  const openModal = (task: CleaningScheduleDto | null = null) => {
    if (task) {
      setEditingId(task._id);
      setFormData({
        area: task.area,
        assignedTo: task.assignedTo,
        scheduledDate: task.scheduledDate,
        status: task.status,
        notes: task.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        area: '',
        assignedTo: '',
        scheduledDate: '',
        status: 'pending',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.area || !formData.assignedTo || !formData.scheduledDate) {
      Swal.fire('Missing fields', 'Area, Room, and Scheduled Date are required.', 'warning');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/cleaning-schedule/${editingId}`, formData);
        Swal.fire('Updated', 'Cleaning task updated successfully.', 'success');
      } else {
        await axios.post('/api/cleaning-schedule', formData);
        Swal.fire('Created', 'Cleaning task created successfully.', 'success');
      }
      setIsModalOpen(false);
      await fetchSchedules();
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save cleaning task.', 'error');
    }
  };

  const handleMarkComplete = async (task: CleaningScheduleDto) => {
    try {
      await axios.put(`/api/cleaning-schedule/${task._id}`, {
        ...task,
        status: 'completed',
      });
      await fetchSchedules();
      Swal.fire('Completed', 'Task marked as completed.', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to update task.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`/api/cleaning-schedule/${id}`);
        await fetchSchedules();
        Swal.fire('Deleted', 'Cleaning task removed.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to delete task.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#001F3F]">Cleaning Schedule Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track dormitory cleaning tasks</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-[#001F3F] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${viewMode === 'list'
              ? 'bg-[#001F3F] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${viewMode === 'calendar'
              ? 'bg-[#001F3F] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#001F3F]">
          <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
          <p className="text-2xl text-[#001F3F]">{schedules.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#FFD700]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Today's Tasks</p>
            <Clock className="w-5 h-5 text-[#FFD700]" />
          </div>
          <p className="text-2xl text-[#001F3F]">{todayTasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl text-orange-700">{pendingTasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl text-green-700">{completedTasks.length}</p>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#001F3F] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Area</th>
                  <th className="px-6 py-3 text-left text-sm">Assigned Room</th>
                  <th className="px-6 py-3 text-left text-sm">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Notes</th>
                  {user?.role === 'admin' && <th className="px-6 py-3 text-left text-sm">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{schedule.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{schedule.assignedTo || 'Unknown Room'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${schedule.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                          }`}
                      >
                        {schedule.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {schedule.notes || '-'}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openModal(schedule)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        {schedule.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkComplete(schedule)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(schedule._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grouped by Date */}
          {Array.from(new Set(schedules.map(s => s.scheduledDate))).map(date => {
            const tasksForDate = schedules.filter(s => s.scheduledDate === date);
            return (
              <div key={date} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-[#001F3F]" />
                  <h3 className="text-[#001F3F]">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {tasksForDate.length} {tasksForDate.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksForDate.map(schedule => (
                    <div
                      key={schedule._id}
                      className={`border-l-4 pl-4 py-3 rounded-r ${schedule.status === 'completed'
                        ? 'border-green-500 bg-green-50'
                        : 'border-orange-500 bg-orange-50'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-[#001F3F]">{schedule.area}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded ${schedule.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                            }`}
                        >
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Assigned to: {schedule.assignedTo || 'Unknown Room'}
                      </p>
                      {schedule.notes && (
                        <p className="text-sm text-gray-700">{schedule.notes}</p>
                      )}
                      {schedule.status === 'pending' && user?.role === 'admin' && (
                        <button
                          className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          onClick={() => handleMarkComplete(schedule)}
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for create / edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white z-[100] border-2 border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Cleaning Task' : 'New Cleaning Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Area</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
            <div>
              <Label>Assigned Room</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room.roomNumber}>
                    {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' })
                }
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#001F3F] text-white hover:bg-[#003366]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
