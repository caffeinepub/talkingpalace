import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGuestSession } from './hooks/useGuestSession';
import { useActor } from './hooks/useActor';
import { ThemeProvider } from './theme/ThemeProvider';
import SignInPage from './pages/SignInPage';
import InboxPage from './pages/InboxPage';
import ChatDetailPage from './pages/ChatDetailPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import RoomsPage from './pages/RoomsPage';
import RoomChatPage from './pages/RoomChatPage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { Toaster } from '@/components/ui/sonner';

function Layout() {
  const { identity } = useInternetIdentity();
  const { guestSession, isLoading: guestLoading } = useGuestSession();
  const { actor } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = (!!identity && !!actor) || !!guestSession;
  const isGuest = !!guestSession && !identity;
  
  // Only show profile setup for Internet Identity users who don't have a profile yet
  const showProfileSetup = !!identity && !!actor && !isGuest && !profileLoading && isFetched && userProfile === null;

  if (guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InboxPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$userId',
  component: ChatDetailPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/friends',
  component: FriendsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rooms',
  component: RoomsPage,
});

const roomChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rooms/$roomId',
  component: RoomChatPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  friendsRoute,
  profileRoute,
  settingsRoute,
  roomsRoute,
  roomChatRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
