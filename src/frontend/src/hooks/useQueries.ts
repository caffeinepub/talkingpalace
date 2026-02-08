import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Message, Call, Friend, UserProfile, CallStatus, SearchResult } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

// Messages
export function useGetMessagesWithUser(otherUserId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherUserId],
    queryFn: async () => {
      if (!actor || !otherUserId) return [];
      const principal = Principal.fromText(otherUserId);
      return actor.getMessagesWithUser(principal);
    },
    enabled: !!actor && !actorFetching && !!otherUserId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      receiver: Principal;
      content: string;
      replyTo: bigint | null;
      video: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(params.receiver, params.content, params.replyTo, params.video);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver.toString()] });
    },
  });
}

// Calls
export function useGetCallHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Call[]>({
    queryKey: ['callHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallHistory();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useInitiateCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiver: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateCall(receiver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
    },
  });
}

export function useUpdateCallStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { callId: bigint; status: CallStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateCallStatus(params.callId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
    },
  });
}

// Friends
export function useGetFriendsList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Friend[]>({
    queryKey: ['friendsList'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendsList();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addFriend(friend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsList'] });
    },
  });
}

export function useRemoveFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeFriend(friend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsList'] });
    },
  });
}

export function useToggleBestFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.toggleBestFriend(friend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsList'] });
    },
  });
}

// User profiles
export function useGetUserProfile(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const principal = Principal.fromText(userId);
      return actor.getProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useUpdateProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (picture: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfilePicture(picture);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// User search
export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SearchResult[]>({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchUsers(searchTerm.trim());
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}
