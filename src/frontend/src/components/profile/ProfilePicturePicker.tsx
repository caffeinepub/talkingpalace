import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useCamera } from '../../camera/useCamera';
import { useUpdateProfilePicture } from '../../hooks/useCurrentUserProfile';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface ProfilePicturePickerProps {
  onClose: () => void;
}

export default function ProfilePicturePicker({ onClose }: ProfilePicturePickerProps) {
  const [mode, setMode] = useState<'choose' | 'camera'>('choose');
  const { mutate: updatePicture, isPending } = useUpdateProfilePicture();
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: 'user' });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      updatePicture(blob, {
        onSuccess: () => {
          toast.success('Profile picture updated');
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to update picture: ' + error.message);
        },
      });
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) {
      toast.error('Failed to capture photo');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      updatePicture(blob, {
        onSuccess: () => {
          toast.success('Profile picture updated');
          stopCamera();
          onClose();
        },
        onError: (error) => {
          toast.error('Failed to update picture: ' + error.message);
        },
      });
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="space-y-4">
            <Button className="w-full" onClick={() => setMode('camera')}>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <label>
                <Upload className="mr-2 h-4 w-4" />
                Choose from Files
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isPending}
                />
              </label>
            </Button>
          </div>
        )}

        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && <p className="text-destructive text-sm">{error.message}</p>}

            <div className="flex gap-2">
              {!isActive && (
                <Button onClick={startCamera} disabled={isLoading} className="flex-1">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start Camera
                </Button>
              )}
              {isActive && (
                <Button onClick={handleCapture} disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Capture
                </Button>
              )}
              <Button variant="outline" onClick={() => setMode('choose')}>
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
