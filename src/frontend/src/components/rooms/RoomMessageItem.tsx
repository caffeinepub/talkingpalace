import { RoomMessage, UserProfile, GuestProfile } from '../../backend';
import { formatDistanceToNow } from 'date-fns';

interface RoomMessageItemProps {
  message: RoomMessage;
  isOwnMessage: boolean;
  senderProfile?: UserProfile | GuestProfile | null;
}

export default function RoomMessageItem({ message, isOwnMessage, senderProfile }: RoomMessageItemProps) {
  const timestamp = new Date(Number(message.timestamp) / 1000000);
  
  // Determine sender display name
  let senderName = 'Unknown';
  if (senderProfile) {
    senderName = senderProfile.displayName;
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 px-2">{senderName}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          {message.video && (
            <video
              src={message.video.getDirectURL()}
              controls
              className="rounded-lg mb-2 max-w-full"
              style={{ maxHeight: '300px' }}
            />
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
