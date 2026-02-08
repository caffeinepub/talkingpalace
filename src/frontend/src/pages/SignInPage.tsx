import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestSession } from '../hooks/useGuestSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, loginStatus, loginError } = useInternetIdentity();
  const { createGuestSession } = useGuestSession();
  const [guestUsername, setGuestUsername] = useState('');
  const [guestDisplayName, setGuestDisplayName] = useState('');
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';

  const handleGuestSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestUsername.trim() || !guestDisplayName.trim()) {
      toast.error('Please enter both username and display name');
      return;
    }

    setIsGuestLoading(true);
    try {
      createGuestSession(guestUsername.trim(), guestDisplayName.trim());
      toast.success('Signed in as guest');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to sign in as guest');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/assets/generated/app-logo.dim_512x512.png"
            alt="App Logo"
            className="w-32 h-32 mx-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground text-lg">
            Connect, share, and communicate with friends
          </p>
        </div>

        <div className="space-y-6">
          {/* Internet Identity Sign In */}
          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn || isGuestLoading}
              size="lg"
              className="w-full text-lg h-14"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>

            {loginError && (
              <p className="text-destructive text-sm text-center">{loginError.message}</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Guest Sign In */}
          <form onSubmit={handleGuestSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestUsername">Username</Label>
              <Input
                id="guestUsername"
                placeholder="Enter username"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value)}
                disabled={isLoggingIn || isGuestLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestDisplayName">Display Name</Label>
              <Input
                id="guestDisplayName"
                placeholder="Enter display name"
                value={guestDisplayName}
                onChange={(e) => setGuestDisplayName(e.target.value)}
                disabled={isLoggingIn || isGuestLoading}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full text-lg h-14"
              disabled={isLoggingIn || isGuestLoading || !guestUsername.trim() || !guestDisplayName.trim()}
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Continue as Guest'
              )}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Secure authentication powered by Internet Identity
        </p>
      </div>
    </div>
  );
}
