/**
 * QUICK ESTIMATE CARD - MODE 1 : ULTRA-RAPIDE
 * Affiche les résultats d'une estimation rapide (30 secondes)
 * avec incitation à affiner pour découvrir plus d'aides
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EstimateResult } from '@/utils/FinancialAidEngine';
import { ChevronRight, Sparkles, Info, AlertCircle } from 'lucide-react';

interface QuickEstimateCardProps {
  result: EstimateResult;
  onAffiner?: () => void;
  onReserver?: () => void;
  showActions?: boolean;
}

export function QuickEstimateCard({
  result,
  onAffiner,
  onReserver,
  showActions = true,
}: QuickEstimateCardProps) {
  const { aides_detectees, montant_min, montant_max, aides_potentielles, message_incitation, niveau_confiance } = result;

  // Couleur du badge selon le niveau de confiance
  const confidenceBadgeVariant = {
    faible: 'secondary',
    moyen: 'default',
    élevé: 'default',
  } as const;

  const confidenceColors = {
    faible: 'text-orange-600',
    moyen: 'text-blue-600',
    élevé: 'text-green-600',
  };

  return (
    <div className="space-y-4">
      {/* Résultat principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Estimation rapide</CardTitle>
            <Badge variant={confidenceBadgeVariant[niveau_confiance]} className={confidenceColors[niveau_confiance]}>
              {niveau_confiance === 'faible' && '⚡ Indicatif'}
              {niveau_confiance === 'moyen' && '📊 Personnalisé'}
              {niveau_confiance === 'élevé' && '✅ Précis'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Montant estimé */}
          <div className="text-center py-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            {aides_detectees.length > 0 ? (
              <>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(montant_min)}€
                </div>
                <p className="text-sm text-muted-foreground mt-1">d'aides confirmées</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">
                  {montant_max > 0 ? `jusqu'à ${Math.round(montant_max)}€` : 'Aides disponibles'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">à découvrir</p>
              </>
            )}
          </div>

          {/* Aides détectées */}
          {aides_detectees.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Aides disponibles :</p>
              {aides_detectees.map((aide) => (
                <div
                  key={aide.id}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{aide.name}</p>
                    {aide.message && (
                      <p className="text-xs text-green-700 mt-0.5">{aide.message}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-900">
                    {Math.round(aide.montant)}€
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Message d'incitation */}
          {message_incitation && (
            <Alert className={`${
              aides_potentielles.length > 0
                ? 'bg-blue-50 border-blue-200'
                : 'bg-muted border-border'
            }`}>
              {aides_potentielles.length > 0 ? (
                <Sparkles className="h-4 w-4 text-blue-600" />
              ) : (
                <Info className="h-4 w-4 text-muted-foreground" />
              )}
              <AlertDescription className={`text-sm ${
                aides_potentielles.length > 0 ? 'text-blue-900' : 'text-foreground'
              }`}>
                <span dangerouslySetInnerHTML={{ __html: message_incitation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </AlertDescription>
            </Alert>
          )}

          {/* Aides potentielles (aperçu) */}
          {aides_potentielles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-900">
                  Vous pourriez aussi être éligible à :
                </p>
              </div>
              <div className="grid gap-2">
                {aides_potentielles.slice(0, 4).map((aide, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">{aide.name}</p>
                      <p className="text-xs text-orange-700 mt-0.5">
                        {aide.criteres_requis[0]}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 border-orange-300 text-orange-900">
                      {aide.montant_possible}
                    </Badge>
                  </div>
                ))}
                {aides_potentielles.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    + {aides_potentielles.length - 4} autre(s) aide(s) potentielle(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2 pt-2">
              {aides_potentielles.length > 0 && onAffiner && (
                <Button
                  onClick={onAffiner}
                  size="lg"
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Affiner mon estimation (2 min)
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {onReserver && (
                <Button
                  onClick={onReserver}
                  variant={aides_potentielles.length > 0 ? 'outline' : 'default'}
                  size="lg"
                  className="w-full"
                >
                  {aides_detectees.length > 0 ? 'Réserver avec ces aides' : 'Réserver maintenant'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note légale */}
      <Alert variant="default" className="border-border">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs text-muted-foreground">
          <strong>Estimation indicative.</strong> Les montants affichés sont calculés selon les critères renseignés.
          L'éligibilité définitive dépend de la vérification de vos justificatifs auprès des organismes concernés.
        </AlertDescription>
      </Alert>
    </div>
  );
}
