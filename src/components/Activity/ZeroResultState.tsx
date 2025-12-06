import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Expand,
  MessageCircle,
  Plus,
  MapPin,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatAgeRangeForCard } from "@/utils/categoryMapping";

interface Activity {
  id: string;
  title: string;
  structures?: {
    name: string;
    address?: string;
  };
  age_min: number;
  age_max: number;
  price_base: number;
  images?: string[];
  is_solidarity_club?: boolean;
}

interface ZeroResultStateProps {
  /**
   * Terme de recherche saisi par l'utilisateur
   */
  searchTerm?: string;

  /**
   * Activités suggérées en alternative (max 3)
   */
  suggestions?: Activity[];

  /**
   * Callback pour réinitialiser tous les filtres
   */
  onReset: () => void;

  /**
   * Callback pour élargir la zone géographique
   */
  onExpandZone?: () => void;

  /**
   * Indique si un filtre géographique est actif
   */
  hasGeoFilter?: boolean;
}

/**
 * Mapping de termes recherchés vers suggestions d'activités similaires
 */
const SUGGESTION_MAPPING: Record<string, string[]> = {
  // Sports collectifs
  'foot': ['rugby', 'basket', 'handball'],
  'football': ['rugby', 'basket', 'handball'],
  'rugby': ['football', 'handball', 'flag'],
  'basket': ['handball', 'volleyball', 'football'],
  'handball': ['basket', 'volleyball', 'football'],

  // Sports individuels
  'natation': ['aquagym', 'water-polo', 'plongeon'],
  'judo': ['karaté', 'aïkido', 'taekwondo'],
  'karate': ['judo', 'aïkido', 'taekwondo'],
  'tennis': ['badminton', 'squash', 'tennis de table'],

  // Musique
  'violon': ['piano', 'guitare', 'flûte'],
  'piano': ['guitare', 'violon', 'batterie'],
  'guitare': ['piano', 'basse', 'ukulélé'],

  // Arts
  'peinture': ['dessin', 'arts plastiques', 'sculpture'],
  'theatre': ['danse', 'cirque', 'expression corporelle'],
  'théâtre': ['danse', 'cirque', 'expression corporelle'],
  'danse': ['théâtre', 'cirque', 'gymnastique'],

  // Autres
  'echecs': ['jeux de société', 'robotique', 'coding'],
  'cuisine': ['pâtisserie', 'arts de la table', 'nutrition']
};

/**
 * Génère un message contextuel selon le type d'activité recherchée
 */
const getSuggestionMessage = (searchTerm: string, suggestions: string[]): string => {
  const term = searchTerm.toLowerCase();

  // Sports collectifs
  if (['foot', 'football', 'rugby', 'basket', 'handball'].includes(term)) {
    return `Pas de ${searchTerm}. Et le ${suggestions[0]} ?`;
  }

  // Musique
  if (['violon', 'piano', 'guitare'].includes(term)) {
    return `Pas de ${searchTerm}. ${suggestions[0]} ou ${suggestions[1]} ?`;
  }

  // Arts
  if (['peinture', 'theatre', 'théâtre', 'danse'].includes(term)) {
    return `Pas de ${searchTerm} ici. ${suggestions[0]} ou ${suggestions[1]} ?`;
  }

  // Défaut
  return `Pas de ${searchTerm}. On propose autre chose ?`;
};

/**
 * Composant d'état zéro résultat avec suggestions intelligentes
 *
 * Affiche un message rassurant + suggestions d'activités alternatives
 * + actions pour réinitialiser, élargir la zone ou contacter le support.
 */
export function ZeroResultState({
  searchTerm,
  suggestions = [],
  onReset,
  onExpandZone,
  hasGeoFilter = false
}: ZeroResultStateProps) {
  const navigate = useNavigate();

  const hasSuggestions = suggestions.length > 0;
  const suggestedTerms = searchTerm ? SUGGESTION_MAPPING[searchTerm.toLowerCase()] : undefined;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Message principal zéro résultat */}
      <div className="text-center space-y-2">
        <p className="text-lg text-gray-700 font-medium">
          {searchTerm ? `Pas de ${searchTerm} ici.` : "Aucun résultat."}
        </p>
        <p className="text-sm text-gray-600">
          On propose autre chose ?
        </p>
      </div>

      {/* Section suggestions */}
      {hasSuggestions && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              💡 On vous propose
            </span>
          </div>

          {/* Message contextuel */}
          {searchTerm && suggestedTerms && (
            <p className="text-sm text-gray-600 -mt-2">
              {getSuggestionMessage(searchTerm, suggestedTerms)}
            </p>
          )}

          {/* Cartes suggestions */}
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((activity) => (
              <Card
                key={activity.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/activity/${activity.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      {activity.images?.[0] ? (
                        <img
                          src={activity.images[0]}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-foreground line-clamp-1">
                          {activity.title}
                        </h3>
                        {activity.is_solidarity_club && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs whitespace-nowrap">
                            🤝 Club Solidaire
                          </Badge>
                        )}
                      </div>

                      {activity.structures?.name && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {activity.structures.name}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        {activity.structures?.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">{activity.structures.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{formatAgeRangeForCard(activity.age_min, activity.age_max)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-sm">
                          <span className="font-medium text-foreground">{activity.price_base}€</span>
                          <span className="text-xs text-gray-500 italic ml-1.5">
                            Prix indicatif - Test
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary hover:bg-primary/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/activity/${activity.id}`);
                          }}
                        >
                          Voir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions secondaires */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </Button>

        {hasGeoFilter && onExpandZone && (
          <Button
            variant="outline"
            onClick={onExpandZone}
            className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Expand className="w-4 h-4" />
            Élargir la zone
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={() => navigate('/activities')}
        >
          Voir toutes les activités
        </Button>
      </div>

      {/* Fallback ultime - si vraiment aucune suggestion */}
      {!hasSuggestions && (
        <div className="text-center space-y-4 pt-4 border-t">
          <p className="text-sm text-gray-600">Toujours rien ? On vous aide.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/contact')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/suggerer-activite')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Proposer cette activité
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
