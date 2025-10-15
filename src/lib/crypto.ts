// Utilitaires simples de chiffrement pour le front-end
// Utilise Web Crypto API : PBKDF2 pour dériver une clé depuis un mot de passe/secret,
// et AES-GCM pour chiffrer/déchiffrer des chaînes.

// Note : pour des données sensibles (emails, numéros) il vaut mieux chiffrer côté serveur
// où la clé est détenue de manière sécurisée. Ici c'est utile pour chiffrer localement
// avant stockage local ou envoi chiffré.

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(b64: string) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

async function deriveKey(password: string, salt: ArrayBuffer, iterations = 100000) {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, [
    'deriveKey',
  ]);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    } as Pbkdf2Params,
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

export async function encryptString(plain: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt.buffer);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plain)
  );

  return {
    salt: toBase64(salt.buffer),
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(ciphertext),
  };
}

export async function decryptString(payload: { salt: string; iv: string; ciphertext: string }, password: string) {
  const saltBuf = new Uint8Array(fromBase64(payload.salt));
  const ivBuf = new Uint8Array(fromBase64(payload.iv));
  const ct = fromBase64(payload.ciphertext);
  const key = await deriveKey(password, saltBuf.buffer);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, key, ct);
  return dec.decode(plainBuf);
}

export function makeSecretFromUser(userSecret: string) {
  // Petite fonction utilitaire pour créer un "mot de passe" de chiffrement
  // à partir d'un secret utilisateur (par ex. combine user id + app salt).
  return `flooow:${userSecret}`;
}
