import React, { Fragment, useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react'; // Assuming headlessui is used as per other components
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface Notification {
    _id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, token } = useAuth(); // Assuming AuthContext provides token

    const fetchNotifications = async () => {
        try {
            // Manual token header if not set globally, but usually it is. 
            // Assuming global axios interceptor or similar, relying on AuthContext setup.
            // If not, we might need configuration.
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Fallback
                }
            };
            const { data } = await axios.get('/api/notifications', config);
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllRead = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };
            await axios.put('/api/notifications/read-all', {}, config);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read', error);
        }
    };

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button
                        className={`
                group inline-flex items-center rounded-md p-2 text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 relative
                ${open ? 'text-gray-900' : 'text-gray-500'}
            `}
                    >
                        <Bell className="h-6 w-6" aria-hidden="true" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-50 mt-3 w-80 max-w-sm transform px-4 sm:px-0 lg:max-w-3xl">
                            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="bg-white p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-xs text-[#001F3F] hover:underline">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {notifications.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    className={`p-3 rounded-md text-sm ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                                >
                                                    <p className={`font-medium ${notification.type === 'error' ? 'text-red-700' : 'text-gray-900'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
