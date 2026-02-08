import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { ThemeProvider } from './theme/ThemeProvider';
import SignInPage from './pages/SignInPage';
import InboxPage from './pages/InboxPage';
import ChatDetailPage from './pages/ChatDetailPage';
import CallsPage from './pages/CallsPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { Toaster } from '@/components/ui/sonner';

function Layout() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity && !!actor;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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

const callsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calls',
  component: CallsPage,
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  chatRoute,
  callsRoute,
  friendsRoute,
  profileRoute,
  settingsRoute,
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
