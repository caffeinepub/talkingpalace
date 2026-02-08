import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  disabled = false,
  size = 'md',
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (rating: number) => {
    if (!readOnly && !disabled && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readOnly && !disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex gap-0.5" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = displayValue >= star;
        const isHalf = displayValue >= star - 0.5 && displayValue < star;

        return (
          <div
            key={star}
            className={`relative ${!readOnly && !disabled ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => handleMouseEnter(star - 0.5)}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFull || isHalf ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
              style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              onClick={() => handleClick(star - 0.5)}
            />
            {isHalf && (
              <Star
                className={`${sizeClasses[size]} absolute top-0 left-0 text-gray-300`}
                style={{ clipPath: 'inset(0 0 0 50%)' }}
                onClick={() => handleClick(star)}
              />
            )}
            {!isHalf && (
              <div
                className="absolute top-0 right-0 w-1/2 h-full"
                onMouseEnter={() => handleMouseEnter(star)}
                onClick={() => handleClick(star)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
