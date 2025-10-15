import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Baby,
  Loader2
} from 'lucide-react';

interface KidAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildAdded?: () => void;
}

interface NewChildForm {
  firstName: string;
  dateOfBirth: string;
  gender: string;
  interests: string[];
  specialNeeds: string[];
}

// Options prédéfinies pour les centres d'intérêt
const INTEREST_OPTIONS = [
  'Sport',
  'Danse',
  'Musique',
  'Art/Dessin',
  'Théâtre',
  'Sciences',
  'Lecture',
  'Jeux vidéo',
  'Cuisine',
  'Nature/Jardinage',
  'Bricolage',
  'Informatique'
];

// Options organisées par catégories pour les besoins particuliers
const SPECIAL_NEEDS_CATEGORIES = {
  'Conditions neurologiques et développementales': [
    'Autisme',
    'Trouble de l\'attention (TDAH)',
    'Troubles de l\'apprentissage (dyslexie, etc.)'
  ],
  'Handicaps physiques': [
    'Handicap moteur',
    'Déficience visuelle',
    'Déficience auditive'
  ],
  'Conditions médicales': [
    'Asthme',
    'Diabète',
    'Épilepsie'
  ],
  'Allergies alimentaires': [
    'Allergie aux œufs',
    'Allergie aux cacahuètes',
    'Allergie aux fruits à coque (noix, amandes, etc.)',
    'Allergie au lait/produits laitiers',
    'Allergie au gluten/maladie cœliaque',
    'Allergie au soja',
    'Allergie aux fruits de mer/poissons',
    'Allergie aux graines de sésame',
    'Autres allergies alimentaires'
  ],
  'Allergies environnementales': [
    'Allergie aux pollens',
    'Allergie aux acariens',
    'Allergie aux animaux (poils, plumes)',
    'Allergie aux médicaments',
    'Autres allergies environnementales'
  ]
};

const KidAddModal: React.FC<KidAddModalProps> = ({ 
  open, 
  onOpenChange, 
  onChildAdded 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newChild, setNewChild] = useState<NewChildForm>({
    firstName: '',
    dateOfBirth: '',
    gender: '',
    interests: [],
    specialNeeds: []
  });

  const resetForm = () => {
    setNewChild({
      firstName: '',
      dateOfBirth: '',
      gender: '',
      interests: [],
      specialNeeds: []
    });
  };

  // Fonctions pour gérer les cases à cocher
  const handleInterestChange = (interest: string, checked: boolean) => {
    setNewChild(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSpecialNeedChange = (need: string, checked: boolean) => {
    setNewChild(prev => ({
      ...prev,
      specialNeeds: checked 
        ? [...prev.specialNeeds, need]
        : prev.specialNeeds.filter(n => n !== need)
    }));
  };

  const handleAddChild = async () => {
    if (!user || !newChild.firstName || !newChild.dateOfBirth) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (prénom et date de naissance).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const needs_json = {
        interests: newChild.interests,
        specialNeeds: newChild.specialNeeds,
        gender: newChild.gender || ''
      };

      const { data, error } = await supabase
        .from('children')
        .insert([{
          user_id: user.id,
          first_name: newChild.firstName,
          dob: newChild.dateOfBirth,
          needs_json
        }])
        .select()
        .single();

      if (error) throw error;

      // Réinitialiser le formulaire et fermer le modal
      resetForm();
      onOpenChange(false);

      // Notifier le parent pour recharger la liste
      if (onChildAdded) {
        onChildAdded();
      }

      toast({
        title: "Enfant ajouté",
        description: `Le profil de ${newChild.firstName} a été créé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'enfant:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enfant. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Baby className="w-5 h-5" />
            <span>Ajouter un enfant</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Prénom */}
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={newChild.firstName}
              onChange={(e) => setNewChild({...newChild, firstName: e.target.value})}
              placeholder="Prénom de l'enfant"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Date de naissance */}
          <div>
            <Label htmlFor="dateOfBirth">Date de naissance *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={newChild.dateOfBirth}
              onChange={(e) => setNewChild({...newChild, dateOfBirth: e.target.value})}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Genre */}
          <div>
            <Label htmlFor="gender">Genre</Label>
            <Select 
              value={newChild.gender} 
              onValueChange={(value) => setNewChild({...newChild, gender: value})}
              disabled={isSubmitting}
            >
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
          
          {/* Centres d'intérêt */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Centres d'intérêt</Label>
            <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto">
              {INTEREST_OPTIONS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={newChild.interests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                    disabled={isSubmitting}
                  />
                  <Label 
                    htmlFor={`interest-${interest}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            {newChild.interests.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {newChild.interests.length} intérêt{newChild.interests.length > 1 ? 's' : ''} sélectionné{newChild.interests.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {/* Besoins particuliers */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Besoins particuliers et allergies</Label>
            <div className="space-y-4">
              {Object.entries(SPECIAL_NEEDS_CATEGORIES).map(([categoryName, options]) => (
                <div key={categoryName} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                    {categoryName}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 pl-2">
                    {options.map((need) => (
                      <div key={need} className="flex items-center space-x-2">
                        <Checkbox
                          id={`need-${need}`}
                          checked={newChild.specialNeeds.includes(need)}
                          onCheckedChange={(checked) => handleSpecialNeedChange(need, !!checked)}
                          disabled={isSubmitting}
                        />
                        <Label 
                          htmlFor={`need-${need}`}
                          className="text-sm font-normal cursor-pointer leading-tight flex-1"
                        >
                          {need}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {newChild.specialNeeds.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-blue-700 font-medium">
                  ✓ {newChild.specialNeeds.length} besoin{newChild.specialNeeds.length > 1 ? 's' : ''} sélectionné{newChild.specialNeeds.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {newChild.specialNeeds.slice(0, 3).join(', ')}{newChild.specialNeeds.length > 3 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Boutons d'action - Section fixe en bas */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex space-x-3">
            <Button 
              onClick={handleAddChild} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter l'enfant"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KidAddModal;
