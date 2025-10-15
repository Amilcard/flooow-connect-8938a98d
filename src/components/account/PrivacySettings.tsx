import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Eye } from 'lucide-react';
import { SettingsType } from './types';

type Props = {
  settings: SettingsType;
  updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
};

const PrivacySettings: React.FC<Props> = ({ settings, updateSetting }) => {
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
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
