import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FinancialAid {
  id: string;
  name: string;
  slug: string;
  territory_level: string;
  territory_codes: string[];
  age_min: number;
  age_max: number;
  qf_max: number | null;
  amount_type: string;
  amount_value: number;
  amount_fixed?: number;
  amount_min?: number;
  amount_max?: number;
  eligibility_summary: string | null;
  verification_notes: string | null;
  categories: string[];
  cumulative: boolean;
  active: boolean;
  official_link: string | null;
}

interface EligibilityCheck {
  eligible: boolean;
  confidence: 'high' | 'medium' | 'low' | 'excluded';
  match_score: number;
  reason: string;
  missing_info: string[];
  estimated_amount_min: number;
  estimated_amount_max: number;
}

interface AidCardProps {
  aid: FinancialAid;
  eligibilityCheck: EligibilityCheck;
  onCompleteProfile?: () => void;
}

export function AidCard({ aid, eligibilityCheck, onCompleteProfile }: AidCardProps) {
  const { 
    eligible, 
    confidence, 
    match_score, 
    reason, 
    missing_info, 
    estimated_amount_min, 
    estimated_amount_max 
  } = eligibilityCheck;
  
  // Badge selon niveau confiance
  const getBadge = () => {
    if (!eligible) {
      return <Badge variant="destructive">❌ Non éligible</Badge>;
    }
    
    switch (confidence) {
      case 'high':
        return <Badge variant="success">✅ Éligible ({match_score}%)</Badge>;
      case 'medium':
        return <Badge variant="warning">⚠️ À vérifier ({match_score}%)</Badge>;
      case 'low':
        return <Badge variant="secondary">ℹ️ Infos manquantes ({match_score}%)</Badge>;
      default:
        return null;
    }
  };
  
  const getAmountDisplay = () => {
    if (aid.amount_type === 'fixed') {
      return `${aid.amount_fixed || aid.amount_value}€`;
    }
    
    if (confidence === 'high' && estimated_amount_min === estimated_amount_max) {
      return `~${estimated_amount_max}€`;
    }
    
    if (estimated_amount_min && estimated_amount_max) {
      return `${estimated_amount_min}€ à ${estimated_amount_max}€`;
    }
    
    return `${aid.amount_value}€`;
  };
  
  const getMissingInfoLabel = (infoKey: string) => {
    const labels: Record<string, string> = {
      'quotient_familial': 'Ajoutez votre quotient familial',
      'child_age': 'Précisez l\'âge de votre enfant',
      'student_status': 'Indiquez si votre enfant est scolarisé',
      'marital_status': 'Précisez votre situation familiale'
    };
    return labels[infoKey] || infoKey;
  };
  
  return (
    <Card 
      className={cn(
        "p-4 transition-all hover:shadow-md",
        eligible && confidence === 'high' && "border-green-500 bg-green-50/50",
        !eligible && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{aid.name}</h3>
          <p className="text-sm text-muted-foreground">
            {aid.territory_level === 'national' ? 'National' :
             aid.territory_level === 'region' ? 'Régional' :
             aid.territory_level === 'department' ? 'Départemental' :
             'Communal'}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-lg font-bold text-primary">{getAmountDisplay()}</div>
          {getBadge()}
        </div>
      </div>
      
      {aid.eligibility_summary && (
        <p className="text-sm text-muted-foreground mb-3">
          {aid.eligibility_summary}
        </p>
      )}
      
      <div className="space-y-2">
        {/* Raison matching */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-muted-foreground">📊</span>
          <span className="flex-1">{reason}</span>
        </div>
        
        {/* Infos manquantes */}
        {missing_info.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-fade-in">
            <p className="text-sm font-medium text-amber-900 mb-2">
              💡 Complétez votre profil pour vérifier
            </p>
            <ul className="text-xs text-amber-800 space-y-1">
              {missing_info.map((info) => (
                <li key={info}>• {getMissingInfoLabel(info)}</li>
              ))}
            </ul>
            {onCompleteProfile && (
              <Button
                variant="link"
                size="sm"
                onClick={onCompleteProfile}
                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto mt-2"
              >
                → Compléter maintenant
              </Button>
            )}
          </div>
        )}
        
        {/* Notes vérification club (si eligible) */}
        {eligible && aid.verification_notes && (
          <details className="text-xs">
            <summary className="cursor-pointer text-primary hover:underline font-medium">
              📋 Documents à présenter au club
            </summary>
            <p className="mt-2 text-muted-foreground whitespace-pre-line pl-5">
              {aid.verification_notes}
            </p>
          </details>
        )}
        
        {/* Lien officiel */}
        {aid.official_link && (
          <a
            href={aid.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            🔗 En savoir plus
          </a>
        )}
      </div>
    </Card>
  );
}
