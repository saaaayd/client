import { 
  StudentProfile, 
  Payment, 
  MaintenanceRequest, 
  Announcement, 
  AttendanceLog, 
  CleaningSchedule,
  DashboardStats 
} from '../types';

export const mockStudents: StudentProfile[] = [
  {
    id: 1,
    userId: 2,
    roomNumber: '101',
    phoneNumber: '+1-555-0123',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1-555-0124',
    enrollmentDate: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    userId: 3,
    roomNumber: '102',
    phoneNumber: '+1-555-0125',
    emergencyContactName: 'Michael Smith',
    emergencyContactPhone: '+1-555-0126',
    enrollmentDate: '2024-02-01',
    status: 'active',
  },
  {
    id: 3,
    userId: 4,
    roomNumber: '103',
    phoneNumber: '+1-555-0127',
    emergencyContactName: 'Sarah Johnson',
    emergencyContactPhone: '+1-555-0128',
    enrollmentDate: '2024-01-20',
    status: 'active',
  },
];

export const mockPayments: Payment[] = [
  {
    id: 1,
    studentId: 1,
    studentName: 'John Doe',
    amount: 500,
    type: 'rent',
    status: 'paid',
    dueDate: '2024-11-01',
    paidDate: '2024-10-28',
    notes: 'November rent payment',
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'John Doe',
    amount: 500,
    type: 'rent',
    status: 'pending',
    dueDate: '2024-12-01',
    notes: 'December rent payment',
  },
  {
    id: 3,
    studentId: 2,
    studentName: 'Emily Smith',
    amount: 500,
    type: 'rent',
    status: 'overdue',
    dueDate: '2024-11-01',
    notes: 'November rent payment - overdue',
  },
  {
    id: 4,
    studentId: 1,
    studentName: 'John Doe',
    amount: 100,
    type: 'utilities',
    status: 'paid',
    dueDate: '2024-11-15',
    paidDate: '2024-11-10',
    notes: 'Electricity and water',
  },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    studentId: 1,
    studentName: 'John Doe',
    roomNumber: '101',
    title: 'Broken AC Unit',
    description: 'The air conditioning unit in my room is not working properly. It makes strange noises and does not cool effectively.',
    urgency: 'high',
    status: 'in-progress',
    createdAt: '2024-11-20T10:30:00',
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Emily Smith',
    roomNumber: '102',
    title: 'Leaking Faucet',
    description: 'The bathroom faucet has been leaking continuously for the past two days.',
    urgency: 'medium',
    status: 'pending',
    createdAt: '2024-11-22T14:15:00',
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Mike Johnson',
    roomNumber: '103',
    title: 'Light Bulb Replacement',
    description: 'Need replacement for ceiling light bulb in the bedroom.',
    urgency: 'low',
    status: 'resolved',
    createdAt: '2024-11-18T09:00:00',
    resolvedAt: '2024-11-19T16:30:00',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Scheduled Maintenance - December 1st',
    content: 'The dormitory will undergo routine maintenance on December 1st from 9 AM to 5 PM. Water supply may be temporarily interrupted. Please plan accordingly.',
    createdBy: 'Admin User',
    createdAt: '2024-11-20T08:00:00',
    priority: 'important',
  },
  {
    id: 2,
    title: 'Holiday Break Announcement',
    content: 'The dormitory will be closed from December 20th to January 5th for the winter break. All students must vacate by December 19th.',
    createdBy: 'Admin User',
    createdAt: '2024-11-15T10:00:00',
    priority: 'urgent',
  },
  {
    id: 3,
    title: 'New Gym Equipment',
    content: 'We are pleased to announce that new gym equipment has been installed in the common area. Enjoy your workouts!',
    createdBy: 'Admin User',
    createdAt: '2024-11-10T12:00:00',
    priority: 'normal',
  },
];

export const mockAttendance: AttendanceLog[] = [
  {
    id: 1,
    studentId: 1,
    studentName: 'John Doe',
    roomNumber: '101',
    checkIn: '2024-11-23T18:30:00',
    date: '2024-11-23',
    status: 'present',
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Emily Smith',
    roomNumber: '102',
    checkIn: '2024-11-23T22:15:00',
    date: '2024-11-23',
    status: 'late',
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Mike Johnson',
    roomNumber: '103',
    date: '2024-11-23',
    status: 'absent',
  },
];

export const mockCleaningSchedule: CleaningSchedule[] = [
  {
    id: 1,
    area: 'Common Room - Floor 1',
    assignedTo: 'Cleaning Staff A',
    scheduledDate: '2024-11-24',
    status: 'pending',
    notes: 'Deep cleaning required',
  },
  {
    id: 2,
    area: 'Bathrooms - Floor 2',
    assignedTo: 'Cleaning Staff B',
    scheduledDate: '2024-11-24',
    status: 'completed',
    notes: 'Regular maintenance',
  },
  {
    id: 3,
    area: 'Gym & Recreation Area',
    assignedTo: 'Cleaning Staff A',
    scheduledDate: '2024-11-25',
    status: 'pending',
  },
  {
    id: 4,
    area: 'Hallways - All Floors',
    assignedTo: 'Cleaning Staff C',
    scheduledDate: '2024-11-25',
    status: 'pending',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalStudents: 3,
  pendingMaintenance: 1,
  pendingCleaning: 3,
  overduePayments: 1,
};
