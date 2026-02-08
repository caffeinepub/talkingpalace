import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMessagesWithUser, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Video, X } from 'lucide-react';
import MessageItem from '../components/chat/MessageItem';
import VideoRecorderModal from '../components/video/VideoRecorderModal';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function ChatDetailPage() {
  const { userId } = useParams({ from: '/chat/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: messages = [] } = useGetMessagesWithUser(userId);
  const { data: otherUserProfile } = useGetUserProfile(userId);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<bigint | null>(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<ExternalBlob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const replyToMessage = messages.find((m) => m.id === replyTo);

  const handleSend = () => {
    if ((!content.trim() && !recordedVideo) || !userId || !identity) return;

    const receiver = Principal.fromText(userId);
    sendMessage(
      {
        receiver,
        content: content.trim(),
        replyTo,
        video: recordedVideo,
      },
      {
        onSuccess: () => {
          setContent('');
          setReplyTo(null);
          setRecordedVideo(null);
        },
        onError: (error) => {
          toast.error('Failed to send message: ' + error.message);
        },
      }
    );
  };

  const handleVideoRecorded = (blob: ExternalBlob) => {
    setRecordedVideo(blob);
    setShowVideoRecorder(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold">{otherUserProfile?.displayName || 'User'}</h2>
          <p className="text-xs text-muted-foreground">@{otherUserProfile?.username || 'username'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id.toString()}
            message={message}
            isOwn={message.sender.toString() === identity?.getPrincipal().toString()}
            onReply={() => setReplyTo(message.id)}
            messages={messages}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="pt-4 border-t space-y-2">
        {replyTo && replyToMessage && (
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
            <div className="flex-1 text-sm">
              <p className="text-xs text-muted-foreground">Replying to</p>
              <p className="truncate">{replyToMessage.content}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReplyTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {recordedVideo && (
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
            <Video className="h-4 w-4" />
            <span className="text-sm flex-1">Video attached</span>
            <Button variant="ghost" size="icon" onClick={() => setRecordedVideo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowVideoRecorder(true)}
            disabled={isPending}
          >
            <Video className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isPending}
          />
          <Button onClick={handleSend} disabled={isPending || (!content.trim() && !recordedVideo)}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showVideoRecorder && (
        <VideoRecorderModal
          onClose={() => setShowVideoRecorder(false)}
          onVideoRecorded={handleVideoRecorded}
        />
      )}
    </div>
  );
}
