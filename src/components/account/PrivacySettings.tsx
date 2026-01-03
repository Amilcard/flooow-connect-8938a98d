import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Eye, RotateCcw } from 'lucide-react';
import { SettingsType } from './types';
import { useToast } from '@/hooks/use-toast';

type Props = {
  settings: SettingsType;
  updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
};

const PrivacySettings: React.FC<Props> = ({ settings, updateSetting }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRestartOnboarding = () => {
    // Réinitialiser les flags d'onboarding
    localStorage.removeItem('onboardingDisabled');
    localStorage.removeItem('onboardingViewCount');
    localStorage.removeItem('flooow_tour_discovery_v1');

    toast({
      title: 'Onboarding réinitialisé',
      description: 'La présentation de l\'app s\'affichera à votre prochaine visite.',
    });

    // Optionnel: naviguer immédiatement vers l'onboarding
    navigate('/onboarding');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Confidentialité</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Visibilité du profil</Label>
          <Select value={settings.profileVisibility} onValueChange={(v: SettingsType['profileVisibility']) => updateSetting('profileVisibility', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Amis uniquement</SelectItem>
              <SelectItem value="private">Privé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="dataSharing" className="flex-1">
            <div>
              <p className="font-medium">Partage de données</p>
              <p className="text-sm text-muted-foreground">Partager des données anonymes pour améliorer les services</p>
            </div>
          </Label>
          <Switch id="dataSharing" checked={settings.dataSharing} onCheckedChange={(c: boolean) => updateSetting('dataSharing', c)} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="analytics" className="flex-1">
            <div>
              <p className="font-medium">Analyses d'usage</p>
              <p className="text-sm text-muted-foreground">Nous aider à comprendre comment vous utilisez l'app</p>
            </div>
          </Label>
          <Switch id="analytics" checked={settings.analytics} onCheckedChange={(c: boolean) => updateSetting('analytics', c)} />
        </div>

        {/* Bouton pour relancer l'onboarding */}
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestartOnboarding}
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Revoir la présentation de l'app
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
