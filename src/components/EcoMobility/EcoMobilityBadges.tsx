/**
 * EcoMobilityBadges - Gamification component for eco-mobility achievements
 *
 * Shows progress towards eco-mobility milestones and earned badges.
 * Uses localStorage for demo persistence until eco_travel_logs table is created.
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Leaf, Footprints, Bike, Award, Sparkles } from "lucide-react";

// Milestone definitions
export const ECO_MILESTONES = [
  {
    id: "first_trip",
    name: "Premier pas",
    description: "Premier trajet éco-responsable validé",
    icon: "🌱",
    requiredTrips: 1,
    requiredCo2Kg: 0,
  },
  {
    id: "eco_citizen",
    name: "Éco-citoyen",
    description: "5 trajets éco-responsables",
    icon: "🚶",
    requiredTrips: 5,
    requiredCo2Kg: 0,
  },
  {
    id: "green_champion",
    name: "Champion vert",
    description: "10 trajets éco-responsables",
    icon: "🚴",
    requiredTrips: 10,
    requiredCo2Kg: 0,
  },
  {
    id: "climate_hero",
    name: "Héros du climat",
    description: "20 trajets ou 10 kg de CO₂ évités",
    icon: "🏆",
    requiredTrips: 20,
    requiredCo2Kg: 10,
  },
  {
    id: "green_legend",
    name: "Légende verte",
    description: "50 trajets ou 25 kg de CO₂ évités",
    icon: "🌍",
    requiredTrips: 50,
    requiredCo2Kg: 25,
  },
];

export interface EcoStats {
  totalTrips: number;
  totalCo2SavedKg: number;
  tripsByMode: {
    walk: number;
    bike: number;
    bus: number;
  };
}

interface EcoMobilityBadgesProps {
  stats?: EcoStats;
  compact?: boolean;
  showProgress?: boolean;
}

// Get earned badges based on stats
export const getEarnedBadges = (stats: EcoStats) => {
  return ECO_MILESTONES.filter((milestone) => {
    const meetsTrips = stats.totalTrips >= milestone.requiredTrips;
    const meetsCo2 =
      milestone.requiredCo2Kg > 0 && stats.totalCo2SavedKg >= milestone.requiredCo2Kg;
    return meetsTrips || meetsCo2;
  });
};

// Get next milestone to achieve
export const getNextMilestone = (stats: EcoStats) => {
  const earned = getEarnedBadges(stats);
  const earnedIds = new Set(earned.map((b) => b.id));
  return ECO_MILESTONES.find((m) => !earnedIds.has(m.id));
};

// Calculate progress towards next milestone
export const getMilestoneProgress = (stats: EcoStats) => {
  const nextMilestone = getNextMilestone(stats);
  if (!nextMilestone) return 100;

  const tripsProgress = (stats.totalTrips / nextMilestone.requiredTrips) * 100;
  const co2Progress =
    nextMilestone.requiredCo2Kg > 0
      ? (stats.totalCo2SavedKg / nextMilestone.requiredCo2Kg) * 100
      : 0;

  return Math.min(100, Math.max(tripsProgress, co2Progress));
};

// Local storage key for demo stats (until table is created)
const STORAGE_KEY = "flooow_eco_stats";

// Get stats from localStorage (demo mode)
export const getLocalEcoStats = (): EcoStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading eco stats:", e);
  }
  return {
    totalTrips: 0,
    totalCo2SavedKg: 0,
    tripsByMode: { walk: 0, bike: 0, bus: 0 },
  };
};

// Save trip to localStorage (demo mode)
export const logLocalTrip = (
  mode: "walk" | "bike" | "bus",
  co2SavedGrams: number
): EcoStats => {
  const stats = getLocalEcoStats();
  stats.totalTrips += 1;
  stats.totalCo2SavedKg += co2SavedGrams / 1000;
  stats.tripsByMode[mode] = (stats.tripsByMode[mode] || 0) + 1;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
};

export const EcoMobilityBadges = ({
  stats,
  compact = false,
  showProgress = true,
}: EcoMobilityBadgesProps) => {
  const [currentStats, setCurrentStats] = useState<EcoStats>(
    stats || getLocalEcoStats()
  );

  useEffect(() => {
    if (stats) {
      setCurrentStats(stats);
    }
  }, [stats]);

  const earnedBadges = getEarnedBadges(currentStats);
  const nextMilestone = getNextMilestone(currentStats);
  const progress = getMilestoneProgress(currentStats);

  if (compact) {
    // Compact mode: just show badges earned
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {earnedBadges.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            Validez votre premier trajet pour débloquer des badges !
          </span>
        ) : (
          earnedBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              className="text-sm gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              <span>{badge.icon}</span>
              <span>{badge.name}</span>
            </Badge>
          ))
        )}
      </div>
    );
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardContent className="p-4 space-y-4">
        {/* Header with total stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-green-500/20">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Vos éco-trajets</h3>
              <p className="text-xs text-muted-foreground">
                {currentStats.totalTrips} trajets •{" "}
                {currentStats.totalCo2SavedKg.toFixed(1)} kg CO₂ évités
              </p>
            </div>
          </div>
          {earnedBadges.length > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{earnedBadges.length}</span>
            </div>
          )}
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress to next milestone */}
        {showProgress && nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Prochain badge : {nextMilestone.icon} {nextMilestone.name}
              </span>
              <span className="font-medium text-green-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-muted-foreground">
              {nextMilestone.description}
            </p>
          </div>
        )}

        {/* All badges unlocked! */}
        {!nextMilestone && currentStats.totalTrips > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-700">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Félicitations ! Tous les badges débloqués !
            </span>
          </div>
        )}

        {/* Mode breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <Footprints className="w-4 h-4" />
              <span className="text-sm font-bold">
                {currentStats.tripsByMode.walk || 0}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Marche</p>
          </div>
          <div className="text-center border-x border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center gap-1 text-emerald-600">
              <Bike className="w-4 h-4" />
              <span className="text-sm font-bold">
                {currentStats.tripsByMode.bike || 0}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Vélo</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Award className="w-4 h-4" />
              <span className="text-sm font-bold">
                {currentStats.tripsByMode.bus || 0}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Bus</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
