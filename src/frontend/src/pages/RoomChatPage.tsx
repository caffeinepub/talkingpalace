import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRoom } from '../hooks/useRooms';
import { useGetRoomMessages, useSendRoomMessage } from '../hooks/useRoomMessagesPolling';
import { useParticipantIdentity } from '../hooks/useParticipantIdentity';
import { useActor } from '../hooks/useActor';
import RoomMessageItem from '../components/rooms/RoomMessageItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile, GuestProfile } from '../backend';

export default function RoomChatPage() {
  const { roomId } = useParams({ from: '/rooms/$roomId' });
  const navigate = useNavigate();
  const { actor } = useActor();
  const participantIdentity = useParticipantIdentity();
  const { data: room, isLoading: roomLoading } = useGetRoom(roomId);
  const { data: messages = [], isLoading: messagesLoading } = useGetRoomMessages(roomId);
  const { mutate: sendMessage, isPending: isSending } = useSendRoomMessage();

  const [messageContent, setMessageContent] = useState('');
  const [participantProfiles, setParticipantProfiles] = useState<Map<string, UserProfile | GuestProfile>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch profiles for all participants
  useEffect(() => {
    if (!room || !actor) return;

    const fetchProfiles = async () => {
      const profiles = new Map<string, UserProfile | GuestProfile>();
      
      for (const participantId of room.participants) {
        try {
          // Check if it's a guest ID
          if (participantId.startsWith('guest_')) {
            const guestProfile = await actor.getGuestProfile(participantId);
            if (guestProfile) {
              profiles.set(participantId, guestProfile);
            }
          } else {
            // It's a Principal
            try {
              const userProfile = await actor.getProfile({ toText: () => participantId } as any);
              if (userProfile) {
                profiles.set(participantId, userProfile);
              }
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile for participant:', participantId, error);
        }
      }
      
      setParticipantProfiles(profiles);
    };

    fetchProfiles();
  }, [room, actor]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !roomId || !participantIdentity) return;

    sendMessage(
      {
        roomId,
        content: messageContent.trim(),
        replyTo: null,
        video: null,
      },
      {
        onSuccess: () => {
          setMessageContent('');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (roomLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-muted-foreground">Room not found or you don't have access</p>
        <Button onClick={() => navigate({ to: '/rooms' })}>
          Back to Rooms
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/rooms' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Room {room.id}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = participantIdentity?.id === message.sender;
            const senderProfile = participantProfiles.get(message.sender);

            return (
              <RoomMessageItem
                key={message.id.toString()}
                message={message}
                isOwnMessage={isOwnMessage}
                senderProfile={senderProfile || null}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="pt-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageContent.trim()}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
