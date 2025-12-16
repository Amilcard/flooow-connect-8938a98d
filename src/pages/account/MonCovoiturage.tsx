import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
   
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  MessageSquare,
  Plus,
  Search,
  Leaf
} from 'lucide-react';

interface Covoiturage {
  id: string;
  type: 'demande' | 'proposition';
  activity: string;
  date: string;
  time: string;
  departure: string;
  arrival: string;
  seats?: number;
  seatsAvailable?: number;
  contact: string;
  status: 'actif' | 'complet' | 'annulé';
  message?: string;
}

const MonCovoiturage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'demandes' | 'propositions'>('demandes');

  const [covoiturages, setCovoiturages] = useState<Covoiturage[]>([
    {
      id: '1',
      type: 'demande',
      activity: 'Stage Football été',
      date: '2024-10-25',
      time: '14:00',
      departure: '42 rue Victor Hugo, Saint-Étienne',
      arrival: 'Stade Geoffroy-Guichard',
      contact: '06 12 34 56 78',
      status: 'actif',
      message: 'Cherche covoiturage pour mon fils, retour prévu vers 17h'
    },
    {
      id: '2',
      type: 'proposition',
      activity: 'Atelier Arts Plastiques',
      date: '2024-10-28',
      time: '10:00',
      departure: 'Centre-ville Saint-Étienne',
      arrival: 'Maison des Arts',
      seats: 3,
      seatsAvailable: 2,
      contact: '06 98 76 54 32',
      status: 'actif',
      message: 'Je peux prendre 2 personnes, départ de la place Jean Jaurès'
    }
  ]);

  const [newCovoiturage, setNewCovoiturage] = useState({
    type: 'demande' as 'demande' | 'proposition',
    activity: '',
    date: '',
    time: '',
    departure: '',
    arrival: '',
    seats: 1,
    message: ''
  });

  const handleSubmit = () => {
    if (!newCovoiturage.activity || !newCovoiturage.date || !newCovoiturage.time || 
        !newCovoiturage.departure || !newCovoiturage.arrival) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    const nouveau: Covoiturage = {
      id: Date.now().toString(),
      type: newCovoiturage.type,
      activity: newCovoiturage.activity,
      date: newCovoiturage.date,
      time: newCovoiturage.time,
      departure: newCovoiturage.departure,
      arrival: newCovoiturage.arrival,
      ...(newCovoiturage.type === 'proposition' && {
        seats: newCovoiturage.seats,
        seatsAvailable: newCovoiturage.seats
      }),
      contact: '06 XX XX XX XX',
      status: 'actif',
      message: newCovoiturage.message
    };

    setCovoiturages([nouveau, ...covoiturages]);
    setShowNewDialog(false);
    setNewCovoiturage({
      type: 'demande',
      activity: '',
      date: '',
      time: '',
      departure: '',
      arrival: '',
      seats: 1,
      message: ''
    });

    toast({
      title: 'Covoiturage publié',
      description: newCovoiturage.type === 'demande' 
        ? 'Votre demande de covoiturage a été publiée.'
        : 'Votre proposition de covoiturage a été publiée.',
    });
  };

  const deleteCovoiturage = (id: string) => {
    setCovoiturages(covoiturages.filter(c => c.id !== id));
    toast({
      title: 'Covoiturage supprimé',
      description: 'Le covoiturage a été supprimé avec succès.',
    });
  };

  const demandes = covoiturages.filter(c => c.type === 'demande');
  const propositions = covoiturages.filter(c => c.type === 'proposition');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <PageLayout showHeader={false}>
      {/* Header blanc standard */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <BackButton fallback="/mon-compte" positioning="relative" size="sm" showText={true} label="Retour" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground leading-tight">Mon Covoiturage</h1>
              <p className="text-sm text-muted-foreground">
                {covoiturages.length} covoiturage{covoiturages.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau covoiturage</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Tabs 
                    value={newCovoiturage.type} 
                    onValueChange={(value) => setNewCovoiturage({...newCovoiturage, type: value as 'demande' | 'proposition'})}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="demande">Je cherche</TabsTrigger>
                      <TabsTrigger value="proposition">Je propose</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="activity">Activité *</Label>
                  <Input
                    id="activity"
                    value={newCovoiturage.activity}
                    onChange={(e) => setNewCovoiturage({...newCovoiturage, activity: e.target.value})}
                    placeholder="Nom de l'activité"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newCovoiturage.date}
                      onChange={(e) => setNewCovoiturage({...newCovoiturage, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newCovoiturage.time}
                      onChange={(e) => setNewCovoiturage({...newCovoiturage, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="departure">Départ *</Label>
                  <Input
                    id="departure"
                    value={newCovoiturage.departure}
                    onChange={(e) => setNewCovoiturage({...newCovoiturage, departure: e.target.value})}
                    placeholder="Adresse de départ"
                  />
                </div>

                <div>
                  <Label htmlFor="arrival">Arrivée *</Label>
                  <Input
                    id="arrival"
                    value={newCovoiturage.arrival}
                    onChange={(e) => setNewCovoiturage({...newCovoiturage, arrival: e.target.value})}
                    placeholder="Adresse d'arrivée"
                  />
                </div>

                {newCovoiturage.type === 'proposition' && (
                  <div>
                    <Label htmlFor="seats">Places disponibles *</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="8"
                      value={newCovoiturage.seats}
                      onChange={(e) => setNewCovoiturage({...newCovoiturage, seats: parseInt(e.target.value, 10) || 1})}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    value={newCovoiturage.message}
                    onChange={(e) => setNewCovoiturage({...newCovoiturage, message: e.target.value})}
                    placeholder="Informations complémentaires..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowNewDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    Publier
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Informations éco-mobilité */}
        <Card className="border-green-200 bg-green-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Leaf className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Éco-mobilité & économies
                </h3>
                <p className="text-green-800 text-sm">
                  Le covoiturage permet de réduire votre empreinte carbone et de partager 
                  les frais de déplacement. Une solution écologique et économique !
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'demandes' | 'propositions')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demandes">
              Mes demandes ({demandes.length})
            </TabsTrigger>
            <TabsTrigger value="propositions">
              Mes propositions ({propositions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demandes" className="space-y-4">
            {demandes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune demande</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore publié de demande de covoiturage
                  </p>
                  <Button onClick={() => {
                    setNewCovoiturage({...newCovoiturage, type: 'demande'});
                    setShowNewDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une demande
                  </Button>
                </CardContent>
              </Card>
            ) : (
              demandes.map((cov) => (
                <Card key={cov.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{cov.activity}</h3>
                          <Badge variant={cov.status === 'actif' ? 'default' : 'secondary'}>
                            {cov.status === 'actif' ? 'Actif' : cov.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(cov.date)} à {cov.time}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-foreground">Départ:</div>
                              <div>{cov.departure}</div>
                              <div className="font-medium text-foreground mt-1">Arrivée:</div>
                              <div>{cov.arrival}</div>
                            </div>
                          </div>
                          {cov.message && (
                            <div className="flex items-start space-x-2 text-muted-foreground">
                              <MessageSquare className="w-4 h-4 mt-0.5" />
                              <span className="italic">{cov.message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast({
                          title: "Bientôt disponible",
                          description: "La messagerie de contact sera disponible prochainement"
                        })}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contacter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteCovoiturage(cov.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="propositions" className="space-y-4">
            {propositions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune proposition</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore publié de proposition de covoiturage
                  </p>
                  <Button onClick={() => {
                    setNewCovoiturage({...newCovoiturage, type: 'proposition'});
                    setShowNewDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une proposition
                  </Button>
                </CardContent>
              </Card>
            ) : (
              propositions.map((cov) => (
                <Card key={cov.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{cov.activity}</h3>
                          <Badge variant={cov.status === 'actif' ? 'default' : 'secondary'}>
                            {cov.status === 'actif' ? 'Actif' : cov.status}
                          </Badge>
                          {cov.seatsAvailable !== undefined && (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {cov.seatsAvailable}/{cov.seats} places
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(cov.date)} à {cov.time}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-foreground">Départ:</div>
                              <div>{cov.departure}</div>
                              <div className="font-medium text-foreground mt-1">Arrivée:</div>
                              <div>{cov.arrival}</div>
                            </div>
                          </div>
                          {cov.message && (
                            <div className="flex items-start space-x-2 text-muted-foreground">
                              <MessageSquare className="w-4 h-4 mt-0.5" />
                              <span className="italic">{cov.message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast({
                          title: "Bientôt disponible",
                          description: "La gestion des participants sera disponible prochainement"
                        })}
                      >
                        Gérer les participants
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteCovoiturage(cov.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MonCovoiturage;
