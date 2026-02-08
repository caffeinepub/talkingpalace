import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, X } from 'lucide-react';

interface VideoTrimmerProps {
  blob: Blob;
  onSend: (blob: Blob) => void;
  onCancel: () => void;
}

export default function VideoTrimmer({ blob, onSend, onCancel }: VideoTrimmerProps) {
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSend = () => {
    // For simplicity, send the original blob
    // Full trimming would require re-encoding which is complex
    onSend(blob);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full"
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Trim Video (Preview)</label>
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-12">Start</span>
            <Slider
              value={[trimStart]}
              onValueChange={(v) => setTrimStart(v[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {((trimStart / 100) * duration).toFixed(1)}s
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground w-12">End</span>
            <Slider
              value={[trimEnd]}
              onValueChange={(v) => setTrimEnd(v[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {((trimEnd / 100) * duration).toFixed(1)}s
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: Trimming is for preview only. Full video will be sent.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} variant="outline">
          <X className="mr-2 h-4 w-4" />
          Retake
        </Button>
        <Button onClick={handleSend}>
          <Check className="mr-2 h-4 w-4" />
          Send Video
        </Button>
      </div>
    </div>
  );
}
