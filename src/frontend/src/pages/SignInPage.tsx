import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const { login, loginStatus, loginError } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
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

        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full text-lg h-14"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {loginError && (
            <p className="text-destructive text-sm">{loginError.message}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Secure authentication powered by Internet Identity
        </p>
      </div>
    </div>
  );
}
