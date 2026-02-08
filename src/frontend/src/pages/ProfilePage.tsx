import { useState } from 'react';
import { useGetCallerUserProfile, useUpdateProfile, useUpdateProfilePicture } from '../hooks/useCurrentUserProfile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Avatar from '../components/common/Avatar';
import ProfilePicturePicker from '../components/profile/ProfilePicturePicker';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPicturePicker, setShowPicturePicker] = useState(false);

  const handleEdit = () => {
    if (userProfile) {
      setUsername(userProfile.username);
      setDisplayName(userProfile.displayName);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!userProfile) return;

    updateProfile(
      {
        username: username.trim(),
        displayName: displayName.trim(),
        themeColor: userProfile.themeColor,
        darkMode: userProfile.darkMode,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated');
          setIsEditing(false);
        },
        onError: (error) => {
          toast.error('Failed to update profile: ' + error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar user={userProfile} size="lg" />
            <Button variant="outline" onClick={() => setShowPicturePicker(true)}>
              Change Picture
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              {isEditing ? (
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              ) : (
                <p className="text-lg">@{userProfile?.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              {isEditing ? (
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              ) : (
                <p className="text-lg">{userProfile?.displayName}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>

      {showPicturePicker && (
        <ProfilePicturePicker onClose={() => setShowPicturePicker(false)} />
      )}
    </div>
  );
}
