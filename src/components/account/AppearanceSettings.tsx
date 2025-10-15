import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Sun, Moon, Monitor } from 'lucide-react';
import { SettingsType } from './types';

type Props = {
  settings: SettingsType;
  updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
};

const AppearanceSettings: React.FC<Props> = ({ settings, updateSetting }) => {
  const themes = [
    { value: 'light', label: 'Clair', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Sombre', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'Système', icon: <Monitor className="w-4 h-4" /> }
  ];

  const fontSizes = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' },
    { value: 'xlarge', label: 'Très grand' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Apparence</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Thème</Label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <Button key={theme.value} variant={settings.theme === theme.value ? 'default' : 'outline'} size="sm" onClick={() => updateSetting('theme', theme.value as SettingsType['theme'])} className="flex items-center space-x-2">
                {theme.icon}
                <span>{theme.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Taille de police</Label>
          <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value as SettingsType['fontSize'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="highContrast" className="flex-1">
            <div>
              <p className="font-medium">Contraste élevé</p>
              <p className="text-sm text-muted-foreground">Améliore la lisibilité des textes</p>
            </div>
          </Label>
          <Switch id="highContrast" checked={settings.highContrast} onCheckedChange={(c) => updateSetting('highContrast', c as boolean)} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reducedMotion" className="flex-1">
            <div>
              <p className="font-medium">Réduire les animations</p>
              <p className="text-sm text-muted-foreground">Limite les mouvements et transitions</p>
            </div>
          </Label>
          <Switch id="reducedMotion" checked={settings.reducedMotion} onCheckedChange={(c) => updateSetting('reducedMotion', c as boolean)} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
