import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { Room } from '../types';

const RoomsManagement: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/api/rooms');
            setRooms(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setIsLoading(false);
            Swal.fire('Error', 'Failed to fetch rooms', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/rooms/${id}`);
                setRooms(rooms.filter(room => room._id !== id));
                Swal.fire('Deleted!', 'Room has been deleted.', 'success');
            } catch (error) {
                console.error('Error deleting room:', error);
                Swal.fire('Error', 'Failed to delete room', 'error');
            }
        }
    };

    const checkRoomExists = (roomNumber: string) => {
        return rooms.some(room => room.roomNumber === roomNumber && room._id !== currentRoom._id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (checkRoomExists(currentRoom.roomNumber || '')) {
            Swal.fire('Error', 'Room number already exists', 'error');
            return;
        }

        try {
            if (isEditing && currentRoom._id) {
                const response = await axios.put(`/api/rooms/${currentRoom._id}`, currentRoom);
                setRooms(rooms.map(room => (room._id === currentRoom._id ? response.data : room)));
                Swal.fire('Success', 'Room updated successfully', 'success');
            } else {
                const response = await axios.post('/api/rooms', currentRoom);
                setRooms([...rooms, response.data]);
                Swal.fire('Success', 'Room created successfully', 'success');
            }
            closeModal();
        } catch (error: any) {
            console.error('Error saving room:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to save room', 'error');
        }
    };

    const openModal = (room?: Room) => {
        if (room) {
            setCurrentRoom({ ...room });
            setIsEditing(true);
        } else {
            setCurrentRoom({
                status: 'Available',
                features: []
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRoom({});
        setIsEditing(false);
    };

    const handleFeatureChange = (feature: string) => {
        const currentFeatures = currentRoom.features || [];
        if (currentFeatures.includes(feature)) {
            setCurrentRoom({
                ...currentRoom,
                features: currentFeatures.filter(f => f !== feature)
            });
        } else {
            setCurrentRoom({
                ...currentRoom,
                features: [...currentFeatures, feature]
            });
        }
    };

    const currencyFormatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    const filteredRooms = rooms.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Rooms Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Room
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">Room Number</th>
                                <th className="px-6 py-4">Capacity</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Features</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500">Loading...</td>
                                </tr>
                            ) : filteredRooms.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500">No rooms found</td>
                                </tr>
                            ) : (
                                filteredRooms.map((room) => (
                                    <tr key={room._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{room.roomNumber}</td>
                                        <td className="px-6 py-4">{room.capacity}</td>
                                        <td className="px-6 py-4">{currencyFormatter.format(room.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                                                room.status === 'Occupied' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {room.features?.join(', ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(room)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {isEditing ? 'Edit Room' : 'Add New Room'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                                    <input
                                        type="text"
                                        value={currentRoom.roomNumber || ''}
                                        onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentRoom.capacity || ''}
                                        onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) })}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={currentRoom.price || ''}
                                    onChange={(e) => setCurrentRoom({ ...currentRoom, price: parseFloat(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={currentRoom.status || 'Available'}
                                    onChange={(e) => setCurrentRoom({ ...currentRoom, status: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Features</label>
                                <div className="space-y-2">
                                    {['Air Conditioning', 'Private Bathroom', 'Balcony', 'Study Desk', 'Wi-Fi'].map((feature) => (
                                        <label key={feature} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentRoom.features?.includes(feature) || false}
                                                onChange={() => handleFeatureChange(feature)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-slate-600">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsManagement;
