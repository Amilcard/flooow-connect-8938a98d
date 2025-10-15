import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import KidAddModal from './KidAddModal';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Heart, 
  Settings, 
  Edit,
  Trash2,
  Baby,
  Loader2
} from 'lucide-react';

interface Child {
  id: string;
  first_name: string;
  dob: string;
  needs_json?: {
    interests?: string[];
    specialNeeds?: string;
    gender?: string;
  };
  created_at?: string;
  updated_at?: string;
}

const MesEnfants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les enfants depuis Supabase
  const loadChildren = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Supabase may return JSON columns as Json/string; normalize needs_json into our Child shape
      // Accept a loose incoming type from the DB and parse defensively to avoid typing conflicts
      type RawChildRow = {
        id: string;
        first_name: string;
        dob: string;
        // Use unknown here because Supabase may return Json values that are number/string/object
        needs_json?: unknown | null;
        created_at?: string;
        updated_at?: string;
      };

      const parsedChildren: Child[] = (data || []).map((d: RawChildRow) => {
        let needs: { interests?: string[]; specialNeeds?: string; gender?: string } | undefined;
        try {
          if (typeof d?.needs_json === 'string') {
            needs = d.needs_json ? JSON.parse(d.needs_json) : undefined;
          } else if (typeof d?.needs_json === 'object' && d?.needs_json !== null) {
            needs = d.needs_json as { interests?: string[]; specialNeeds?: string; gender?: string };
          } else {
            // If needs_json is a primitive (number/boolean) or null, ignore it.
            needs = undefined;
          }
        } catch (e) {
          console.warn('Failed to parse needs_json for child', d?.id, e);
          needs = undefined;
        }

        return {
          id: d.id,
          first_name: d.first_name,
          dob: d.dob,
          needs_json: needs,
          created_at: d.created_at,
          updated_at: d.updated_at,
        };
      });

      setChildren(parsedChildren);
    } catch (error) {
      console.error('Erreur lors du chargement des enfants:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les enfants.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Charger les enfants au montage du composant
  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user, loadChildren]);

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

  const handleDeleteChild = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      // Recharger la liste des enfants
      await loadChildren();
      
      toast({
        title: "Profil supprimé",
        description: `Le profil de ${child?.first_name} a été supprimé.`,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'enfant. Veuillez réessayer.",
        variant: "destructive"
      });
    }
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
        
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setIsAddingChild(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>
    </div>      <div className="container px-4 py-6 space-y-4">
        {isLoading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
              <p className="text-muted-foreground">
                Récupération des données de vos enfants
              </p>
            </CardContent>
          </Card>
        ) : children.length === 0 ? (
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
          children.map((child) => {
            const interests = child.needs_json?.interests || [];
            const specialNeeds = child.needs_json?.specialNeeds || '';
            const gender = child.needs_json?.gender || '';
            
            return (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {child.first_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {child.first_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {calculateAge(child.dob)} ans
                          </span>
                          {gender && <Badge variant="outline">{gender}</Badge>}
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
                  {interests.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm flex items-center mb-2">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        Centres d'intérêt
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {specialNeeds && (
                    <div>
                      <h4 className="font-medium text-sm flex items-center mb-2">
                        <Settings className="w-4 h-4 mr-2 text-blue-500" />
                        Besoins particuliers
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {specialNeeds}
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
            );
          })
        )}
      </div>

      {/* Modal d'ajout d'enfant */}
      <KidAddModal 
        open={isAddingChild}
        onOpenChange={setIsAddingChild}
        onChildAdded={loadChildren}
      />
    </PageLayout>
  );
};

export default MesEnfants;