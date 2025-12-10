import { useNavigate } from 'react-router-dom';
import { ProfilLayout } from '@/components/ProfilLayout';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { 
  Bell, 
  Calendar, 
  CheckCircle,
  Info,
  Gift,
  Trash2,
  Heart,
  MapPin,
  Mail,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const MesNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotifications(user?.id);

  const {
    preferences,
    isLoading: preferencesLoading,
    updatePreferences
  } = useNotificationPreferences(user?.id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-5 h-5 text-green-600" />;
      case 'event_reminder': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'favorite': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'booking': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'system': return <Info className="w-5 h-5 text-muted-foreground" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Événement du territoire';
      case 'event_reminder': return 'Rappel d\'événement';
      case 'favorite': return 'Centre d\'intérêt';
      case 'booking': return 'Réservation';
      case 'system': return 'Système';
      default: return 'Notification';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return format(date, 'd MMM', { locale: fr });
    }
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/agenda-community`);
  };

  const categoryOptions = [
    { value: 'sport', label: 'Sport' },
    { value: 'culture', label: 'Culture' },
    { value: 'loisirs', label: 'Loisirs' },
    { value: 'education', label: 'Éducation' },
    { value: 'sante', label: 'Santé' },
    { value: 'social', label: 'Social' },
  ];

  const toggleCategory = (category: string) => {
    if (!preferences || !('interested_categories' in preferences)) return;
    
    const currentCategories = preferences.interested_categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updatePreferences.mutate({
      interested_categories: newCategories
    });
  };

  return (
    <ProfilLayout
      title="Mes notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
      backFallback="/mon-compte"
      tourId="notifications-page"
      rightContent={
        unreadCount > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tout lire
          </Button>
        ) : undefined
      }
    >
      <div>
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="preferences">
              Préférences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {notificationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </Card>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Aucune notification"
                description="Vous serez notifié des nouveaux événements dans votre territoire ou correspondant à vos centres d'intérêt"
              />
            ) : (
              notifications.map((notification: any) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.created_at)}
                              </span>
                              {!notification.read && (
                                <Badge variant="default" className="text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.payload?.event_title || notification.message}
                        </p>
                        
                        <div className="flex space-x-2">
                          {(notification.related_event_id || notification.payload?.event_id) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (!notification.read) {
                                  markAsRead.mutate(notification.id);
                                }
                                handleViewEvent(notification.related_event_id || notification.payload?.event_id);
                              }}
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              Voir l'événement
                            </Button>
                          )}
                          
                          {!notification.read ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead.mutate(notification.id)}
                              disabled={markAsRead.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Marquer comme lu
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteNotification.mutate(notification.id)}
                              disabled={deleteNotification.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {preferencesLoading ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Notifications d'événements du territoire */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Événements de mon territoire</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify_territory_events" className="flex-1">
                        <div>
                          <p className="font-medium">Recevoir les notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Être notifié des nouveaux événements dans votre territoire
                          </p>
                        </div>
                      </Label>
                      <Switch
                        id="notify_territory_events"
                        checked={preferences && 'notify_territory_events' in preferences ? preferences.notify_territory_events : true}
                        onCheckedChange={(checked) => 
                          updatePreferences.mutate({ notify_territory_events: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Centres d'intérêt */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Mes centres d'intérêt</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label htmlFor="notify_favorite_categories" className="flex-1">
                        <div>
                          <p className="font-medium">Activer les notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir des notifications pour les événements correspondant à vos centres d'intérêt
                          </p>
                        </div>
                      </Label>
                      <Switch
                        id="notify_favorite_categories"
                        checked={preferences && 'notify_favorite_categories' in preferences ? preferences.notify_favorite_categories : false}
                        onCheckedChange={(checked) => 
                          updatePreferences.mutate({ notify_favorite_categories: checked })
                        }
                      />
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium">Sélectionnez vos catégories préférées :</p>
                      <div className="grid grid-cols-2 gap-3">
                        {categoryOptions.map((category) => (
                          <div key={category.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.value}`}
                              checked={preferences && 'interested_categories' in preferences ? preferences.interested_categories?.includes(category.value) ?? false : false}
                              onCheckedChange={() => toggleCategory(category.value)}
                            />
                            <Label
                              htmlFor={`category-${category.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {category.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications par email */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Notifications par e-mail</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_notifications" className="flex-1">
                        <div>
                          <p className="font-medium">Nouveaux événements</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir les notifications de nouveaux événements par e-mail
                          </p>
                        </div>
                      </Label>
                      <Switch
                        id="email_notifications"
                        checked={preferences && 'email_notifications' in preferences ? preferences.email_notifications : false}
                        onCheckedChange={(checked) => 
                          updatePreferences.mutate({ email_notifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Label htmlFor="recommendation_emails" className="flex-1">
                        <div>
                          <p className="font-medium">Recommandations personnalisées</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir par e-mail les événements recommandés pour vous
                          </p>
                        </div>
                      </Label>
                      <Switch
                        id="recommendation_emails"
                        checked={preferences && 'recommendation_emails' in preferences ? preferences.recommendation_emails : false}
                        onCheckedChange={(checked) => 
                          updatePreferences.mutate({ recommendation_emails: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Rappels d'événements favoris */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Rappels d'événements favoris</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="event_reminders_enabled" className="flex-1">
                        <div>
                          <p className="font-medium">Activer les rappels</p>
                          <p className="text-sm text-muted-foreground">
                            Recevoir des rappels pour vos événements favoris avant qu'ils ne commencent
                          </p>
                        </div>
                      </Label>
                      <Switch
                        id="event_reminders_enabled"
                        checked={preferences && 'event_reminders_enabled' in preferences ? preferences.event_reminders_enabled : true}
                        onCheckedChange={(checked) => 
                          updatePreferences.mutate({ event_reminders_enabled: checked })
                        }
                      />
                    </div>

                    {preferences && 'event_reminders_enabled' in preferences && preferences.event_reminders_enabled && (
                      <>
                        <div className="space-y-3 pt-4 border-t">
                          <Label htmlFor="event_reminder_days_before">
                            <p className="font-medium mb-2">Nombre de jours avant l'événement</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              Vous serez notifié {preferences.event_reminder_days_before || 3} jour{(preferences.event_reminder_days_before || 3) > 1 ? 's' : ''} avant chaque événement favori
                            </p>
                          </Label>
                          <select
                            id="event_reminder_days_before"
                            value={preferences.event_reminder_days_before || 3}
                            onChange={(e) => 
                              updatePreferences.mutate({ event_reminder_days_before: parseInt(e.target.value) })
                            }
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="1">1 jour avant</option>
                            <option value="2">2 jours avant</option>
                            <option value="3">3 jours avant</option>
                            <option value="5">5 jours avant</option>
                            <option value="7">7 jours avant</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <Label htmlFor="event_reminder_email" className="flex-1">
                            <div>
                              <p className="font-medium">Recevoir aussi par e-mail</p>
                              <p className="text-sm text-muted-foreground">
                                Recevoir les rappels par e-mail en plus de la notification in-app
                              </p>
                            </div>
                          </Label>
                          <Switch
                            id="event_reminder_email"
                            checked={preferences && 'event_reminder_email' in preferences ? preferences.event_reminder_email : true}
                            onCheckedChange={(checked) => 
                              updatePreferences.mutate({ event_reminder_email: checked })
                            }
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProfilLayout>
  );
};

export default MesNotifications;
