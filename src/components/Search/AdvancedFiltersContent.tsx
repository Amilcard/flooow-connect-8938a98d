import { useState, useEffect } from 'react';
import { AdvancedFilters } from '@/types/searchFilters';
import { 
  Calendar, 
  Users, 
  Activity, 
  Heart, 
  MapPin, 
  Wallet, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdvancedFiltersContentProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

export const AdvancedFiltersContent = ({
  filters,
  onFiltersChange
}: AdvancedFiltersContentProps) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    details: true
  });

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // --- LOGIC: DEPENDENCIES ---
  // Période -> Type d'activité
  const periodOptions = [
    { value: 'vacances', label: 'Vacances scolaires' },
    { value: 'scolaire', label: 'Période scolaire' }
  ];

  const getActivityTypes = (period: string) => {
    if (period === 'vacances') {
      return [
        'Centre de loisirs',
        'Stage vacances',
        'Colonies / camps',
        'Accueil jeunesse',
        'Formules: Journée, Demi-journée, Semaine'
      ];
    } else if (period === 'scolaire') {
      return [
        'Activité hebdomadaire',
        'Mercredi',
        'Samedi',
        'Soirée'
      ];
    }
    // Default / Fallback if no period selected or 'all'
    return [
      'Sport',
      'Culture',
      'Loisirs',
      'Scolarité',
      'Vacances'
      // 'Insertion' // supprimé temporairement
    ];
  };

  const currentActivityTypes = getActivityTypes(filters.period);

  // --- HANDLERS ---
  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key: keyof AdvancedFilters, item: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFilter(key, newArray);
  };

  return (
    <div className="space-y-0 pb-20">
      {/* 1. PÉRIODE (Obligatoire) */}
      <FilterSection
        title="Période"
        icon={<Calendar className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.period}
        onToggle={() => toggleSection('period')}
        isCritical
      >
        <RadioGroup
          value={filters.period}
          onValueChange={(val) => updateFilter('period', val)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {periodOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`period-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`period-${option.value}`}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <span className="font-semibold">{option.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      {/* 2. AGE (Slider) */}
      <FilterSection
        title="Âge de l'enfant"
        icon={<Users className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.age}
        onToggle={() => toggleSection('age')}
      >
        <div className="space-y-6 px-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">6 ans</span>
            <span className="text-lg font-bold text-primary">
              {filters.age_range[0]} - {filters.age_range[1]} ans
            </span>
            <span className="text-sm font-medium text-muted-foreground">17 ans</span>
          </div>
          <Slider
            min={6}
            max={17}
            step={1}
            value={filters.age_range}
            onValueChange={(val) => updateFilter('age_range', val as [number, number])}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground text-center">
            Sélectionnez l'âge de votre enfant pour voir les activités adaptées.
          </p>
        </div>
      </FilterSection>

      {/* 3. TYPE D'ACTIVITÉ (Dépendant de Période) */}
      <FilterSection
        title="Type d'activité"
        icon={<Activity className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.type}
        onToggle={() => toggleSection('type')}
      >
        <div className="grid grid-cols-2 gap-3">
          {currentActivityTypes.map((type) => {
            const isSelected = filters.categories.includes(type);
            return (
              <div
                key={type}
                onClick={() => toggleArrayItem('categories', type)}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-sm font-medium transition-all text-center flex items-center justify-center h-14",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/50 hover:bg-accent"
                )}
              >
                {type}
              </div>
            );
          })}
        </div>
      </FilterSection>

      {/* 4. INKLUSIF (Besoins spécifiques) */}
      <FilterSection
        title="InKlusif"
        icon={<Heart className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.inklusif}
        onToggle={() => toggleSection('inklusif')}
        description="Besoins spécifiques et accessibilité"
      >
        <div className="space-y-3">
          {[
            "Activité inclusive",
            "Accueil adapté",
            "Accessibilité PMR / moteur",
            "Accessibilité sensorielle",
            "Inclusion TDA / TSA / Trisomie"
          ].map((item) => (
            <div key={item} className="flex items-center space-x-3">
              <Checkbox
                id={`inklusif-${item}`}
                checked={filters.specific_needs?.includes(item)}
                onCheckedChange={() => toggleArrayItem('specific_needs', item)}
              />
              <Label htmlFor={`inklusif-${item}`} className="text-sm font-normal cursor-pointer">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* 5. TRAJETS & MOBILITÉ */}
      <FilterSection
        title="Trajets & Mobilité"
        icon={<MapPin className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.mobility}
        onToggle={() => toggleSection('mobility')}
      >
        <div className="space-y-6">
          {/* Distance - DÉSACTIVÉ (pas de lat/lng en BDD) */}
          <div className="space-y-3 opacity-50">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Distance maximum
              <span className="text-xs text-muted-foreground font-normal">(bientôt disponible)</span>
            </Label>
            <div className="flex gap-2">
              {[10, 20, 30].map((dist) => (
                <button
                  key={dist}
                  disabled
                  className="flex-1 py-2 px-3 rounded-md text-sm border bg-muted text-muted-foreground cursor-not-allowed"
                >
                  ≤ {dist} min
                </button>
              ))}
            </div>
          </div>

          {/* Modes de transport - Seul Covoiturage est fonctionnel */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Écomobilité</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "Covoiturage", label: "Covoiturage", enabled: true },
                { value: "Marche & bien-être", label: "Marche & bien-être", enabled: false },
                { value: "Vélos / Velivert", label: "Vélos / Velivert", enabled: false },
                { value: "Transports en commun (STAS)", label: "Transports en commun (STAS)", enabled: false },
              ].map((mode) => (
                <div key={mode.value} className={cn("flex items-center space-x-3", !mode.enabled && "opacity-50")}>
                  <Checkbox
                    id={`mobility-${mode.value}`}
                    checked={filters.mobility_types?.includes(mode.value)}
                    onCheckedChange={() => mode.enabled && toggleArrayItem('mobility_types', mode.value)}
                    disabled={!mode.enabled}
                  />
                  <Label
                    htmlFor={`mobility-${mode.value}`}
                    className={cn("text-sm font-normal", mode.enabled ? "cursor-pointer" : "cursor-not-allowed")}
                  >
                    {mode.label}
                    {!mode.enabled && <span className="text-xs text-muted-foreground ml-1">(bientôt)</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* 6. BUDGET & AIDES */}
      <FilterSection
        title="Budget & Aides"
        icon={<Wallet className="w-5 h-5 text-primary" />}
        isOpen={!collapsedSections.budget}
        onToggle={() => toggleSection('budget')}
      >
        <div className="space-y-6">
          {/* Budget Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Budget max</Label>
              <span className="text-sm font-bold text-primary">
                {filters.max_budget}€
              </span>
            </div>
            <Slider
              min={0}
              max={500}
              step={10}
              value={[filters.max_budget]}
              onValueChange={(val) => updateFilter('max_budget', val[0])}
            />
          </div>

          {/* Aides & Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Options financières</Label>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="payment-echelon"
                checked={filters.payment_echelon}
                onCheckedChange={(checked) => updateFilter('payment_echelon', checked)}
              />
              <Label htmlFor="payment-echelon" className="text-sm cursor-pointer">
                Échelonnement des paiements
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="low-cost"
                checked={filters.qf_based_pricing}
                onCheckedChange={(checked) => updateFilter('qf_based_pricing', checked)}
              />
              <Label htmlFor="low-cost" className="text-sm cursor-pointer">
                Activités faible reste à charge
              </Label>
            </div>

            <div className="pt-2">
               <Label className="text-sm font-medium mb-2 block">Aides acceptées</Label>
               <div className="grid grid-cols-1 gap-2">
                 {["CAF", "Ville", "ANCV", "Pass'Sport", "Pass Culture"].map((aid) => (
                   <div key={aid} className="flex items-center space-x-3">
                     <Checkbox
                       id={`aid-${aid}`}
                       checked={filters.financial_aids_accepted?.includes(aid)}
                       onCheckedChange={() => toggleArrayItem('financial_aids_accepted', aid)}
                     />
                     <Label htmlFor={`aid-${aid}`} className="text-sm font-normal cursor-pointer">
                       {aid}
                     </Label>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* 7. PLUS DE DÉTAILS - DÉSACTIVÉ (champs non disponibles en BDD) */}
      <FilterSection
        title="Plus de détails"
        icon={<Info className="w-5 h-5 text-muted-foreground" />}
        isOpen={!collapsedSections.details}
        onToggle={() => toggleSection('details')}
        className="border-b-0"
        description="Bientôt disponible"
      >
        <div className="space-y-3 opacity-50">
          <p className="text-xs text-muted-foreground italic">
            Ces filtres seront disponibles prochainement.
          </p>
          {[
            "Horaires",
            "Jours de la semaine",
            "Niveau requis",
            "Matériel nécessaire",
            "Taille des groupes"
          ].map((detail) => (
            <div key={detail} className="flex items-center space-x-3">
              <Checkbox
                id={`detail-${detail}`}
                checked={false}
                disabled
              />
              <Label htmlFor={`detail-${detail}`} className="text-sm font-normal cursor-not-allowed text-muted-foreground">
                {detail}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

// Helper Component for Sections
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isCritical?: boolean;
  description?: string;
  className?: string;
}

const FilterSection = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  isCritical,
  description,
  className
}: FilterSectionProps) => {
  return (
    <div className={cn("border-b border-border", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{title}</span>
              {isCritical && <span className="text-red-500 text-xs">*</span>}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground font-normal mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

