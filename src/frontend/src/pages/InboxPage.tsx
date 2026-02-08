import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFriendsList } from '../hooks/useQueries';
import { useInboxFriendProfiles } from '../hooks/useInboxFriendProfiles';
import { Card } from '@/components/ui/card';
import Avatar from '../components/common/Avatar';
import { MessageSquare } from 'lucide-react';

export default function InboxPage() {
  const navigate = useNavigate();
  const { data: friends = [], isLoading: friendsLoading } = useGetFriendsList();
  const profileMap = useInboxFriendProfiles(friends);

  if (friendsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <img
          src="/assets/generated/empty-state.dim_1200x800.png"
          alt="No chats"
          className="w-64 h-auto opacity-50"
        />
        <h2 className="text-2xl font-semibold">No conversations yet</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Add friends to start chatting and sharing videos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Messages</h1>
      <div className="space-y-2">
        {friends.map((friend) => {
          const principalText = friend.principal.toString();
          const profileData = profileMap.get(principalText);
          const profile = profileData?.profile;
          const isLoading = profileData?.isLoading ?? true;

          // Determine display name
          let displayName = 'Loading...';
          let subtitle = 'Tap to chat';
          
          if (!isLoading) {
            if (profile) {
              displayName = profile.displayName;
              subtitle = `@${profile.username}`;
            } else {
              displayName = 'Unknown user';
              subtitle = 'Profile not found';
            }
          }

          return (
            <Card
              key={principalText}
              className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate({ to: '/chat/$userId', params: { userId: principalText } })}
            >
              <div className="flex items-center gap-3">
                <Avatar user={profile} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                </div>
                <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
