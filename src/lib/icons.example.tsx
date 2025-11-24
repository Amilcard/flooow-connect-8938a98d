/**
 * 📚 GUIDE D'UTILISATION - Bibliothèque d'icônes centralisée
 *
 * ✅ RECOMMANDÉ - Utiliser la bibliothèque centralisée:
 * import { Calendar, MapPin, Users } from '@/lib/icons';
 *
 * ❌ ANCIENNE MÉTHODE (encore fonctionnelle mais déconseillée):
 * import { Calendar, MapPin, Users } from 'lucide-react';
 *
 * 🎯 AVANTAGES:
 * - Source unique de vérité pour toutes les icônes
 * - Découverte facile des icônes disponibles (auto-complétion)
 * - Cohérence garantie dans toute l'application
 * - Tree-shaking optimisé (seules les icônes utilisées sont bundlées)
 *
 * 📝 EXEMPLE D'UTILISATION:
 */

import { Calendar, MapPin, Users, CheckCircle2 } from '@/lib/icons';

export function ExampleComponent() {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-primary" />
      <MapPin className="w-5 h-5 text-muted-foreground" />
      <Users className="w-5 h-5 text-foreground" />
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    </div>
  );
}

/**
 * 🔄 MIGRATION PROGRESSIVE:
 *
 * Les anciens imports depuis 'lucide-react' continueront de fonctionner.
 * La migration vers '@/lib/icons' peut se faire progressivement.
 *
 * Pour migrer un fichier:
 * 1. Remplacer: from 'lucide-react'
 * 2. Par:        from '@/lib/icons'
 * 3. Vérifier que le build fonctionne
 * 4. Commit!
 */
