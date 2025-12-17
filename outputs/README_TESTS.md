# Smoke Tests - Flooow Connect Auth API

## 📋 Prérequis

1. **Créer un compte test dans Supabase Auth:**
   - Via l'UI Supabase: Authentication > Users > Add User
   - Ou via SQL:
   ```sql
   -- Se connecter à Supabase et exécuter:
   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'test-parent@flooow.local',
     crypt('TestFlooow2025!', gen_salt('bf')),
     now(),
     now(),
     now()
   );
   ```

2. **Installer les dépendances:**
   ```bash
   # jq pour parser JSON
   sudo apt-get install jq  # Debian/Ubuntu
   brew install jq          # macOS
   ```

## 🚀 Lancer les tests

### Option 1: Configuration par défaut

```bash
cd outputs
chmod +x run-smoke-tests.sh
./run-smoke-tests.sh
```

### Option 2: Configuration personnalisée

```bash
# Modifier config.sh avec vos valeurs
nano config.sh

# Ou utiliser des variables d'environnement
TEST_EMAIL="votre@email.com" \
TEST_PASSWORD="VotreMotDePasse" \
./run-smoke-tests.sh
```

### Option 3: Mode verbose

```bash
VERBOSE=true ./run-smoke-tests.sh
```

## 📊 Résultats

Les résultats sont sauvegardés dans:
- `smoke_outputs/smoke_report_results.json` - Rapport complet JSON
- `smoke_outputs/cookies.txt` - Cookies de session (temporaire)

### Exemple de rapport

```json
{
  "timestamp": "2025-10-13T14:00:00Z",
  "base_url": "https://YOUR_PROJECT_REF.supabase.co/functions/v1",
  "tests": [
    {
      "name": "login",
      "status": "PASS",
      "http_code": 200,
      "response": {"success": true, "session_id": "..."}
    }
  ],
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0,
    "success_rate": "100%"
  }
}
```

## 🧪 Tests exécutés

1. **POST /auth-sessions/login**
   - Crée session + cookies
   - Vérifie access_token et refresh_token

2. **GET /auth-sessions/session-info**
   - Récupère info session depuis cookies

3. **POST /auth-sessions/refresh**
   - Rotation du refresh token
   - Vérifie nouveaux cookies

4. **POST /auth-sessions/logout**
   - Révoque session
   - Clear cookies

5. **Verify revoked**
   - Confirme que session est bien révoquée (401)

## 🔧 Troubleshooting

### Erreur: "Login failed - 401"
- Vérifier que le compte test existe dans Supabase Auth
- Vérifier email/password dans `config.sh`

### Erreur: "jq: command not found"
- Installer jq: `brew install jq` ou `apt-get install jq`

### Erreur: "Connection refused"
- Vérifier l'URL dans `config.sh`
- Vérifier que les Edge Functions sont déployées

### Erreur: "Refresh token invalid"
- Normal si vous relancez les tests trop rapidement
- Attendre quelques secondes entre les exécutions

## 📝 Notes de sécurité

⚠️ **IMPORTANT:**
- Ne JAMAIS commiter `config.sh` avec des vraies credentials
- Utiliser des comptes de test uniquement
- Les cookies sont automatiquement nettoyés après les tests

## 🔗 Documentation API

Voir `auth-api-openapi.yaml` pour la documentation complète de l'API.
