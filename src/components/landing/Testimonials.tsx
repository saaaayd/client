import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquareQuote } from 'lucide-react';

interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string;
    name: string;
  };
  createdAt: string;
}

export function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('/api/feedback/public');
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching public feedbacks', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (isLoading) {
    return null;
  }

  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#001F3F] mb-4">
            What Our Residents Say
          </h2>
          <p className="text-xl text-gray-600">
            Real feedback from students experiencing the DormSync community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquareQuote className="w-24 h-24 text-[#001F3F]" />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < feedback.rating
                        ? 'fill-[#FFD700] text-[#FFD700]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 italic mb-6 relative z-10 min-h-[80px]">
                "{feedback.comment}"
              </blockquote>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-[#001F3F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {feedback.user.firstName ? feedback.user.firstName[0] : (feedback.user.name ? feedback.user.name[0] : 'U')}
                </div>
                <div>
                  <p className="font-semibold text-[#001F3F]">
                    {feedback.user.firstName || feedback.user.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
