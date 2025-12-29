/**
 * Utilitaires pour partager des événements
 */

import { safeErrorMessage } from '@/utils/sanitize';
import { safeOpenMailto } from '@/lib/safeNavigation';

export interface EventShareData {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  location?: string;
}

/**
 * Génère l'URL complète de l'événement
 */
export const getEventUrl = (eventId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/agenda-community?event=${eventId}`;
};

/**
 * Génère le texte de partage pour un événement
 */
export const getShareText = (event: EventShareData): string => {
  const date = new Date(event.startDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  let text = `📅 ${event.title}\n\n`;
  text += `🗓️ ${date}\n`;
  if (event.location) {
    text += `📍 ${event.location}\n`;
  }
  if (event.description) {
    text += `\n${event.description.slice(0, 150)}${event.description.length > 150 ? '...' : ''}`;
  }
  
  return text;
};

/**
 * Partage sur Facebook
 */
export const shareOnFacebook = (event: EventShareData): void => {
  const url = getEventUrl(event.id);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur Twitter/X
 */
export const shareOnTwitter = (event: EventShareData): void => {
  const url = getEventUrl(event.id);
  const text = getShareText(event);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur LinkedIn
 */
export const shareOnLinkedIn = (event: EventShareData): void => {
  const url = getEventUrl(event.id);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur WhatsApp
 */
export const shareOnWhatsApp = (event: EventShareData): void => {
  const url = getEventUrl(event.id);
  const text = getShareText(event);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Partage par email
 */
export const shareByEmail = (event: EventShareData): void => {
  const url = getEventUrl(event.id);
  const subject = `Événement : ${event.title}`;
  const body = getShareText(event) + `\n\nPour plus d'informations : ${url}`;

  safeOpenMailto({ subject, body });
};

/**
 * Copie le lien dans le presse-papier
 */
export const copyEventLink = async (event: EventShareData): Promise<boolean> => {
  const url = getEventUrl(event.id);
  
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error(safeErrorMessage(err, 'Failed to copy link'));
    return false;
  }
};

/**
 * Utilise l'API Web Share si disponible
 */
export const shareWithWebAPI = async (event: EventShareData): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: event.title,
      text: getShareText(event),
      url: getEventUrl(event.id),
    });
    return true;
  } catch (err) {
    // L'utilisateur a annulé ou erreur
    console.log('Share cancelled or failed:', err);
    return false;
  }
};
