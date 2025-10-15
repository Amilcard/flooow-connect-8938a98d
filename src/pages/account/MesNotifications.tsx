import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Settings, 
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'promotion' | 'system' | 'review';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const MesNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Réservation confirmée',
      message: 'Votre réservation pour "Cours de natation adaptée" a été confirmée pour le 20 octobre à 14h00.',
      type: 'booking',
      read: false,
      createdAt: '2024-10-15T09:30:00Z',
      actionUrl: '/mon-compte/reservations'
    },
    {
      id: '2',
      title: 'Rappel d\'activité',
      message: 'N\'oubliez pas votre activité "Atelier créatif inclusif" demain à 10h00.',
      type: 'reminder',
      read: false,
      createdAt: '2024-10-17T18:00:00Z'
    },
    {
      id: '3',
      title: 'Nouvelle activité disponible',
      message: 'Découvrez notre nouveau cours de danse adaptée pour les 8-12 ans !',
      type: 'promotion',
      read: true,
      createdAt: '2024-10-14T15:20:00Z',
      actionUrl: '/activities'
    },
    {
      id: '4',
      title: 'Évaluez votre expérience',
      message: 'Comment s\'est passée la "Sortie au zoo pédagogique" ? Partagez votre avis !',
      type: 'review',
      read: true,
      createdAt: '2024-10-15T20:00:00Z'
    },
    {
      id: '5',
      title: 'Mise à jour système',
      message: 'Nous avons amélioré l\'application avec de nouvelles fonctionnalités d\'accessibilité.',
      type: 'system',
      read: true,
      createdAt: '2024-10-12T10:00:00Z'
    }
  ]);

  const [preferences, setPreferences] = useState({
    emailBooking: true,
    emailReminders: true,
    emailPromotions: false,
    pushBooking: true,
    pushReminders: true,
    pushPromotions: true,
    smsReminders: false,
    soundEnabled: true
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5 text-green-600" />;
      case 'reminder': return <Bell className="w-5 h-5 text-orange-600" />;
      case 'promotion': return <Gift className="w-5 h-5 text-purple-600" />;
      case 'review': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'system': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'booking': return 'Réservation';
      case 'reminder': return 'Rappel';
      case 'promotion': return 'Promotion';
      case 'review': return 'Évaluation';
      case 'system': return 'Système';
      default: return 'Notification';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: false } : notif
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée avec succès.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast({
      title: "Toutes les notifications ont été lues",
      description: "Toutes vos notifications ont été marquées comme lues.",
    });
  };

  const updatePreference = (key: string, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences de notification ont été sauvegardées.",
    });
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
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageLayout showHeader={false}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mon-compte')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Mes notifications</h1>
              <p className="text-white/90 text-sm">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Tout lire
            </Button>
          )}
        </div>
      </div>

      <div className="container px-4 py-6">
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
            {notifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                  <p className="text-muted-foreground">
                    Vous n'avez pas encore de notifications
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
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
                                {formatDate(notification.createdAt)}
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
                          {notification.message}
                        </p>
                        
                        <div className="flex space-x-2">
                          {notification.actionUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                navigate(notification.actionUrl!);
                              }}
                            >
                              Voir détails
                            </Button>
                          )}
                          
                          {!notification.read ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Marquer comme lu
                            </Button>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Marquer comme non lu
                              </Button>
                          
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
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
            {/* Préférences Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Notifications par e-mail</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailBooking" className="flex-1">
                    <div>
                      <p className="font-medium">Confirmations de réservation</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les confirmations et modifications de réservations
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="emailBooking"
                    checked={preferences.emailBooking}
                    onCheckedChange={(checked) => updatePreference('emailBooking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailReminders" className="flex-1">
                    <div>
                      <p className="font-medium">Rappels d'activités</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des rappels avant vos activités
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="emailReminders"
                    checked={preferences.emailReminders}
                    onCheckedChange={(checked) => updatePreference('emailReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailPromotions" className="flex-1">
                    <div>
                      <p className="font-medium">Offres promotionnelles</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les nouvelles activités et offres spéciales
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="emailPromotions"
                    checked={preferences.emailPromotions}
                    onCheckedChange={(checked) => updatePreference('emailPromotions', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Préférences Push */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications push</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushBooking" className="flex-1">
                    <div>
                      <p className="font-medium">Réservations</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications instantanées pour les réservations
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="pushBooking"
                    checked={preferences.pushBooking}
                    onCheckedChange={(checked) => updatePreference('pushBooking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushReminders" className="flex-1">
                    <div>
                      <p className="font-medium">Rappels</p>
                      <p className="text-sm text-muted-foreground">
                        Rappels push pour vos activités
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="pushReminders"
                    checked={preferences.pushReminders}
                    onCheckedChange={(checked) => updatePreference('pushReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushPromotions" className="flex-1">
                    <div>
                      <p className="font-medium">Promotions</p>
                      <p className="text-sm text-muted-foreground">
                        Nouvelles activités et offres spéciales
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="pushPromotions"
                    checked={preferences.pushPromotions}
                    onCheckedChange={(checked) => updatePreference('pushPromotions', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Autres préférences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Autres préférences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsReminders" className="flex-1">
                    <div>
                      <p className="font-medium">Rappels SMS</p>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des SMS de rappel (facturable selon votre opérateur)
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="smsReminders"
                    checked={preferences.smsReminders}
                    onCheckedChange={(checked) => updatePreference('smsReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="soundEnabled" className="flex-1">
                    <div className="flex items-center space-x-2">
                      {preferences.soundEnabled ? 
                        <Volume2 className="w-4 h-4" /> : 
                        <VolumeX className="w-4 h-4" />
                      }
                      <div>
                        <p className="font-medium">Sons des notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Activer les sons pour les notifications push
                        </p>
                      </div>
                    </div>
                  </Label>
                  <Switch
                    id="soundEnabled"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => updatePreference('soundEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MesNotifications;