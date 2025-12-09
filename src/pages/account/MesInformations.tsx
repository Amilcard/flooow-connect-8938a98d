import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
   
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save,
  User
} from 'lucide-react';

const MesInformations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Paix, 75001 Paris',
    dateOfBirth: '1985-06-15',
    bio: 'Parent de deux enfants passionné par les activités inclusives.',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Simulation de la sauvegarde
    toast({
      title: "Informations mises à jour",
      description: "Vos informations personnelles ont été sauvegardées avec succès.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurer les données originales
    setFormData({
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+33 6 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      dateOfBirth: '1985-06-15',
      bio: 'Parent de deux enfants passionné par les activités inclusives.',
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
              <h1 className="text-lg font-semibold text-foreground leading-tight">Mes informations</h1>
              <p className="text-sm text-muted-foreground">Gérer mon profil personnel</p>
            </div>
          </div>

          {/* Partie droite: Icon edit/save */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            aria-label={isEditing ? "Enregistrer" : "Modifier"}
          >
            {isEditing ? <Save className="w-5 h-5 text-muted-foreground" /> : <Edit className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Photo de profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Photo de profil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatar} alt={formData.firstName} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Membre depuis janvier 2024
              </p>
              <Badge variant="secondary" className="mt-2">
                Compte vérifié
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio">À propos de moi</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        {isEditing && (
          <div className="flex space-x-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Annuler
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MesInformations;