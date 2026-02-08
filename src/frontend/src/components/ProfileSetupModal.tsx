import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !username.trim() || !displayName.trim()) return;

    saveProfile(
      {
        principal: identity.getPrincipal(),
        username: username.trim(),
        displayName: displayName.trim(),
        themeColor: '#ea580c',
        darkMode: false,
        profilePicture: undefined,
      },
      {
        onError: (error) => {
          toast.error('Failed to create profile: ' + error.message);
        },
      }
    );
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>
            Choose a username and display name to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !username.trim() || !displayName.trim()}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
