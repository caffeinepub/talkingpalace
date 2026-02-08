import { useQueries } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Friend } from '../backend';
import { Principal } from '@dfinity/principal';

export interface FriendProfileData {
  profile: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
}

export function useInboxFriendProfiles(friends: Friend[]) {
  const { actor, isFetching: actorFetching } = useActor();

  const queries = useQueries({
    queries: friends.map((friend) => ({
      queryKey: ['userProfile', friend.principal.toString()],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getProfile(friend.principal);
      },
      enabled: !!actor && !actorFetching,
      staleTime: 60000, // Cache for 1 minute
    })),
  });

  // Create a map of principal string -> profile data
  const profileMap = new Map<string, FriendProfileData>();
  
  friends.forEach((friend, index) => {
    const query = queries[index];
    profileMap.set(friend.principal.toString(), {
      profile: query.data ?? null,
      isLoading: query.isLoading,
      isError: query.isError,
    });
  });

  return profileMap;
}
