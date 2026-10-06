import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, reviewCount = null, size = 'sm' }) => {
  const numericRating = Number(rating) || 0;
  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(numericRating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-amazon-blue hover:text-amazon-orange transition-colors">
        {numericRating.toFixed(1)}
      </span>
      {reviewCount !== null && (
        <span className="text-xs text-gray-500">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};
