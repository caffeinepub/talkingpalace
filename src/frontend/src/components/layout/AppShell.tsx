import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGuestSession } from '../../hooks/useGuestSession';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { MessageSquare, Users, User, Settings, LogOut, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Avatar from '../common/Avatar';
import GuestBadge from './GuestBadge';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const { guestSession, clearGuestSession } = useGuestSession();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const currentPath = routerState.location.pathname;
  const isGuest = !!guestSession && !identity;

  const handleLogout = async () => {
    await clear();
    clearGuestSession();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const displayName = isGuest ? guestSession.displayName : (userProfile?.displayName || 'User');
  const username = isGuest ? guestSession.username : (userProfile?.username || 'username');

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chats' },
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/rooms', icon: DoorOpen, label: 'Rooms' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/app-logo.dim_512x512.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold">MessageCenter</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar user={isGuest ? null : userProfile} size="sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{displayName}</p>
                  {isGuest && <GuestBadge />}
                </div>
                <p className="text-xs text-muted-foreground">@{username}</p>
              </div>
              <DropdownMenuSeparator />
              {!isGuest && (
                <>
                  <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-6">{children}</main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 w-full border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/rooms' && currentPath.startsWith('/rooms'));
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: item.path })}
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
