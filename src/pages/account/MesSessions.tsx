import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
   
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  Wifi,
  Globe,
  Chrome,
  Trash2
} from 'lucide-react';

interface Session {
  id: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  deviceName: string;
  browser: string;
  location: {
    city: string;
    country: string;
    ip: string;
  };
  lastActivity: string;
  isCurrentSession: boolean;
  loginTime: string;
  osInfo: string;
}

const MesSessions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'current',
      deviceType: 'desktop',
      deviceName: 'MacBook Pro',
      browser: 'Chrome 118.0.0.0',
      location: {
        city: 'Paris',
        country: 'France',
        ip: '192.168.1.1'
      },
      lastActivity: new Date().toISOString(),
      isCurrentSession: true,
      loginTime: '2024-10-18T08:30:00Z',
      osInfo: 'macOS Sonoma 14.0'
    },
    {
      id: 'mobile-1',
      deviceType: 'mobile',
      deviceName: 'iPhone 15',
      browser: 'Safari 17.0',
      location: {
        city: 'Lyon',
        country: 'France',
        ip: '192.168.1.45'
      },
      lastActivity: '2024-10-18T14:20:00Z',
      isCurrentSession: false,
      loginTime: '2024-10-17T19:15:00Z',
      osInfo: 'iOS 17.1'
    },
    {
      id: 'tablet-1',
      deviceType: 'tablet',
      deviceName: 'iPad Air',
      browser: 'Safari 17.0',
      location: {
        city: 'Marseille',
        country: 'France',
        ip: '192.168.1.78'
      },
      lastActivity: '2024-10-16T22:45:00Z',
      isCurrentSession: false,
      loginTime: '2024-10-15T16:30:00Z',
      osInfo: 'iPadOS 17.1'
    }
  ]);

  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-6 h-6 text-green-600" />;
      case 'tablet': return <Tablet className="w-6 h-6 text-blue-600" />;
      case 'desktop': return <Monitor className="w-6 h-6 text-purple-600" />;
      default: return <Monitor className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    if (browser.includes('Chrome')) {
      return <Chrome className="w-4 h-4 text-blue-500" />;
    } else if (browser.includes('Safari')) {
      return <Globe className="w-4 h-4 text-blue-400" />;
    } else {
      return <Globe className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  const formatLoginTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setSessions(sessions.filter(session => session.id !== sessionId));
      setSessionToRevoke(null);
      
      toast({
        title: "Session fermée",
        description: "La session a été fermée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de fermer la session. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      setSessions(sessions.filter(session => session.isCurrentSession));
      
      toast({
        title: "Sessions fermées",
        description: "Toutes les autres sessions ont été fermées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de fermer les sessions. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getSecurityLevel = (session: Session) => {
    const isRecent = new Date(session.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isSecureLocation = session.location.country === 'France';
    
    if (session.isCurrentSession && isRecent && isSecureLocation) {
      return { level: 'high', color: 'text-green-600', label: 'Sécurisée' };
    } else if (isRecent && isSecureLocation) {
      return { level: 'medium', color: 'text-orange-600', label: 'Normale' };
    } else {
      return { level: 'low', color: 'text-red-600', label: 'À vérifier' };
    }
  };

  const activeSessions = sessions.filter(s => !s.isCurrentSession);

  return (
    <PageLayout showHeader={false}>
      {/* Header blanc standard */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <BackButton fallback="/mon-compte" positioning="relative" size="sm" showText={true} label="Retour" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground leading-tight">Mes sessions</h1>
              <p className="text-sm text-muted-foreground">
                {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {activeSessions.length > 0 && (
            <Button variant="destructive" size="sm" onClick={revokeAllOtherSessions}>
              <LogOut className="w-4 h-4 mr-2" />
              Fermer toutes
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Informations de sécurité */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Sécurité de vos sessions
                </h3>
                <p className="text-blue-800 text-sm">
                  Surveillez vos connexions actives. Si vous remarquez une activité suspecte, 
                  fermez immédiatement les sessions non reconnues et changez votre mot de passe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session actuelle */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Session actuelle
          </h2>
          
          {sessions
            .filter(session => session.isCurrentSession)
            .map(session => {
              const security = getSecurityLevel(session);
              return (
                <Card key={session.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{session.deviceName}</h4>
                            <Badge variant="default" className="bg-green-600">
                              Session actuelle
                            </Badge>
                            <Badge variant="outline" className={security.color}>
                              {security.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {getBrowserIcon(session.browser)}
                                <span className="text-muted-foreground">Navigateur:</span>
                                <span className="font-medium">{session.browser}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Monitor className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Système:</span>
                                <span className="font-medium">{session.osInfo}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Localisation:</span>
                                <span className="font-medium">
                                  {session.location.city}, {session.location.country}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Connexion:</span>
                                <span className="font-medium">{formatLoginTime(session.loginTime)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex items-center space-x-2 text-sm">
                              <Wifi className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">Actif maintenant</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Autres sessions */}
        {activeSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              Autres sessions ({activeSessions.length})
            </h2>
            
            <div className="space-y-4">
              {activeSessions.map(session => {
                const security = getSecurityLevel(session);
                return (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {getDeviceIcon(session.deviceType)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-lg">{session.deviceName}</h4>
                              <Badge variant="outline" className={security.color}>
                                {security.label}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  {getBrowserIcon(session.browser)}
                                  <span className="text-muted-foreground">Navigateur:</span>
                                  <span className="font-medium">{session.browser}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Monitor className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Système:</span>
                                  <span className="font-medium">{session.osInfo}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Localisation:</span>
                                  <span className="font-medium">
                                    {session.location.city}, {session.location.country}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Dernière activité:</span>
                                  <span className="font-medium">{formatLastActivity(session.lastActivity)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                Connecté depuis le {formatLoginTime(session.loginTime)} • IP: {session.location.ip}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSessionToRevoke(session.id)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Fermer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeSessions.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Shield className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2 text-green-700">
                Parfait ! Une seule session active
              </h3>
              <p className="text-muted-foreground">
                Vous n'avez que votre session actuelle, c'est bon pour la sécurité.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de confirmation */}
      <AlertDialog 
        open={!!sessionToRevoke} 
        onOpenChange={() => setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer cette session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action fermera définitivement cette session. L'utilisateur devra 
              se reconnecter pour accéder de nouveau à son compte depuis cet appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => sessionToRevoke && revokeSession(sessionToRevoke)}
              className="bg-red-600 hover:bg-red-700"
            >
              Fermer la session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default MesSessions;