import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, X } from 'lucide-react';

interface ChildData {
  first_name: string;
  birth_date: string;
  is_student?: boolean;
  education_level?: string;
}

interface ProfileFormData {
  postal_code: string;
  quotient_familial?: number;
  marital_status?: 'single' | 'couple' | 'divorced' | 'widowed';
  children: ChildData[];
}

interface OnboardingProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  onSkip?: () => void;
}

export function OnboardingProfileForm({ onSubmit, onSkip }: OnboardingProfileFormProps) {
  const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      children: [{ first_name: '', birth_date: '', is_student: false }]
    }
  });
  const [completionScore, setCompletionScore] = useState(0);
  
  const postalCode = watch('postal_code');
  const qf = watch('quotient_familial');
  const children = watch('children') || [];
  
  // Calcul score complétude en temps réel
  useEffect(() => {
    let score = 0;
    if (postalCode?.length === 5) score += 30;
    if (qf && qf > 0) score += 30;
    if (children.length > 0 && children[0].first_name && children[0].birth_date) score += 40;
    setCompletionScore(score);
  }, [postalCode, qf, children]);
  
  const addChild = () => {
    setValue('children', [...children, { first_name: '', birth_date: '', is_student: false }]);
  };
  
  const removeChild = (index: number) => {
    if (children.length > 1) {
      setValue('children', children.filter((_, i) => i !== index));
    }
  };
  
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Créons votre profil</h2>
        <p className="text-muted-foreground mt-2">
          Ces informations nous permettent de vous montrer les aides auxquelles vous êtes éligible.
        </p>
        
        {/* Barre progression */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Complétude profil</span>
            <span className="font-semibold">{completionScore}%</span>
          </div>
          <Progress value={completionScore} />
          
          {completionScore < 60 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Complétez votre profil pour voir toutes les aides disponibles
            </p>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* SECTION 1: Adresse (obligatoire) */}
        <fieldset className="border rounded-lg p-4">
          <legend className="text-lg font-semibold px-2">
            📍 Votre domicile <span className="text-red-500">*</span>
          </legend>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Code postal
              </label>
              <Input
                {...register('postal_code', { 
                  required: 'Code postal requis',
                  pattern: {
                    value: /^[0-9]{5}$/,
                    message: 'Code postal invalide (5 chiffres)'
                  }
                })}
                placeholder="42000"
                maxLength={5}
              />
              {errors.postal_code && (
                <p className="text-xs text-red-600 mt-1">{errors.postal_code.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Nécessaire pour vérifier les aides locales
              </p>
            </div>
            
            {/* Vérification territoire en temps réel */}
            {postalCode?.length === 5 && (
              <TerritoryCheck postalCode={postalCode} />
            )}
          </div>
        </fieldset>
        
        {/* SECTION 2: Quotient familial (optionnel mais important) */}
        <fieldset className="border rounded-lg p-4 bg-blue-50/50">
          <legend className="text-lg font-semibold px-2">
            💰 Quotient familial <span className="text-amber-600">(recommandé)</span>
          </legend>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Quotient familial CAF (en €/mois)
            </label>
            <Input
              {...register('quotient_familial', {
                min: { value: 0, message: 'Montant invalide' },
                max: { value: 5000, message: 'Montant trop élevé' }
              })}
              type="number"
              placeholder="850"
            />
            {errors.quotient_familial && (
              <p className="text-xs text-red-600 mt-1">{errors.quotient_familial.message}</p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                ℹ️ Trouvez-le sur votre attestation CAF ou MSA
              </p>
              <details className="text-xs">
                <summary className="cursor-pointer text-primary hover:underline">
                  Pourquoi le demander ?
                </summary>
                <p className="mt-2 text-muted-foreground">
                  Le quotient familial permet de calculer automatiquement votre éligibilité 
                  aux aides sous conditions de ressources (Pass'Sport, bourses municipales, etc.).
                  <br/><strong>Sans cette info</strong>, nous ne pouvons que vous indiquer les aides 
                  potentielles sans confirmer votre éligibilité.
                </p>
              </details>
            </div>
          </div>
        </fieldset>
        
        {/* SECTION 3: Situation familiale (optionnel) */}
        <fieldset className="border rounded-lg p-4">
          <legend className="text-lg font-semibold px-2">
            👨‍👩‍👧 Situation familiale <span className="text-muted-foreground">(optionnel)</span>
          </legend>
          
          <div className="mt-4">
            <Select onValueChange={(value) => setValue('marital_status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Non renseigné" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="couple">En couple</SelectItem>
                <SelectItem value="single">Parent solo</SelectItem>
                <SelectItem value="divorced">Divorcé(e)</SelectItem>
                <SelectItem value="widowed">Veuf(ve)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Certaines aides majorent les montants pour les familles monoparentales
            </p>
          </div>
        </fieldset>
        
        {/* SECTION 4: Enfants (obligatoire) */}
        <fieldset className="border rounded-lg p-4">
          <legend className="text-lg font-semibold px-2">
            👶 Vos enfants <span className="text-red-500">*</span>
          </legend>
          
          <div className="mt-4 space-y-4">
            {children.map((_, index) => (
              <ChildFormSection
                key={index}
                index={index}
                register={register}
                watch={watch}
                setValue={setValue}
                remove={() => removeChild(index)}
                canRemove={children.length > 1}
                errors={errors}
              />
            ))}
            
            <Button
              type="button"
              onClick={addChild}
              variant="outline"
              className="w-full border-2 border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un enfant
            </Button>
          </div>
        </fieldset>
        
        {/* Résumé impact complétude */}
        {completionScore < 100 && (
          <Card className="bg-amber-50/50 border-amber-200 p-4">
            <h3 className="font-semibold text-amber-900 mb-2">
              🎯 Améliorez votre score
            </h3>
            <ul className="text-sm text-amber-800 space-y-1">
              {!qf && (
                <li>• Ajoutez votre quotient familial (+30 pts) → voir montants exacts</li>
              )}
              {children.length === 0 && (
                <li>• Ajoutez au moins un enfant (+40 pts) → voir aides par âge</li>
              )}
            </ul>
          </Card>
        )}
        
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Valider mon profil
          </Button>
          {onSkip && (
            <Button type="button" variant="outline" onClick={onSkip}>
              Passer cette étape
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

// Composant enfant individuel
interface ChildFormSectionProps {
  index: number;
  register: any;
  watch: any;
  setValue: any;
  remove: () => void;
  canRemove: boolean;
  errors: any;
}

function ChildFormSection({ index, register, watch, setValue, remove, canRemove, errors }: ChildFormSectionProps) {
  const birthDate = watch(`children.${index}.birth_date`);
  const isStudent = watch(`children.${index}.is_student`);
  
  const calculateAge = (date: string) => {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = birthDate ? calculateAge(birthDate) : null;
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">Enfant {index + 1}</h4>
        {canRemove && (
          <Button type="button" onClick={remove} variant="ghost" size="sm" className="text-red-600 h-auto p-1">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            {...register(`children.${index}.first_name`, { required: 'Prénom requis' })}
            placeholder="Prénom"
          />
          {errors?.children?.[index]?.first_name && (
            <p className="text-xs text-red-600 mt-1">{errors.children[index].first_name.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register(`children.${index}.birth_date`, { required: 'Date de naissance requise' })}
            type="date"
            max={new Date().toISOString().split('T')[0]}
          />
          {errors?.children?.[index]?.birth_date && (
            <p className="text-xs text-red-600 mt-1">{errors.children[index].birth_date.message}</p>
          )}
        </div>
      </div>
      
      {/* Si âge >= 11 ans, proposer scolarité */}
      {age !== null && age >= 11 && (
        <div className="bg-blue-50/50 rounded p-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register(`children.${index}.is_student`)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">
              Scolarisé ou en apprentissage
            </span>
          </label>
          
          {isStudent && (
            <Select onValueChange={(value) => setValue(`children.${index}.education_level`, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau scolaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middle_school">Collège</SelectItem>
                <SelectItem value="high_school">Lycée</SelectItem>
                <SelectItem value="apprenticeship">Apprentissage</SelectItem>
                <SelectItem value="higher_education">Études supérieures</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <p className="text-xs text-blue-700">
            ℹ️ Certaines aides jeunes nécessitent d'être scolarisé (Carte M'RA, Pass Culture)
          </p>
        </div>
      )}
    </div>
  );
}

// Composant vérification territoire
function TerritoryCheck({ postalCode }: { postalCode: string }) {
  const { data: territory, isLoading } = useQuery({
    queryKey: ['territory', postalCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('territories')
        .select('id, name, type, postal_codes')
        .eq('active', true)
        .or(`postal_codes.cs.{${postalCode}},department_code.eq.${postalCode.substring(0, 2)}`);
      
      if (error) throw error;
      return data || [];
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Vérification du territoire...
      </div>
    );
  }
  
  if (!territory || territory.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded p-3">
        <p className="text-sm text-amber-900">
          ⚠️ <strong>Code postal {postalCode} hors zone pilote</strong>
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Vous ne verrez que les aides nationales.
        </p>
      </div>
    );
  }
  
  const commune = territory.find((t) => t.type === 'commune');
  
  return (
    <div className="bg-green-50 border border-green-200 rounded p-3">
      <p className="text-sm text-green-900">
        ✓ <strong>{commune?.name || 'Votre commune'}</strong> est dans notre zone pilote !
      </p>
      <p className="text-xs text-green-700 mt-1">
        Vous aurez accès aux aides locales, départementales et régionales.
      </p>
    </div>
  );
}
