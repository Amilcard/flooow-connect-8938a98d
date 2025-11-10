import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";

export const NotificationBadge = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  if (!unreadCount || unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </Badge>
  );
};
