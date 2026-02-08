import { useState, useEffect } from 'react';

export interface GuestSession {
  guestId: string;
  username: string;
  displayName: string;
}

const GUEST_SESSION_KEY = 'guest_session';

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useGuestSession() {
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load guest session from localStorage on mount
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored) as GuestSession;
        setGuestSession(session);
      } catch (error) {
        console.error('Failed to parse guest session:', error);
        localStorage.removeItem(GUEST_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const createGuestSession = (username: string, displayName: string) => {
    const session: GuestSession = {
      guestId: generateGuestId(),
      username,
      displayName,
    };
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
    setGuestSession(session);
    return session;
  };

  const clearGuestSession = () => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestSession(null);
  };

  return {
    guestSession,
    isLoading,
    createGuestSession,
    clearGuestSession,
    isGuest: !!guestSession,
  };
}
