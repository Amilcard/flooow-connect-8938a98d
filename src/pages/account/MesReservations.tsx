import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
   
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Euro,
  Phone,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface Reservation {
  id: string;
  activityName: string;
  activityImage: string;
  childName: string;
  date: string;
  time: string;
  location: string;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  organizerName: string;
  organizerPhone: string;
  category: string;
  notes?: string;
}

const MesReservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reservations] = useState<Reservation[]>([
    {
      id: '1',
      activityName: 'Cours de natation adaptée',
      activityImage: '/api/placeholder/300/200',
      childName: 'Emma Doe',
      date: '2024-10-20',
      time: '14:00-15:00',
      location: 'Piscine municipale, 123 Rue de la Natation',
      price: 25,
      status: 'confirmed',
      organizerName: 'Aqua Sport Club',
      organizerPhone: '+33 1 23 45 67 89',
      category: 'Sport',
      notes: 'Apporter maillot de bain et serviette'
    },
    {
      id: '2',
      activityName: 'Atelier créatif inclusif',
      activityImage: '/api/placeholder/300/200',
      childName: 'Lucas Doe',
      date: '2024-10-18',
      time: '10:00-12:00',
      location: 'Centre culturel, 456 Avenue des Arts',
      price: 15,
      status: 'pending',
      organizerName: 'Art & Inclusion',
      organizerPhone: '+33 1 34 56 78 90',
      category: 'Loisirs'
    },
    {
      id: '3',
      activityName: 'Sortie au zoo pédagogique',
      activityImage: '/api/placeholder/300/200',
      childName: 'Emma Doe',
      date: '2024-10-15',
      time: '09:00-17:00',
      location: 'Zoo de Paris, Bois de Vincennes',
      price: 20,
      status: 'completed',
      organizerName: 'Découverte Nature',
      organizerPhone: '+33 1 45 67 89 01',
      category: 'Éducatif',
      notes: 'Sortie très réussie, Emma a adoré !'
    },
    {
      id: '4',
      activityName: 'Stage de football adapté',
      activityImage: '/api/placeholder/300/200',
      childName: 'Lucas Doe',
      date: '2024-09-30',
      time: '14:00-16:00',
      location: 'Stade municipal',
      price: 30,
      status: 'cancelled',
      organizerName: 'Football Pour Tous',
      organizerPhone: '+33 1 56 78 90 12',
      category: 'Sport',
      notes: 'Annulé en raison de la météo'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed': return <Star className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'completed': return 'Terminée';
      default: return 'Inconnue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterReservations = (status: string) => {
    if (status === 'all') return reservations;
    return reservations.filter(res => res.status === status);
  };

  const handleCancelReservation = (reservationId: string) => {
    toast({
      title: "Réservation annulée",
      description: "Votre réservation a été annulée avec succès.",
    });
  };

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{reservation.activityName}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {reservation.childName}
              </span>
              <Badge variant="outline">{reservation.category}</Badge>
            </div>
          </div>
          <Badge className={getStatusColor(reservation.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(reservation.status)}
              <span>{getStatusLabel(reservation.status)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{new Date(reservation.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{reservation.time}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="line-clamp-2">{reservation.location}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Euro className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{reservation.price}€</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{reservation.organizerName}</span>
            </div>
          </div>
        </div>
        
        {reservation.notes && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Notes:</strong> {reservation.notes}
            </p>
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{reservation.activityName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Enfant:</strong>
                    <p>{reservation.childName}</p>
                  </div>
                  <div>
                    <strong>Organisateur:</strong>
                    <p>{reservation.organizerName}</p>
                  </div>
                  <div>
                    <strong>Date:</strong>
                    <p>{new Date(reservation.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <strong>Horaire:</strong>
                    <p>{reservation.time}</p>
                  </div>
                  <div className="col-span-2">
                    <strong>Lieu:</strong>
                    <p>{reservation.location}</p>
                  </div>
                  <div>
                    <strong>Prix:</strong>
                    <p>{reservation.price}€</p>
                  </div>
                  <div>
                    <strong>Téléphone:</strong>
                    <p>{reservation.organizerPhone}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Billet
          </Button>
          
          {reservation.status === 'confirmed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCancelReservation(reservation.id)}
              className="text-red-600 hover:text-red-700"
            >
              Annuler
            </Button>
          )}
          
          {reservation.status === 'completed' && (
            <Button variant="outline" size="sm">
              <Star className="w-4 h-4 mr-2" />
              Évaluer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout showHeader={false}>
      {/* Header blanc standard */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <BackButton fallback="/mon-compte" positioning="relative" size="sm" showText={true} label="Retour" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground leading-tight">Mes réservations</h1>
              <p className="text-sm text-muted-foreground">{reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réserver
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Toutes ({reservations.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmées ({filterReservations('confirmed').length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({filterReservations('pending').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Terminées ({filterReservations('completed').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Annulées ({filterReservations('cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {reservations.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground mb-6">
                    Vous n'avez pas encore de réservations
                  </p>
                  <Button onClick={() => navigate('/activities')}>
                    Découvrir les activités
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            )}
          </TabsContent>

          {['confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterReservations(status).map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
              {filterReservations(status).length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucune réservation {getStatusLabel(status).toLowerCase()}
                    </h3>
                    <p className="text-muted-foreground">
                      Vous n'avez pas de réservations avec ce statut
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MesReservations;