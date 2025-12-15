import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { SettingsType } from './types';

type Props = {
  settings: SettingsType;
  updateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
  showPasswordDialog: boolean;
  setShowPasswordDialog: (v: boolean) => void;
  passwordForm: { currentPassword: string; newPassword: string; confirmPassword: string };
  setPasswordForm: React.Dispatch<React.SetStateAction<{ currentPassword: string; newPassword: string; confirmPassword: string }>>;
  changePassword: () => void;
};

const SecuritySettings: React.FC<Props> = ({ settings, updateSetting, showPasswordDialog, setShowPasswordDialog, passwordForm, setPasswordForm, changePassword }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Sécurité</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mot de passe</p>
            <p className="text-sm text-muted-foreground">Dernière modification il y a 3 mois</p>
          </div>
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer le mot de passe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} className="pr-10" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showCurrentPassword ? "Masquer" : "Afficher"}>
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? "text" : "password"} className="pr-10" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showNewPassword ? "Masquer" : "Afficher"}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="pr-10" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showConfirmPassword ? "Masquer" : "Afficher"}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">Annuler</Button>
                  <Button onClick={changePassword} className="flex-1">Modifier</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="twoFactorAuth" className="flex-1">
            <div>
              <p className="font-medium">Authentification à deux facteurs</p>
              <p className="text-sm text-muted-foreground">Sécurité renforcée avec votre smartphone</p>
            </div>
          </Label>
          <Switch id="twoFactorAuth" checked={settings.twoFactorAuth} onCheckedChange={(c) => updateSetting('twoFactorAuth', Boolean(c))} />
        </div>

        <div className="space-y-2">
          <Label>Délai d'expiration de session</Label>
          {/* Reuse select from parent */}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
