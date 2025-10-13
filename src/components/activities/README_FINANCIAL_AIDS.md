# 💰 Guide d'intégration - Calcul des Aides Financières

## ✅ Intégration complète réalisée

### 1️⃣ Base de données (Supabase)

**Table `financial_aids`** ✓
- 8 aides financières insérées
- Index GIN sur `territory_codes` et `categories`
- RLS activé

**Fonction RPC `calculate_eligible_aids`** ✓
- Filtre par âge, QF, territoire, catégorie
- Calcul montant fixe ou par jour
- Ordre par proximité territoriale

**Fonction helper `calculate_age`** ✓
- Calcule l'âge depuis date de naissance
- Sécurisée avec `SET search_path = public`

### 2️⃣ Frontend (React)

**Composant `FinancialAidsCalculator.tsx`** ✓
- Chemin: `src/components/activities/FinancialAidsCalculator.tsx`
- Appel RPC Supabase automatique
- Affichage badges territoire (🇫🇷 🌍 🏙️ 🏘️)
- Calcul récapitulatif et badge économie

**Page `ActivityDetail.tsx`** ✓
- Sélection enfant (avec validation âge)
- Fetch profil utilisateur
- Calcul durée activité
- Intégration conditionnelle du calculateur

---

## 🧪 Test du système

### Prérequis utilisateur

L'utilisateur doit avoir dans `profiles.profile_json`:

```json
{
  "quotient_familial": 400,
  "city_code": "42218"
}
```

**Pour tester sans données:**

```sql
-- Mettre à jour le profil d'un utilisateur de test
UPDATE profiles
SET profile_json = jsonb_build_object(
  'quotient_familial', 400,
  'city_code', '42218'
)
WHERE email = 'votre-email@test.com';
```

### Scénario de test

**Activité:** Sport à Saint-Étienne, 180€, enfant 8 ans  
**Profil:** QF 400, code commune 42218

**Aides attendues:**
1. ✅ Pass'Sport (50€, national, QF<1200)
2. ✅ Carte M'RA (21€, métropole, code match)
3. ❌ CCAS St-Étienne (QF 400 > 300, exclu)
4. ✅ Chèques Vacances (50€, national, pas de QF)

**Résultat:**
- Total aides: 121€
- Reste à charge: 59€
- Économie: 67% → Badge "🎉 Économie de 67% !"

---

## 📝 Données de référence

### Codes territoire

| Territoire | Code | Type |
|------------|------|------|
| National | `FR` | national |
| AURA | `84` | region |
| Loire | `42` | department |
| Métropole St-Étienne | `200071108` | metropole |
| Commune St-Étienne | `42218` | commune |
| Commune Firminy | `42095` | commune |
| Commune La Ricamarie | `42184` | commune |

### Catégories activités

- `sport`
- `culture`
- `loisirs`
- `vacances`

---

## 🔧 Maintenance

### Ajouter une nouvelle aide

```sql
INSERT INTO financial_aids 
(name, slug, age_min, age_max, amount_type, amount_value, qf_max, territory_level, territory_codes, categories, cumulative, official_link, active)
VALUES
('Nouvelle Aide', 'nouvelle-aide', 6, 17, 'fixed', 30, 500, 'commune', ARRAY['42218'], ARRAY['sport', 'culture'], true, 'https://exemple.fr', true);
```

### Désactiver une aide

```sql
UPDATE financial_aids SET active = false WHERE slug = 'aide-a-desactiver';
```

### Tester la fonction RPC manuellement

```javascript
const { data, error } = await supabase.rpc('calculate_eligible_aids', {
  p_age: 8,
  p_qf: 400,
  p_city_code: '42218',
  p_activity_price: 180,
  p_duration_days: 1,
  p_categories: ['sport']
});
console.log(data);
```

---

## ⚠️ Points d'attention

1. **Prix = 0** : Le composant n'affiche rien si `activityPrice <= 0`
2. **Données manquantes** : Si `profile_json` est vide, QF et city_code = 0/''
3. **Authentification** : Le calculateur ne s'affiche que si utilisateur connecté
4. **Sélection enfant** : Obligatoire pour calculer l'âge

---

## 🚀 Évolutions possibles

- [ ] Géolocalisation automatique pour city_code
- [ ] Formulaire de mise à jour QF dans profil
- [ ] Export PDF récapitulatif des aides
- [ ] Notifications expiration aides (Pass'Sport annuel)
- [ ] Historique aides utilisées par enfant
