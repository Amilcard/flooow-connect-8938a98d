/**
 * FAST ESTIMATE FORM - MODE 2 : RAPIDE
 * Formulaire pour affiner l'estimation avec 5-6 champs supplémentaires
 * (QF, CAF, condition sociale simplifiée, scolarité, fratrie)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, Sparkles } from 'lucide-react';
import { FastEstimateParams, QuickEstimateParams } from '@/utils/FinancialAidEngine';

interface FastEstimateFormProps {
  quickParams: QuickEstimateParams;
  onSubmit: (params: FastEstimateParams) => void;
  onBack?: () => void;
}

export function FastEstimateForm({ quickParams, onSubmit, onBack }: FastEstimateFormProps) {
  const [quotientFamilial, setQuotientFamilial] = useState('');
  const [allocataireCaf, setAllocataireCaf] = useState('');
  const [conditionSociale, setConditionSociale] = useState('');
  const [statutScolaire, setStatutScolaire] = useState('');
  const [nbEnfants, setNbEnfants] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params: FastEstimateParams = {
      ...quickParams,
      quotient_familial: quotientFamilial ? Number.parseFloat(quotientFamilial) : undefined,
      allocataire_caf: allocataireCaf === 'oui' ? true : allocataireCaf === 'non' ? false : undefined,
      a_condition_sociale: conditionSociale === 'oui' ? true : conditionSociale === 'non' ? false : undefined,
      statut_scolaire: statutScolaire ? (statutScolaire as 'primaire' | 'college' | 'lycee') : undefined,
      nb_enfants: nbEnfants ? Number.parseInt(nbEnfants, 10) : undefined,
    };

    onSubmit(params);
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <CardTitle>Affinez votre estimation</CardTitle>
        </div>
        <CardDescription>
          Répondez à 5 questions supplémentaires pour découvrir toutes vos aides (2 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quotient Familial */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="qf" className="text-sm font-medium">
                Quotient Familial (QF) <span className="text-red-500">*</span>
              </Label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => {
                  alert(
                    'Le Quotient Familial se trouve sur votre attestation CAF ou sur votre espace "Mon Compte" sur caf.fr'
                  );
                }}
              >
                <HelpCircle className="h-3 w-3" />
                Où trouver mon QF ?
              </button>
            </div>
            <Input
              id="qf"
              type="number"
              placeholder="Ex: 650"
              value={quotientFamilial}
              onChange={(e) => setQuotientFamilial(e.target.value)}
              min="0"
              max="5000"
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground">
              Trouvé sur votre attestation CAF (généralement entre 0 et 2000€)
            </p>
          </div>

          {/* Allocataire CAF */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Êtes-vous allocataire CAF ? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={allocataireCaf} onValueChange={setAllocataireCaf} required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="caf-oui" />
                <Label htmlFor="caf-oui" className="font-normal cursor-pointer">
                  Oui
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="caf-non" />
                <Label htmlFor="caf-non" className="font-normal cursor-pointer">
                  Non
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ne-sais-pas" id="caf-ne-sais-pas" />
                <Label htmlFor="caf-ne-sais-pas" className="font-normal cursor-pointer">
                  Je ne sais pas
                </Label>
              </div>
            </RadioGroup>
            {allocataireCaf === 'ne-sais-pas' && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-xs text-blue-900">
                  Vous êtes allocataire CAF si vous recevez au moins une prestation de la CAF
                  (allocations familiales, APL, RSA, etc.)
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Condition sociale */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Bénéficiez-vous d'une aide sociale ? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={conditionSociale} onValueChange={setConditionSociale} required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oui" id="social-oui" />
                <Label htmlFor="social-oui" className="font-normal cursor-pointer">
                  Oui
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non" id="social-non" />
                <Label htmlFor="social-non" className="font-normal cursor-pointer">
                  Non
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ne-sais-pas" id="social-ne-sais-pas" />
                <Label htmlFor="social-ne-sais-pas" className="font-normal cursor-pointer">
                  Je ne sais pas
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              ARS (Allocation Rentrée Scolaire), AEEH, AESH, bourse collège/lycée, ASE...
            </p>
          </div>

          {/* Statut scolaire */}
          <div className="space-y-2">
            <Label htmlFor="statut-scolaire" className="text-sm font-medium">
              Scolarité de l'enfant <span className="text-red-500">*</span>
            </Label>
            <Select value={statutScolaire} onValueChange={setStatutScolaire} required>
              <SelectTrigger id="statut-scolaire">
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primaire">Primaire (Maternelle + Élémentaire)</SelectItem>
                <SelectItem value="college">Collège</SelectItem>
                <SelectItem value="lycee">Lycée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nombre d'enfants */}
          <div className="space-y-2">
            <Label htmlFor="nb-enfants" className="text-sm font-medium">
              Nombre d'enfants dans votre famille <span className="text-red-500">*</span>
            </Label>
            <Select value={nbEnfants} onValueChange={setNbEnfants} required>
              <SelectTrigger id="nb-enfants">
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 enfant</SelectItem>
                <SelectItem value="2">2 enfants</SelectItem>
                <SelectItem value="3">3 enfants</SelectItem>
                <SelectItem value="4">4 enfants</SelectItem>
                <SelectItem value="5">5 enfants ou plus</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              2 enfants ou plus = réduction fratrie de 10%
            </p>
          </div>

          {/* Info estimation */}
          <Alert className="bg-green-50 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-900">
              <strong>Estimation personnalisée</strong> : Avec ces informations, nous pourrons calculer
              précisément vos aides (Pass'Sport, VACAF, CAF Loire, réductions...)
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="sm:w-auto">
                Retour
              </Button>
            )}
            <Button type="submit" className="flex-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Calculer mes aides
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
