/**
 * Banniere de consentement analytics (RGPD)
 * Affichee en bas de l'ecran, permet d'accepter ou refuser le tracking
 */

import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConsentBannerProps {
  onAccept: () => void;
  onDeny: () => void;
}

function BannerHeader() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-purple-100 px-4 py-3 flex items-center gap-3">
      <Cookie className="w-5 h-5 text-primary" />
      <span className="font-semibold text-gray-900">Votre vie privee compte</span>
    </div>
  );
}

function BannerLinks() {
  return (
    <div className="flex gap-4 text-xs text-gray-500 mb-4">
      <Link to="/legal/privacy" className="underline hover:text-primary">
        Politique de confidentialite
      </Link>
      <Link to="/legal/cookies" className="underline hover:text-primary">
        Gestion des cookies
      </Link>
    </div>
  );
}

interface BannerActionsProps {
  onAccept: () => void;
  onDeny: () => void;
}

function BannerActions({ onAccept, onDeny }: BannerActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onDeny}
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        <X className="w-4 h-4" />
        Refuser
      </button>
      <button
        type="button"
        onClick={onAccept}
        className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
      >
        Accepter
      </button>
    </div>
  );
}

function BannerContent({ onAccept, onDeny }: ConsentBannerProps) {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-4">
        Nous utilisons des cookies analytiques pour comprendre comment vous
        utilisez Flooow et ameliorer votre experience. Aucune donnee personnelle
        {"n'est partagee avec des tiers publicitaires."}
      </p>
      <BannerLinks />
      <BannerActions onAccept={onAccept} onDeny={onDeny} />
    </div>
  );
}

export function ConsentBanner({ onAccept, onDeny }: ConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <BannerHeader />
        <BannerContent onAccept={onAccept} onDeny={onDeny} />
      </div>
    </div>
  );
}
