/**
 * Modal ParentGate - Demande si l'utilisateur est un parent (18+) ou un mineur
 * Bloque le tracking Clarity pour les mineurs (COPPA/RGPD compliance)
 */

import { Shield, User, Users } from 'lucide-react';
import { UserType } from '@/hooks/useParentGate';

interface ParentGateModalProps {
  onSelect: (type: UserType) => void;
}

export function ParentGateModal({ onSelect }: ParentGateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Qui utilise Flooow ?
        </h2>

        <p className="text-sm text-gray-600 text-center mb-6">
          Pour vous offrir la meilleure experience et respecter votre vie privee,
          merci de nous indiquer votre profil.
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Parent/Adult option */}
          <button
            onClick={() => onSelect('adult')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-gray-900">
                Je suis parent ou responsable legal
              </div>
              <div className="text-sm text-gray-500">
                J'ai 18 ans ou plus
              </div>
            </div>
          </button>

          {/* Minor option */}
          <button
            onClick={() => onSelect('minor')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
          >
            <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-gray-900">
                Je suis un enfant ou adolescent
              </div>
              <div className="text-sm text-gray-500">
                J'ai moins de 18 ans
              </div>
            </div>
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Cette information nous aide a personnaliser votre experience
          et a respecter la reglementation sur la protection des mineurs.
        </p>
      </div>
    </div>
  );
}
