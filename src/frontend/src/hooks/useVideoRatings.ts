import { useState, useEffect } from 'react';

// Mock implementation since backend doesn't have rating endpoints yet
export function useVideoRating(messageId: bigint) {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const key = `rating_${messageId.toString()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      setAverageRating(data.average || 0);
      setRatingCount(data.count || 0);
      setUserRating(data.userRating || 0);
    }
  }, [messageId]);

  const submitRating = async (rating: number) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const key = `rating_${messageId.toString()}`;
      const stored = localStorage.getItem(key);
      let data = stored ? JSON.parse(stored) : { average: 0, count: 0, userRating: 0 };

      // Update rating
      if (data.userRating === 0) {
        // New rating
        const newCount = data.count + 1;
        const newAverage = (data.average * data.count + rating) / newCount;
        data = { average: newAverage, count: newCount, userRating: rating };
      } else {
        // Update existing rating
        const newAverage = (data.average * data.count - data.userRating + rating) / data.count;
        data = { ...data, average: newAverage, userRating: rating };
      }

      localStorage.setItem(key, JSON.stringify(data));
      setAverageRating(data.average);
      setRatingCount(data.count);
      setUserRating(data.userRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    averageRating,
    ratingCount,
    userRating,
    submitRating,
    isSubmitting,
  };
}
