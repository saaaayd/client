import React, { useState } from 'react';
import axios from 'axios';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'login' | 'logout';
  onSkip?: () => void;
}

export function FeedbackModal({ isOpen, onClose, context, onSkip }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire('Rating Required', 'Please select a star rating.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/feedback', {
        rating,
        comment,
        context,
      });
      Swal.fire('Thank You!', 'Your feedback helps us improve the system and dormitory.', 'success');
      onClose();
      if (onSkip) onSkip(); // Proceed with action if any
    } catch (error) {
      console.error('Error submitting feedback', error);
      Swal.fire('Error', 'Failed to submit feedback.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    if (onSkip) onSkip();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleSkip(); }}>
      <DialogContent 
        className="sm:max-w-md bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold text-[#001F3F]">
              How was your experience?
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <p className="text-center text-gray-600 mb-6">
            Please rate your experience with the DormSync system and dormitory.
          </p>

          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-[#FFD700] text-[#FFD700]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any comments? (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="Tell us what you liked or how we can improve..."
            />
          </div>

          <div className="flex w-full gap-3 mt-6">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#001F3F] text-white hover:bg-[#003366]"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
