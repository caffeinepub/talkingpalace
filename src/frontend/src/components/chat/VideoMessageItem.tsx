import { useState } from 'react';
import type { ExternalBlob } from '../../backend';
import StarRating from '../ratings/StarRating';
import { useVideoRating } from '../../hooks/useVideoRatings';
import { Play, Loader2 } from 'lucide-react';

interface VideoMessageItemProps {
  video: ExternalBlob;
  messageId: bigint;
}

export default function VideoMessageItem({ video, messageId }: VideoMessageItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { averageRating, ratingCount, userRating, submitRating, isSubmitting } = useVideoRating(messageId);

  const videoUrl = video.getDirectURL();

  return (
    <div className="space-y-2 mt-2">
      <div className="relative rounded-lg overflow-hidden bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <video
          src={videoUrl}
          controls
          className="w-full max-h-64"
          onLoadedData={() => setIsLoading(false)}
        />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-muted-foreground">
          {averageRating > 0 && (
            <span>
              {averageRating.toFixed(1)} ★ ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
        <StarRating
          value={userRating}
          onChange={submitRating}
          disabled={isSubmitting}
          size="sm"
        />
      </div>
    </div>
  );
}
