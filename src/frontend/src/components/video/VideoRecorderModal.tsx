import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Square, Check, X } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';
import VideoTrimmer from './VideoTrimmer';

interface VideoRecorderModalProps {
  onClose: () => void;
  onVideoRecorded: (blob: ExternalBlob) => void;
}

export default function VideoRecorderModal({ onClose, onVideoRecorded }: VideoRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to access camera');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (finalBlob: Blob) => {
    try {
      const arrayBuffer = await finalBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const externalBlob = ExternalBlob.fromBytes(uint8Array);
      onVideoRecorded(externalBlob);
    } catch (error) {
      toast.error('Failed to process video');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!recordedBlob ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-center gap-2">
                {!isRecording && !stream && (
                  <Button onClick={startRecording} size="lg">
                    <Video className="mr-2 h-5 w-5" />
                    Start Recording
                  </Button>
                )}
                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive" size="lg">
                    <Square className="mr-2 h-5 w-5" />
                    Stop Recording
                  </Button>
                )}
                <Button onClick={handleCancel} variant="outline" size="lg">
                  <X className="mr-2 h-5 w-5" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <VideoTrimmer blob={recordedBlob} onSend={handleSend} onCancel={() => setRecordedBlob(null)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
