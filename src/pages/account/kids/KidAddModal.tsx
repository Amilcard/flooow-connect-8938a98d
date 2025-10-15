import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  interests: string;
  specialNeeds: string;
}

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
    interests: '',
    specialNeeds: ''
  });

  const resetForm = () => {
    setNewChild({
      firstName: '',
      dateOfBirth: '',
      gender: '',
      interests: '',
      specialNeeds: ''
    });
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
      const interestsArray = newChild.interests 
        ? newChild.interests.split(',').map(i => i.trim()).filter(i => i)
        : [];

      const needs_json = {
        interests: interestsArray,
        specialNeeds: newChild.specialNeeds || '',
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Baby className="w-5 h-5" />
            <span>Ajouter un enfant</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
          <div>
            <Label htmlFor="interests">Centres d'intérêt</Label>
            <Input
              id="interests"
              value={newChild.interests}
              onChange={(e) => setNewChild({...newChild, interests: e.target.value})}
              placeholder="Sport, Musique, Art... (séparés par des virgules)"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Besoins particuliers */}
          <div>
            <Label htmlFor="specialNeeds">Besoins particuliers</Label>
            <Textarea
              id="specialNeeds"
              value={newChild.specialNeeds}
              onChange={(e) => setNewChild({...newChild, specialNeeds: e.target.value})}
              placeholder="Allergies, handicaps, autres besoins..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Boutons d'action */}
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
