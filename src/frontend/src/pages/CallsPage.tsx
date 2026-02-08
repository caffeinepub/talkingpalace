import { useGetCallHistory, useInitiateCall, useUpdateCallStatus } from '../hooks/useQueries';
import { useGetFriendsList } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Check, X } from 'lucide-react';
import { CallStatus } from '../backend';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function CallsPage() {
  const { identity } = useInternetIdentity();
  const { data: calls = [] } = useGetCallHistory();
  const { data: friends = [] } = useGetFriendsList();
  const { mutate: initiateCall } = useInitiateCall();
  const { mutate: updateCallStatus } = useUpdateCallStatus();
  const [showNewCall, setShowNewCall] = useState(false);

  const handleInitiateCall = (friendPrincipal: string) => {
    const principal = { __principal__: friendPrincipal } as any;
    initiateCall(principal, {
      onSuccess: () => {
        toast.success('Call initiated');
        setShowNewCall(false);
      },
      onError: (error) => {
        toast.error('Failed to initiate call: ' + error.message);
      },
    });
  };

  const handleAccept = (callId: bigint) => {
    updateCallStatus(
      { callId, status: CallStatus.accepted },
      {
        onSuccess: () => toast.success('Call accepted'),
        onError: (error) => toast.error('Failed to accept call: ' + error.message),
      }
    );
  };

  const handleDecline = (callId: bigint) => {
    updateCallStatus(
      { callId, status: CallStatus.declined },
      {
        onSuccess: () => toast.success('Call declined'),
        onError: (error) => toast.error('Failed to decline call: ' + error.message),
      }
    );
  };

  const getCallIcon = (call: any) => {
    const isIncoming = call.receiver.toString() === identity?.getPrincipal().toString();
    if (call.status === CallStatus.missed) return <PhoneMissed className="h-5 w-5 text-destructive" />;
    if (isIncoming) return <PhoneIncoming className="h-5 w-5 text-green-500" />;
    return <PhoneOutgoing className="h-5 w-5 text-blue-500" />;
  };

  const getCallStatusText = (status: CallStatus) => {
    switch (status) {
      case CallStatus.pending:
        return 'Pending';
      case CallStatus.accepted:
        return 'Accepted';
      case CallStatus.declined:
        return 'Declined';
      case CallStatus.missed:
        return 'Missed';
      case CallStatus.ended:
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  const pendingCalls = calls.filter(
    (call) =>
      call.status === CallStatus.pending &&
      call.receiver.toString() === identity?.getPrincipal().toString()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calls</h1>
        <Dialog open={showNewCall} onOpenChange={setShowNewCall}>
          <DialogTrigger asChild>
            <Button>
              <Phone className="mr-2 h-4 w-4" />
              New Call
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {friends.map((friend) => (
                <Card
                  key={friend.principal.toString()}
                  className="p-3 hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleInitiateCall(friend.principal.toString())}
                >
                  <p className="font-medium">{friend.principal.toString().slice(0, 20)}...</p>
                </Card>
              ))}
              {friends.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No friends to call</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pendingCalls.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Incoming Calls</h2>
          {pendingCalls.map((call) => (
            <Card key={call.id.toString()} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PhoneIncoming className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{call.caller.toString().slice(0, 20)}...</p>
                    <p className="text-sm text-muted-foreground">Incoming call</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => handleAccept(call.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDecline(call.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Call History</h2>
        {calls.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No call history</p>
        ) : (
          calls.map((call) => {
            const isIncoming = call.receiver.toString() === identity?.getPrincipal().toString();
            const otherParty = isIncoming ? call.caller : call.receiver;

            return (
              <Card key={call.id.toString()} className="p-4">
                <div className="flex items-center gap-3">
                  {getCallIcon(call)}
                  <div className="flex-1">
                    <p className="font-medium">{otherParty.toString().slice(0, 20)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {getCallStatusText(call.status)} •{' '}
                      {new Date(Number(call.startTime) / 1000000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
