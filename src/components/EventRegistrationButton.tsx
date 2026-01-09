import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserPlus, Users, X, Check } from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { Skeleton } from '@/components/ui/skeleton';

interface EventRegistrationButtonProps {
  eventId: string;
  userId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const EventRegistrationButton = ({
  eventId,
  userId,
  variant = 'default',
  size = 'default',
  showCount = true,
  className,
}: EventRegistrationButtonProps) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const {
    userRegistration,
    isLoading,
    stats,
    participants,
    register,
    unregister,
    isRegistered,
  } = useEventRegistration(eventId, userId);

  if (!userId) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Users className="h-4 w-4 mr-2" />
        {showCount && stats && `${stats.participants_count} `}
        Connectez-vous
      </Button>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-32" />;
  }

  const getButtonContent = () => {
    if (!isRegistered) {
      return (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          S'inscrire
        </>
      );
    }

    if (userRegistration?.status === 'going') {
      return (
        <>
          <Check className="h-4 w-4 mr-2 text-green-600" />
          Je participe
        </>
      );
    }

    return (
      <>
        <UserCheck className="h-4 w-4 mr-2" />
        Intéressé
      </>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isRegistered ? 'default' : variant}
              size={size}
              className={className}
              disabled={register.isPending || unregister.isPending}
            >
              <span className="flex items-center">
                {getButtonContent()}
                {showCount && stats && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.participants_count}
                  </Badge>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isRegistered ? (
              <>
                <DropdownMenuItem onClick={() => register.mutate('going')}>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Je participe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => register.mutate('interested')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Je suis intéressé
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {userRegistration?.status === 'interested' && (
                  <DropdownMenuItem onClick={() => register.mutate('going')}>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Confirmer ma participation
                  </DropdownMenuItem>
                )}
                {userRegistration?.status === 'going' && (
                  <DropdownMenuItem onClick={() => register.mutate('interested')}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Passer en intéressé
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => unregister.mutate()}
                  className="text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Se désinscrire
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowParticipants(true)}>
              <Users className="h-4 w-4 mr-2" />
              Voir les participants ({stats?.participants_count || 0})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog pour afficher les participants */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participants</DialogTitle>
            <DialogDescription>
              {stats && (
                <div className="flex gap-4 mt-2">
                  <Badge variant="default">
                    {stats.confirmed_count} participant{stats.confirmed_count > 1 ? 's' : ''} confirmé{stats.confirmed_count > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary">
                    {stats.interested_count} intéressé{stats.interested_count > 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants && participants.length > 0 ? (
              participants.map((participant: { id: string; status: string; profiles?: { email?: string } }) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {participant.status === 'going' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {participant.profiles?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.status === 'going' ? 'Participe' : 'Intéressé'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun participant pour le moment
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
