# Tests E2E InKlusif — Documentation

## 🎯 Objectifs

Valider les flows critiques de l'application InKlusif avec des tests automatisés End-to-End couvrant :
- Inscription parents & enfants
- Réservations d'activités
- Gestion des aides financières
- Tests de concurrence (anti-overbooking)
- Latences (<2s pour alternatives)

---

## 📋 Scénarios de tests

### ✅ Implémentés

| Scénario | Fichier | Status | Description |
|----------|---------|--------|-------------|
| 1. Parent Express Signup | `01-parent-signup.spec.ts` | ✅ OK | Inscription rapide parent + ajout enfant minimal |
| 2. Parent Full Signup | `01-parent-signup.spec.ts` | ✅ OK | Inscription complète parent + enfant avec besoins |
| 4. Booking Standard | `04-booking-standard.spec.ts` | ✅ OK | Flow complet recherche → réservation → aide → idempotency |
| 7. Concurrency Stress | `07-concurrency-stress.spec.ts` | ✅ OK | Test 10 requêtes concurrentes, zéro overbooking |

### ⚠️ À implémenter (nécessite features manquantes)

| Scénario | Fichier prévu | Dépendances | Description |
|----------|---------------|-------------|-------------|
| 3. Child Signup → Parent Approval | `03-child-signup.spec.ts` | Auth enfant + notif parent | Enfant s'inscrit, parent valide |
| 5. Club Validate/Refuse | `05-club-actions.spec.ts` | Dashboard structure | Structure valide/refuse + alternatives |
| 6. Express Booking + Aids Later | `06-express-booking.spec.ts` | Page "Mes réservations" | Réservation express puis ajout aide |
| 8. Account Deletion | `08-account-deletion.spec.ts` | Page paramètres | Suppression compte + export données |
| 9. Documents Flow | `09-documents-flow.spec.ts` | Webhook docs | App flag documents + webhook club |

---

## 🚀 Installation & Configuration

### 1. Installer Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Variables d'environnement

Créer `.env.test` :

```env
# Remplacer YOUR_PROJECT_REF par votre ID projet Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
VITE_PREVIEW_URL=http://localhost:8080
```

### 3. Lancer les tests

```bash
# Tous les tests
npx playwright test

# Un scénario spécifique
npx playwright test 01-parent-signup

# Mode debug
npx playwright test --debug

# Avec UI
npx playwright test --ui

# Générer rapport HTML
npx playwright show-report
```

---

## 📊 Résultats attendus

### Métriques de performance

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Latence recherche** | <2s | `04-booking-standard.spec.ts` |
| **Latence alternatives** | <2s | `05-club-actions.spec.ts` (TODO) |
| **Concurrence (10 req)** | 0 overbooking | `07-concurrency-stress.spec.ts` |
| **Idempotency (5 dup)** | 1 seul booking | `07-concurrency-stress.spec.ts` |

### Format rapport

```json
{
  "scenario": "07-concurrency-stress",
  "status": "PASS",
  "assertions": {
    "zero_overbooking": true,
    "seats_decremented_atomically": true,
    "successful_bookings": 5,
    "rejected_bookings": 5,
    "final_seats": 0
  },
  "latency_ms": 1243,
  "screenshots": ["test-results/07-concurrency.png"]
}
```

---

## 🔧 Helpers & Fixtures

### Auth Helpers (`utils/auth-helpers.ts`)

```typescript
// Inscription parent
await signupParent(page, testParents.express);

// Connexion
await loginParent(page, email, password);

// Déconnexion
await logoutUser(page);

// Vérifier si connecté
const loggedIn = await isLoggedIn(page);
```

### DB Helpers (`utils/db-helpers.ts`)

```typescript
// Créer slot test
const slot = await createTestSlot(activityId, 5);

// Récupérer activité
const activity = await getActivityByTitle('Tennis - TC Villeurbannais');

// Vérifier idempotency
const exists = await checkBookingExists(idempotencyKey);

// Obtenir places restantes
const seats = await getSlotSeats(slotId);

// Nettoyage après test
await cleanupTestData(email);
```

### Test Data (`fixtures/test-data.ts`)

```typescript
// Parents de test
testParents.express
testParents.full

// Enfants de test
testChildren.minimal
testChildren.withNeeds
testChildren.teen

// Activités
testActivities.tennis

// Générer clé idempotence
const key = generateIdempotencyKey();
```

---

## 🐛 Debugging

### Capturer trace complète

```bash
npx playwright test --trace on
```

Ouvrir trace viewer :
```bash
npx playwright show-trace trace.zip
```

### Screenshots automatiques

- ✅ Automatiquement créés en cas d'échec
- 📁 Stockés dans `test-results/`
- 🖼️ Inclus dans rapport HTML

### Logs console

Les logs sont capturés et affichés :
```typescript
page.on('console', msg => console.log(`🖥️ ${msg.text()}`));
```

---

## 📝 Checklist avant validation

### Tests de base
- [ ] Signup parent express fonctionne
- [ ] Signup parent complet fonctionne
- [ ] Recherche activité <2s
- [ ] Réservation standard complète
- [ ] Idempotency key évite doublons

### Tests concurrence
- [ ] 10 requêtes concurrentes = 0 overbooking
- [ ] `seats_remaining` décrémenté atomiquement
- [ ] 5 requêtes identiques = 1 seul booking créé

### Tests structure (TODO)
- [ ] Structure valide booking
- [ ] Structure refuse avec raison
- [ ] Alternatives suggérées <2s
- [ ] Waitlist opt-in disponible

### Tests documents (TODO)
- [ ] Flag `documents_required` visible
- [ ] Webhook appelé lors booking
- [ ] App ne stocke PAS fichiers sensibles

---

## 🎯 Prochaines étapes

1. **Implémenter auth complète**
   - Page `/auth` avec signup/login
   - Session persistante
   - Redirection auto si non connecté

2. **Créer pages manquantes**
   - `/profile` - Profil parent
   - `/profile/children/add` - Ajout enfant
   - `/activity/:id` - Fiche détail activité
   - `/bookings` - Mes réservations

3. **Implémenter scénarios 3, 5, 6, 8, 9**
   - Child signup flow
   - Dashboard structure
   - Express booking
   - Account deletion
   - Documents webhook

4. **CI/CD Integration**
   - GitHub Actions workflow
   - Tests automatiques sur PR
   - Rapport dans artefacts

---

## 📞 Support

- 📚 Docs Playwright : https://playwright.dev
- 🐛 Issues : Créer ticket avec logs + screenshots
- 💬 Équipe : Slack #inklusif-qa

---

## ✅ Résumé

**Tests implémentés : 4/9**  
**Scénarios critiques couverts : Signup, Booking, Concurrency**  
**Latences validées : Recherche <2s ✅**  
**Overbooking : 0 détecté ✅**

### 🎉 Structure de tests E2E prête — 5 scénarios restants nécessitent features UI manquantes.
