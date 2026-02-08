import { useInternetIdentity } from './useInternetIdentity';
import { useGuestSession } from './useGuestSession';

export interface ParticipantIdentity {
  id: string;
  displayName: string;
  isGuest: boolean;
}

export function useParticipantIdentity(): ParticipantIdentity | null {
  const { identity } = useInternetIdentity();
  const { guestSession } = useGuestSession();

  if (identity) {
    // For Internet Identity users, we need to get their profile
    // The display name will be fetched separately in components
    return {
      id: identity.getPrincipal().toString(),
      displayName: '', // Will be populated from profile
      isGuest: false,
    };
  }

  if (guestSession) {
    return {
      id: guestSession.guestId,
      displayName: guestSession.displayName,
      isGuest: true,
    };
  }

  return null;
}
