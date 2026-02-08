import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllRooms, useCreateRoom, useJoinRoomWithCode } from '../hooks/useRooms';
import { generateJoinCode } from '../utils/rooms';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Users, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { data: rooms = [], isLoading } = useGetAllRooms();
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutate: joinRoom, isPending: isJoining } = useJoinRoomWithCode();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCreateRoom = () => {
    const code = generateJoinCode();
    createRoom(
      { joinCode: code, isGroup: true },
      {
        onSuccess: (roomId) => {
          setCreatedRoomCode(code);
          toast.success('Room created successfully!');
        },
        onError: (error) => {
          toast.error('Failed to create room: ' + error.message);
        },
      }
    );
  };

  const handleJoinRoom = () => {
    const code = joinCode.trim();
    if (code.length !== 6) {
      toast.error('Join code must be 6 characters');
      return;
    }

    joinRoom(code, {
      onSuccess: (roomId) => {
        toast.success('Joined room successfully!');
        setShowJoinDialog(false);
        setJoinCode('');
        navigate({ to: '/rooms/$roomId', params: { roomId } });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
    setCodeCopied(true);
    toast.success('Join code copied to clipboard');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreatedRoomCode('');
    setCodeCopied(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <div className="flex gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Join Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Room</DialogTitle>
                <DialogDescription>
                  Enter the 6-character join code to join a room
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Join Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    maxLength={6}
                    disabled={isJoining}
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={isJoining || joinCode.trim().length !== 6}
                  className="w-full"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Room'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Room</DialogTitle>
                <DialogDescription>
                  {createdRoomCode
                    ? 'Share this code with others to let them join'
                    : 'Create a new room for group conversations'}
                </DialogDescription>
              </DialogHeader>
              {createdRoomCode ? (
                <div className="space-y-4">
                  <div className="p-6 bg-muted rounded-lg text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Join Code</p>
                    <p className="text-3xl font-bold tracking-wider">{createdRoomCode}</p>
                  </div>
                  <Button onClick={handleCopyCode} variant="outline" className="w-full">
                    {codeCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCloseCreateDialog} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                <Button onClick={handleCreateRoom} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <img
            src="/assets/generated/empty-state.dim_1200x800.png"
            alt="No rooms"
            className="w-64 h-auto opacity-50"
          />
          <h2 className="text-2xl font-semibold">No rooms yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Create a room or join one with a code to start group conversations
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate({ to: '/rooms/$roomId', params: { roomId: room.id } })}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Room {room.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
