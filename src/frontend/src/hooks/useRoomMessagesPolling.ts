import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useParticipantIdentity } from './useParticipantIdentity';
import type { RoomMessage, ExternalBlob } from '../backend';

export function useGetRoomMessages(roomId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();
  const participantIdentity = useParticipantIdentity();

  return useQuery<RoomMessage[]>({
    queryKey: ['roomMessages', roomId, participantIdentity?.id],
    queryFn: async () => {
      if (!actor || !roomId || !participantIdentity) return [];
      try {
        return await actor.getRoomMessages(roomId, participantIdentity.id, null);
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('not a participant')) {
          console.error('Not authorized to view messages in this room');
        } else if (errorMessage.includes('Invalid guest ID')) {
          console.error('Guest session expired');
        } else {
          console.error('Failed to get room messages:', error);
        }
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
  const participantIdentity = useParticipantIdentity();

  return useMutation({
    mutationFn: async (params: {
      roomId: string;
      content: string;
      replyTo: bigint | null;
      video: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!participantIdentity) throw new Error('No participant identity');
      
      try {
        await actor.sendRoomMessage(
          params.roomId,
          participantIdentity.id,
          params.content,
          params.replyTo,
          params.video
        );
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('not a participant')) {
          throw new Error('You are not authorized to send messages in this room');
        } else if (errorMessage.includes('Invalid guest ID')) {
          throw new Error('Guest session expired. Please sign in again.');
        } else {
          throw new Error('Failed to send message. Please try again.');
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roomMessages', variables.roomId, participantIdentity?.id] });
    },
  });
}
