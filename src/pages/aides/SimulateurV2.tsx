/**
 * SIMULATEUR V2 - ESTIMATION PROGRESSIVE
 * 3 modes : Ultra-rapide (30s) → Rapide (2min) → Complète (5min)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
import { QuickEstimateForm } from '@/components/aids/QuickEstimateForm';
import { QuickEstimateCard } from '@/components/aids/QuickEstimateCard';
import { FastEstimateForm } from '@/components/aids/FastEstimateForm';
import {
  calculateQuickEstimate,
  calculateFastEstimate,
  calculateAllEligibleAids,
  QuickEstimateParams,
  FastEstimateParams,
  EstimateResult,
  EligibilityParams,
  CalculatedAid,
} from '@/utils/FinancialAidEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ChevronRight } from 'lucide-react';
import { FormattedText } from '@/components/ui/formatted-text';

type EstimationMode = 'quick' | 'fast' | 'complete';

// Helper: get step indicator state classes
const getStepClasses = (
  stepMode: EstimationMode,
  currentMode: EstimationMode,
  hasResult: boolean
): { containerClass: string; badgeClass: string; content: string } => {
  const isActive = currentMode === stepMode;
  const isCompleted = hasResult && !isActive;

  const containerClass = isActive
    ? 'text-primary font-medium'
    : 'text-muted-foreground';

  let badgeClass = 'bg-muted text-muted-foreground';
  if (isActive) {
    badgeClass = 'bg-primary text-white';
  } else if (isCompleted) {
    badgeClass = 'bg-green-500 text-white';
  }

  const stepNumber = stepMode === 'quick' ? '1' : stepMode === 'fast' ? '2' : '3';
  const content = isCompleted ? '✓' : stepNumber;

  return { containerClass, badgeClass, content };
};

const SimulateurV2 = () => {
  const navigate = useNavigate();

  // Mode d'estimation actuel
  const [mode, setMode] = useState<EstimationMode>('quick');

  // Paramètres sauvegardés pour navigation entre modes
  const [quickParams, setQuickParams] = useState<QuickEstimateParams | null>(null);
  const [fastParams, setFastParams] = useState<FastEstimateParams | null>(null);

  // Résultats
  const [quickResult, setQuickResult] = useState<EstimateResult | null>(null);
  const [fastResult, setFastResult] = useState<EstimateResult | null>(null);
  const [completeResult, setCompleteResult] = useState<CalculatedAid[] | null>(null);

  // Handler Mode 1 : Estimation ultra-rapide
  const handleQuickEstimate = (params: QuickEstimateParams) => {
    setQuickParams(params);
    const result = calculateQuickEstimate(params);
    setQuickResult(result);
  };

  // Handler Mode 2 : Estimation rapide (affinage)
  const handleFastEstimate = (params: FastEstimateParams) => {
    setFastParams(params);
    const result = calculateFastEstimate(params);
    setFastResult(result);
  };

  // Passer au mode affinage (Quick → Fast)
  const handleAffiner = () => {
    setMode('fast');
  };

  // Retour au mode quick
  const handleBack = () => {
    setMode('quick');
    setFastResult(null);
  };

  // Reset simulation
  const handleReset = () => {
    setMode('quick');
    setQuickParams(null);
    setFastParams(null);
    setQuickResult(null);
    setFastResult(null);
    setCompleteResult(null);
  };

  return (
    <PageLayout>
      <div className="container max-w-2xl px-4 py-6 space-y-6 pb-24">
        <BackButton positioning="relative" size="sm" showText={true} label="Retour" fallback="/aides" />

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Estimez vos aides
              </h1>
              <p className="text-base text-muted-foreground">
                30 secondes. Gratuit. Sans engagement.
              </p>
            </div>
            <Badge className="bg-orange-500 text-white text-xs px-3 py-1.5 border-0 whitespace-nowrap">
              Stop au non-recours !
            </Badge>
          </div>

          {/* Breadcrumb des étapes - using helper to reduce cognitive complexity */}
          <div className="flex items-center gap-2 text-sm">
            {(['quick', 'fast', 'complete'] as const).map((stepMode, index) => {
              const hasResult = stepMode === 'quick' ? !!quickResult
                : stepMode === 'fast' ? !!fastResult
                : !!completeResult;
              const step = getStepClasses(stepMode, mode, hasResult);
              const labels = { quick: 'Rapide', fast: 'Affinage', complete: 'Complète' };

              return (
                <div key={stepMode} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <div className={`flex items-center gap-2 ${step.containerClass}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.badgeClass}`}>
                      {step.content}
                    </div>
                    <span className="hidden sm:inline">{labels[stepMode]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODE 1 : ULTRA-RAPIDE */}
        {mode === 'quick' && !quickResult && (
          <QuickEstimateForm onSubmit={handleQuickEstimate} defaultPrice={60} />
        )}

        {mode === 'quick' && quickResult && (
          <QuickEstimateCard
            result={quickResult}
            onAffiner={handleAffiner}
            onReserver={() => navigate('/activities')}
            showActions={true}
          />
        )}

        {/* MODE 2 : RAPIDE (AFFINAGE) */}
        {mode === 'fast' && !fastResult && quickParams && (
          <FastEstimateForm
            quickParams={quickParams}
            onSubmit={handleFastEstimate}
            onBack={handleBack}
          />
        )}

        {mode === 'fast' && fastResult && (
          <div className="space-y-4">
            {/* Résultats détaillés du Mode 2 */}
            <Card className="border-2 border-green-200">
              <CardContent className="p-6 space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-green-600">
                    {Math.round(fastResult.montant_min)}€
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">d'aides confirmées</p>
                </div>

                {/* Liste des aides détectées */}
                {fastResult.aides_detectees.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Aides disponibles :</p>
                    {fastResult.aides_detectees.map((aide) => (
                      <div
                        key={aide.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
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
                {fastResult.message_incitation && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900">
                      <FormattedText>{fastResult.message_incitation}</FormattedText>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => navigate('/activities')} size="lg" className="w-full">
                    Voir les activités
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Nouvelle estimation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Note légale */}
        <Alert variant="default" className="border-border">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs text-muted-foreground">
            <strong>Estimation indicative.</strong> Les montants affichés sont calculés selon les
            critères renseignés. L'éligibilité définitive dépend de la vérification de vos
            justificatifs auprès des organismes concernés.
          </AlertDescription>
        </Alert>

        {/* Bouton reset si on a des résultats */}
        {(quickResult || fastResult) && (
          <div className="text-center">
            <Button onClick={handleReset} variant="ghost" size="sm" className="text-sm">
              ← Recommencer une nouvelle estimation
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SimulateurV2;
