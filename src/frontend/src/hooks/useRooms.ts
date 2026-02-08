import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useParticipantIdentity } from './useParticipantIdentity';
import type { Room } from '../backend';

export function useGetAllRooms() {
  const { actor, isFetching: actorFetching } = useActor();
  const participantIdentity = useParticipantIdentity();

  return useQuery<Room[]>({
    queryKey: ['rooms', participantIdentity?.id],
    queryFn: async () => {
      if (!actor || !participantIdentity) return [];
      try {
        return await actor.getAllRooms(participantIdentity.id, null);
      } catch (error: any) {
        console.error('Failed to get rooms:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!participantIdentity,
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const participantIdentity = useParticipantIdentity();

  return useMutation({
    mutationFn: async (params: { joinCode: string; isGroup: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      const roomId = await actor.createRoom(params.joinCode, params.isGroup);
      return roomId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', participantIdentity?.id] });
    },
  });
}

export function useJoinRoomWithCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const participantIdentity = useParticipantIdentity();

  return useMutation({
    mutationFn: async (joinCode: string) => {
      if (!actor) throw new Error('Actor not available');
      if (!participantIdentity) throw new Error('No participant identity');
      
      try {
        const roomId = await actor.joinRoomWithCode(joinCode, participantIdentity.id);
        return roomId;
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        
        if (errorMessage.includes('Room is full') || errorMessage.includes('Maximum number of participants')) {
          throw new Error('This room is full. Maximum 50 participants allowed.');
        } else if (errorMessage.includes('Invalid join code')) {
          throw new Error('Invalid join code. Please check and try again.');
        } else if (errorMessage.includes('Invalid guest ID')) {
          throw new Error('Guest session expired. Please sign in again.');
        } else {
          throw new Error('Failed to join room. Please try again.');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', participantIdentity?.id] });
    },
  });
}

export function useGetRoom(roomId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const participantIdentity = useParticipantIdentity();

  return useQuery<Room | null>({
    queryKey: ['room', roomId, participantIdentity?.id],
    queryFn: async () => {
      if (!actor || !roomId || !participantIdentity) return null;
      try {
        return await actor.getRoom(roomId, participantIdentity.id);
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('not a participant')) {
          console.error('Not authorized to view this room');
        } else if (errorMessage.includes('Invalid guest ID')) {
          console.error('Guest session expired');
        } else {
          console.error('Failed to get room:', error);
        }
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!roomId && !!participantIdentity,
  });
}

export function useLeaveRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const participantIdentity = useParticipantIdentity();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!actor) throw new Error('Actor not available');
      if (!participantIdentity) throw new Error('No participant identity');
      await actor.leaveRoom(roomId, participantIdentity.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', participantIdentity?.id] });
    },
  });
}
