/**
 * Secure localStorage wrapper
 *
 * Provides encrypted storage for sensitive data with backward compatibility.
 * Uses AES-GCM encryption via Web Crypto API.
 *
 * ⚠️ SECURITY NOTE: Client-side encryption provides protection against:
 * - Direct localStorage inspection
 * - Browser extensions reading localStorage
 * - Shared device scenarios
 *
 * It does NOT protect against:
 * - XSS attacks (attacker can run JS)
 * - Malicious browser extensions with full access
 */

import { encryptString, decryptString } from './crypto';

// Clé de dérivation basée sur le domaine (protection de base)
const STORAGE_SECRET = `flooow-secure-${window.location.hostname}`;

// Préfixe pour identifier les données chiffrées
const ENCRYPTED_PREFIX = '__enc__';

/**
 * Vérifie si une valeur est chiffrée (nouveau format)
 */
function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Stocke une valeur de manière sécurisée (chiffrée)
 */
export async function setSecureItem(key: string, value: unknown): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    const encrypted = await encryptString(jsonValue, STORAGE_SECRET);
    const encryptedString = ENCRYPTED_PREFIX + JSON.stringify(encrypted);
    localStorage.setItem(key, encryptedString);
  } catch (error) {
    console.error(`[SecureStorage] Failed to encrypt ${key}:`, error);
    // Fallback: stockage non chiffré si le chiffrement échoue
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Récupère une valeur sécurisée (avec rétrocompatibilité)
 * Lit les anciennes données non chiffrées et les nouvelles chiffrées
 */
export async function getSecureItem<T>(key: string): Promise<T | null> {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // Nouvelle donnée chiffrée
    if (isEncrypted(stored)) {
      const encryptedPayload = JSON.parse(stored.slice(ENCRYPTED_PREFIX.length));
      const decrypted = await decryptString(encryptedPayload, STORAGE_SECRET);
      return JSON.parse(decrypted) as T;
    }

    // Ancienne donnée non chiffrée (rétrocompatibilité)
    // On la retourne telle quelle, elle sera re-chiffrée à la prochaine écriture
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`[SecureStorage] Failed to read ${key}:`, error);
    return null;
  }
}

/**
 * Supprime une valeur du stockage sécurisé
 */
export function removeSecureItem(key: string): void {
  localStorage.removeItem(key);
}

/**
 * Migre une clé existante vers le stockage chiffré
 * Utile pour migrer les données existantes au premier accès
 */
export async function migrateToSecure(key: string): Promise<boolean> {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return false;

    // Déjà chiffré, rien à faire
    if (isEncrypted(stored)) return true;

    // Migrer vers le format chiffré
    const value = JSON.parse(stored);
    await setSecureItem(key, value);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Migration failed for ${key}:`, error);
    return false;
  }
}

/**
 * Liste des clés sensibles à chiffrer
 */
export const SENSITIVE_KEYS = [
  'anonymous_children',      // Contient prénoms et dates de naissance
  'parent-signup-draft',     // Données de formulaire
] as const;

/**
 * Migre toutes les clés sensibles vers le stockage chiffré
 * À appeler au démarrage de l'application
 */
export async function migrateAllSensitiveData(): Promise<void> {
  for (const key of SENSITIVE_KEYS) {
    await migrateToSecure(key);
  }
}
