# Messages & Bons Plans - Documentation

## Vue d'ensemble

Cette fonctionnalité permet aux familles et aux jeunes d'échanger avec les structures et de consulter des informations vérifiées directement depuis la page d'accueil.

## Architecture actuelle

### Composants créés

1. **MessagesSection.tsx**
   - Affiche la liste des conversations par activité
   - Vue détaillée d'une conversation avec fil de messages
   - Navigation simple : liste → conversation → retour
   - Interface disabled pour l'instant (données mockées)

2. **BonsPlansSection.tsx**
   - Deux onglets : "Pour les jeunes" et "Pour les familles"
   - Affichage des bons plans vérifiés (emplois, stages, ateliers, etc.)
   - Badge "Vérifié" pour rassurer les utilisateurs
   - Liens externes vers les sources officielles

### Intégration

Les deux sections sont intégrées dans `src/pages/Index.tsx` :
- Affichées uniquement pour les utilisateurs connectés
- Positionnées après la section "Événements" et avant "Sport & Bien-être"
- Aucune nouvelle route créée, tout reste sur la page d'accueil

## Données mockées actuelles

### Conversations (MessagesSection)
```typescript
interface Conversation {
  id: string;
  activityName: string;      // Ex: "Club de basket"
  activityType: string;       // Ex: "Sport", "Culture"
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isFromClub: boolean;        // Pour différencier visuellement
}
```

### Bons Plans (BonsPlansSection)
```typescript
interface BonPlan {
  id: string;
  title: string;
  description: string;
  category: "jeunes" | "familles";
  type: string;              // "Emploi", "Concours", "Stage", "Aide", etc.
  date?: string;
  link?: string;
  verified: boolean;         // Pour afficher le badge "Vérifié"
}
```

## TODO : Migration vers Heartbeat ou système de forum

### Prochaines étapes recommandées

1. **Création des tables Supabase**
   ```sql
   -- Table des conversations
   CREATE TABLE conversations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     activity_id UUID REFERENCES activities(id),
     last_message_at TIMESTAMP,
     unread_count INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Table des messages
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     conversation_id UUID REFERENCES conversations(id),
     sender_id UUID REFERENCES auth.users(id),
     content TEXT NOT NULL,
     is_from_structure BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Table des bons plans
   CREATE TABLE bons_plans (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     description TEXT,
     category TEXT CHECK (category IN ('jeunes', 'familles')),
     type TEXT,
     date_info TEXT,
     link TEXT,
     verified BOOLEAN DEFAULT false,
     territory_id UUID REFERENCES territories(id),
     published_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Activer Realtime pour les messages**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```

3. **Remplacer les hooks mockés**
   - Créer `useConversations()` → fetch conversations réelles
   - Créer `useMessages(conversationId)` → fetch messages + realtime
   - Créer `useBonsPlans(category)` → fetch bons plans vérifiés

4. **Intégration Heartbeat (optionnelle)**
   - Si vous souhaitez utiliser Heartbeat pour la messagerie :
     - Configurer les webhooks Heartbeat → Supabase
     - Mapper les events Heartbeat vers vos tables
     - Adapter l'UI pour consommer l'API Heartbeat
   - Documentation : [Heartbeat API docs]

5. **Modération et vérification**
   - Ajouter un dashboard admin pour valider les bons plans
   - Mettre en place des règles RLS pour sécuriser les conversations
   - Prévoir un système de signalement de messages inappropriés

## Principes UX maintenus

✅ **Simplicité** : Interface claire, peu d'actions (lire, répondre, retour)
✅ **Sécurité** : Tous les bons plans sont vérifiés avant publication
✅ **Bienveillance** : Ton sérieux et rassurant, pas de "réseau social" infini
✅ **Accessibilité** : Utilisable par des ados et des parents peu à l'aise avec le numérique

## Notes de développement

- Les composants sont déjà prêts pour recevoir de vraies données via props
- La logique d'affichage (UI) est séparée des données (facile à connecter à une API)
- Les styles utilisent les tokens du design system (pas de couleurs en dur)
- Tout est responsive et accessible

## Contact technique

Pour toute question sur l'implémentation future, se référer à ce document ou contacter l'équipe technique Flooow.
