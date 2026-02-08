import type { Message } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Reply } from 'lucide-react';
import VideoMessageItem from './VideoMessageItem';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReply: () => void;
  messages: Message[];
}

export default function MessageItem({ message, isOwn, onReply, messages }: MessageItemProps) {
  const replyToMessage = messages.find((m) => m.id === message.replyTo);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] space-y-1`}>
        {replyToMessage && (
          <div className="text-xs text-muted-foreground bg-accent/30 p-2 rounded-lg mb-1">
            <p className="font-medium">Replying to:</p>
            <p className="truncate">{replyToMessage.content}</p>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn ? 'bg-primary text-primary-foreground' : 'bg-accent'
          }`}
        >
          {message.content && <p className="break-words">{message.content}</p>}
          {message.video && <VideoMessageItem video={message.video} messageId={message.id} />}
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {new Date(Number(message.timestamp) / 1000000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isOwn && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReply}>
              <Reply className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
