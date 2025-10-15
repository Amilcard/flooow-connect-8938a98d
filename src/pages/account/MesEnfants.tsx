import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Heart, 
  Settings, 
  Edit,
  Trash2,
  Baby
} from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
  specialNeeds: string;
  avatar?: string;
}

const MesEnfants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingChild, setIsAddingChild] = useState(false);
  
  const [children, setChildren] = useState<Child[]>([
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Doe',
      dateOfBirth: '2015-03-20',
      gender: 'Fille',
      interests: ['Danse', 'Dessin', 'Natation'],
      specialNeeds: 'Aucun besoin particulier',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Doe&background=f59e0b&color=fff'
    },
    {
      id: '2',
      firstName: 'Lucas',
      lastName: 'Doe',
      dateOfBirth: '2012-11-10',
      gender: 'Garçon',
      interests: ['Football', 'Jeux vidéo', 'Sciences'],
      specialNeeds: 'Allergie aux arachides',
      avatar: 'https://ui-avatars.com/api/?name=Lucas+Doe&background=3b82f6&color=fff'
    }
  ]);

  const [newChild, setNewChild] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    interests: '',
    specialNeeds: ''
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleAddChild = () => {
    if (!newChild.firstName || !newChild.lastName || !newChild.dateOfBirth) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const child: Child = {
      id: Date.now().toString(),
      ...newChild,
      interests: newChild.interests.split(',').map(i => i.trim()).filter(i => i),
      avatar: `https://ui-avatars.com/api/?name=${newChild.firstName}+${newChild.lastName}&background=10b981&color=fff`
    };

    setChildren([...children, child]);
    setNewChild({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      interests: '',
      specialNeeds: ''
    });
    setIsAddingChild(false);

    toast({
      title: "Enfant ajouté",
      description: `Le profil de ${child.firstName} a été créé avec succès.`,
    });
  };

  const handleDeleteChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    setChildren(children.filter(c => c.id !== childId));
    
    toast({
      title: "Profil supprimé",
      description: `Le profil de ${child?.firstName} a été supprimé.`,
    });
  };

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
              <h1 className="text-xl font-bold">Mes enfants</h1>
              <p className="text-white/90 text-sm">{children.length} enfant{children.length > 1 ? 's' : ''} enregistré{children.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Baby className="w-5 h-5" />
                  <span>Ajouter un enfant</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={newChild.firstName}
                      onChange={(e) => setNewChild({...newChild, firstName: e.target.value})}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={newChild.lastName}
                      onChange={(e) => setNewChild({...newChild, lastName: e.target.value})}
                      placeholder="Nom"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newChild.dateOfBirth}
                    onChange={(e) => setNewChild({...newChild, dateOfBirth: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={newChild.gender} onValueChange={(value) => setNewChild({...newChild, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Garçon">Garçon</SelectItem>
                      <SelectItem value="Fille">Fille</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="interests">Centres d'intérêt</Label>
                  <Input
                    id="interests"
                    value={newChild.interests}
                    onChange={(e) => setNewChild({...newChild, interests: e.target.value})}
                    placeholder="Sport, Musique, Art... (séparés par des virgules)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialNeeds">Besoins particuliers</Label>
                  <Textarea
                    id="specialNeeds"
                    value={newChild.specialNeeds}
                    onChange={(e) => setNewChild({...newChild, specialNeeds: e.target.value})}
                    placeholder="Allergies, handicaps, autres besoins..."
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={handleAddChild} className="flex-1">
                    Ajouter l'enfant
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingChild(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-4">
        {children.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Baby className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun enfant enregistré</h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez le profil de vos enfants pour personnaliser leur expérience
              </p>
              <Button onClick={() => setIsAddingChild(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter mon premier enfant
              </Button>
            </CardContent>
          </Card>
        ) : (
          children.map((child) => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={child.avatar} alt={child.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                        {child.firstName[0]}{child.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {child.firstName} {child.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {calculateAge(child.dateOfBirth)} ans
                        </span>
                        <Badge variant="outline">{child.gender}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {child.interests.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm flex items-center mb-2">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Centres d'intérêt
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {child.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {child.specialNeeds && (
                  <div>
                    <h4 className="font-medium text-sm flex items-center mb-2">
                      <Settings className="w-4 h-4 mr-2 text-blue-500" />
                      Besoins particuliers
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {child.specialNeeds}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/activities?child=${child.id}`)}
                  >
                    Voir les activités adaptées
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/mon-compte/reservations?child=${child.id}`)}
                  >
                    Ses réservations
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default MesEnfants;