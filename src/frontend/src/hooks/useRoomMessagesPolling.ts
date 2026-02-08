import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useParticipantIdentity } from './useParticipantIdentity';
import type { RoomMessage, ExternalBlob } from '../backend';

export function useGetRoomMessages(roomId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const participantIdentity = useParticipantIdentity();

  return useQuery<RoomMessage[]>({
    queryKey: ['roomMessages', roomId],
    queryFn: async () => {
      if (!actor || !roomId) return [];
      try {
        return await actor.getRoomMessages(roomId, null);
      } catch (error) {
        console.error('Failed to get room messages:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!roomId && !!participantIdentity,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useSendRoomMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      roomId: string;
      content: string;
      replyTo: bigint | null;
      video: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendRoomMessage(params.roomId, params.content, params.replyTo, params.video);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomMessages', variables.roomId] });
    },
  });
}
