import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { MessageSquare, Star, User } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from './ui/pagination';

export function FeedbackManagement() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterRating, setFilterRating] = useState('All');
    const [filterContext, setFilterContext] = useState('All');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/feedback/all');
            setFeedbacks(res.data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const matchRating = filterRating === 'All' || f.rating.toString() === filterRating;
        const matchContext = filterContext === 'All' || f.context === filterContext;
        return matchRating && matchContext;
    });

    const { currentData, currentPage, maxPage, jump, next, prev } = usePagination(filteredFeedbacks, 12);
    const currentRows = currentData();

    // Stats
    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1) 
        : '0.0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-[#001F3F] text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#FFD700]" /> Student Feedback
                </h2>
                <p className="text-gray-600 text-sm mt-1">Review feedback submitted by students during login and logout</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-[#001F3F]">
                    <p className="text-sm text-gray-500">Total Feedback Entries</p>
                    <p className="text-3xl font-bold text-[#001F3F]">{totalFeedbacks}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-[#FFD700]">
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-[#001F3F]">{avgRating}</p>
                        <Star className="w-6 h-6 text-[#FFD700] fill-[#FFD700]" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
                <select 
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD700] outline-none"
                    value={filterRating} 
                    onChange={e => setFilterRating(e.target.value)}
                >
                    <option value="All">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
                <select 
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD700] outline-none"
                    value={filterContext} 
                    onChange={e => setFilterContext(e.target.value)}
                >
                    <option value="All">All Contexts</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                </select>
            </div>

            {/* Feedback Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-[#001F3F] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : currentRows.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg shadow text-gray-500">
                    No feedback records found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRows.map(f => (
                        <div key={f._id} className="bg-white rounded-lg shadow p-5 flex flex-col h-full border border-gray-100 relative">
                            <div className="absolute top-4 right-4 text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">
                                {f.context}
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-[#001F3F] text-[#FFD700] rounded-full flex items-center justify-center font-bold shrink-0">
                                    {f.user?.name ? f.user.name.charAt(0).toUpperCase() : <User size={16} />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{f.user?.name || 'Unknown User'}</h4>
                                    <p className="text-xs text-gray-500">{moment(f.createdAt).format('MMM DD, YYYY h:mm A')}</p>
                                </div>
                            </div>
                            <div className="flex mb-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={16} 
                                        className={star <= f.rating ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-300"} 
                                    />
                                ))}
                            </div>
                            <div className="flex-1 bg-gray-50 p-3 rounded text-sm text-gray-700 italic border border-gray-100">
                                "{f.comment || 'No comment provided.'}"
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {maxPage > 1 && (
                <div className="mt-6 flex justify-center">
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
    );
}
