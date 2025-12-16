/**
 * Utilitaires pour partager des activités
 */

import { safeErrorMessage } from '@/utils/sanitize';

export interface ActivityShareData {
  id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  location?: string;
}

/**
 * Génère l'URL complète de l'activité
 */
export const getActivityUrl = (activityId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/activity/${activityId}`;
};

/**
 * Génère le texte de partage pour une activité
 */
export const getShareText = (activity: ActivityShareData): string => {
  let text = `🎯 ${activity.title}\n\n`;
  text += `📂 Catégorie: ${activity.category}\n`;
  if (activity.price !== undefined && activity.price > 0) {
    text += `💶 À partir de ${activity.price}€\n`;
  }
  if (activity.location) {
    text += `📍 ${activity.location}\n`;
  }
  if (activity.description) {
    text += `\n${activity.description.slice(0, 150)}${activity.description.length > 150 ? '...' : ''}`;
  }
  
  return text;
};

/**
 * Partage sur Facebook
 */
export const shareOnFacebook = (activity: ActivityShareData): void => {
  const url = getActivityUrl(activity.id);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur Twitter/X
 */
export const shareOnTwitter = (activity: ActivityShareData): void => {
  const url = getActivityUrl(activity.id);
  const text = getShareText(activity);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur LinkedIn
 */
export const shareOnLinkedIn = (activity: ActivityShareData): void => {
  const url = getActivityUrl(activity.id);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
};

/**
 * Partage sur WhatsApp
 */
export const shareOnWhatsApp = (activity: ActivityShareData): void => {
  const url = getActivityUrl(activity.id);
  const text = getShareText(activity);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Partage par email
 */
export const shareByEmail = (activity: ActivityShareData): void => {
  const url = getActivityUrl(activity.id);
  const subject = `Activité : ${activity.title}`;
  const body = getShareText(activity) + `\n\nPour plus d'informations : ${url}`;
  
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
};

/**
 * Copie le lien dans le presse-papier
 */
export const copyActivityLink = async (activity: ActivityShareData): Promise<boolean> => {
  const url = getActivityUrl(activity.id);
  
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
export const shareWithWebAPI = async (activity: ActivityShareData): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: activity.title,
      text: getShareText(activity),
      url: getActivityUrl(activity.id),
    });
    return true;
  } catch (err) {
    // L'utilisateur a annulé ou erreur
    console.log('Share cancelled or failed:', err);
    return false;
  }
};
