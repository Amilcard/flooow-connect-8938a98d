/**
 * QUICK ESTIMATE FORM - MODE 1 : ULTRA-RAPIDE
 * Formulaire simplifié avec seulement 4 champs (30 secondes)
 * Pour familles pressées ou sans info complète
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Sparkles } from 'lucide-react';
import { QuickEstimateParams } from '@/utils/FinancialAidEngine';

interface QuickEstimateFormProps {
  onSubmit: (params: QuickEstimateParams) => void;
  defaultPrice?: number;
}

export function QuickEstimateForm({ onSubmit, defaultPrice = 60 }: QuickEstimateFormProps) {
  const [age, setAge] = useState<string>('');
  const [typeActivite, setTypeActivite] = useState<string>('');
  const [prix, setPrix] = useState<string>(String(defaultPrice));
  const [ville, setVille] = useState<string>('');
  const [codePostal, setCodePostal] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: QuickEstimateParams = {
      age: parseInt(age, 10),
      type_activite: typeActivite as 'sport' | 'culture' | 'vacances' | 'loisirs',
      prix_activite: parseFloat(prix),
      ville: ville || undefined,
      code_postal: codePostal || undefined,
    };

    onSubmit(params);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle>Estimation rapide</CardTitle>
        </div>
        <CardDescription>
          4 informations seulement • 30 secondes • Sans création de compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Âge de l'enfant */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">
              Âge de l'enfant <span className="text-red-500">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Ex: 10"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="3"
              max="29"
              className="w-full"
              required
            />
          </div>

          {/* Type d'activité */}
          <div className="space-y-2">
            <Label htmlFor="type-activite" className="text-sm font-medium">
              Type d'activité <span className="text-red-500">*</span>
            </Label>
            <Select value={typeActivite} onValueChange={setTypeActivite} required>
              <SelectTrigger id="type-activite">
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sport">Sport (football, danse, natation...)</SelectItem>
                <SelectItem value="culture">Culture (musique, théâtre, arts...)</SelectItem>
                <SelectItem value="vacances">Vacances (colonies, camps...)</SelectItem>
                <SelectItem value="loisirs">Loisirs (ateliers, activités...)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prix de l'activité */}
          <div className="space-y-2">
            <Label htmlFor="prix" className="text-sm font-medium">
              Prix de l'activité (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prix"
              type="number"
              placeholder="60"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              min="0"
              max="10000"
              step="0.01"
              className="w-full"
              required
            />
          </div>

          {/* Ville ou Code postal (optionnel) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Ville ou Code postal <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="ville"
                type="text"
                placeholder="Ex: Saint-Étienne"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full"
              />
              <Input
                id="code-postal"
                type="text"
                placeholder="Ex: 42000"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
                pattern="[0-9]{5}"
                maxLength={5}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Pour détecter les aides territoriales (Saint-Étienne, Loire...)
            </p>
          </div>

          {/* Info estimation rapide */}
          <Alert className="bg-blue-50 border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Estimation indicative.</strong> Vous découvrirez ensuite comment obtenir plus d'aides
              en affinant votre profil (QF, CAF, aides sociales...).
            </AlertDescription>
          </Alert>

          {/* Bouton submit */}
          <Button type="submit" size="lg" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Estimer mes aides en 30s
          </Button>
        </form>

        {/* Note légale */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Sans engagement • Gratuit • Estimation immédiate
        </p>
      </CardContent>
    </Card>
  );
}
