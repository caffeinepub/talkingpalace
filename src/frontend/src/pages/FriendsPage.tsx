import { useState } from 'react';
import { useGetFriendsList, useAddFriend, useRemoveFriend, useToggleBestFriend, useGetUserProfile, useSearchUsers } from '../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, UserPlus, Trash2, Search, Loader2 } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { SearchResult, UserProfile } from '../backend';

export default function FriendsPage() {
  const { data: friends = [] } = useGetFriendsList();
  const { mutate: addFriend, isPending: isAddingFriend } = useAddFriend();
  const { mutate: removeFriend } = useRemoveFriend();
  const { mutate: toggleBestFriend } = useToggleBestFriend();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(searchTerm);

  const handleAddFriend = (result: SearchResult) => {
    addFriend(result.principal, {
      onSuccess: () => {
        toast.success('Friend added');
        setSearchTerm('');
        setShowAddFriend(false);
      },
      onError: (error) => {
        toast.error('Failed to add friend: ' + error.message);
      },
    });
  };

  const handleRemoveFriend = (friendPrincipal: any) => {
    removeFriend(friendPrincipal, {
      onSuccess: () => toast.success('Friend removed'),
      onError: (error) => toast.error('Failed to remove friend: ' + error.message),
    });
  };

  const handleToggleBestFriend = (friendPrincipal: any) => {
    toggleBestFriend(friendPrincipal, {
      onSuccess: () => toast.success('Best friend status updated'),
      onError: (error) => toast.error('Failed to update: ' + error.message),
    });
  };

  const searchResultToUserProfile = (result: SearchResult): UserProfile => ({
    principal: result.principal,
    username: result.username,
    displayName: result.displayName,
    profilePicture: result.profilePicture,
    themeColor: '#ff6b35',
    darkMode: false,
  });

  if (friends.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Friends</h1>
          <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username or display name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {searchResults.map((result) => (
                      <Card key={result.principal.toString()} className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            user={searchResultToUserProfile(result)} 
                            size="sm" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.displayName}</p>
                            <p className="text-sm text-muted-foreground truncate">@{result.username}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddFriend(result)}
                            disabled={isAddingFriend}
                          >
                            {isAddingFriend ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <img
            src="/assets/generated/empty-state.dim_1200x800.png"
            alt="No friends"
            className="w-64 h-auto opacity-50"
          />
          <h2 className="text-2xl font-semibold">No friends yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Add friends to start chatting and sharing videos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Friends</h1>
        <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Friend</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or display name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <Card key={result.principal.toString()} className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          user={searchResultToUserProfile(result)} 
                          size="sm" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.displayName}</p>
                          <p className="text-sm text-muted-foreground truncate">@{result.username}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddFriend(result)}
                          disabled={isAddingFriend}
                        >
                          {isAddingFriend ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {friends.map((friend) => (
          <FriendListItem
            key={friend.principal.toString()}
            friend={friend}
            onRemove={() => handleRemoveFriend(friend.principal)}
            onToggleBestFriend={() => handleToggleBestFriend(friend.principal)}
          />
        ))}
      </div>
    </div>
  );
}

function FriendListItem({
  friend,
  onRemove,
  onToggleBestFriend,
}: {
  friend: any;
  onRemove: () => void;
  onToggleBestFriend: () => void;
}) {
  const { data: profile } = useGetUserProfile(friend.principal.toString());

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar user={profile} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{profile?.displayName || 'User'}</p>
            {friend.isBestFriend && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
          </div>
          <p className="text-sm text-muted-foreground">@{profile?.username || 'username'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={friend.isBestFriend ? 'default' : 'outline'}
            size="icon"
            onClick={onToggleBestFriend}
          >
            <Star className={`h-4 w-4 ${friend.isBestFriend ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
