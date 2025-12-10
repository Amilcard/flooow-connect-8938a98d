import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const faqItems = [
  {
    question: 'Comment réserver une activité ?',
    answer: "Sélectionnez une activité, choisissez un créneau, puis suivez les étapes de réservation. Certaines activités demandent une confirmation par l'organisme.",
  },
  {
    question: "Comment annuler une réservation ?",
    answer: "Rendez-vous dans 'Mon compte' → 'Mes réservations', sélectionnez la réservation et cliquez sur 'Annuler'. Les conditions d'annulation peuvent varier selon l'organisme.",
  },
  {
    question: "Les aides sont-elles automatiquement appliquées ?",
    answer: "Lors de la réservation, vous pouvez simuler et appliquer les aides disponibles. Certaines aides nécessitent une validation ou justificatif.",
  },
  {
    question: "Comment ajouter un enfant ?",
    answer: "Dans 'Mon compte' → 'Mes enfants', cliquez sur 'Ajouter un enfant' et remplissez les informations demandées.",
  },
  {
    question: "Puis-je modifier mes informations personnelles ?",
    answer: "Oui, allez dans 'Mon compte' → 'Mes informations' pour mettre à jour vos coordonnées.",
  },
  {
    question: "Que faire si je rencontre un problème technique ?",
    answer: "Contactez notre support via la page 'Contact' ou envoyez un email à support@flooow.fr en précisant le problème et vos informations.",
  },
];

const FAQSection = ({ limit = 6 }: { limit?: number }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-50 text-orange-600 px-4 py-1 rounded-full border border-orange-200 mb-4">Questions fréquentes</div>
          <h2 className="text-4xl font-bold mb-2">Tout ce que vous devez savoir</h2>
          <p className="text-muted-foreground">Nos réponses aux questions les plus fréquentes sur Flooow.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.slice(0, limit).map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border-t last:border-b border-border">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between py-4 px-2"
                >
                  <span className="text-lg font-medium">{item.question}</span>
                  <ChevronDown className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`px-2 pb-4 transition-all ${isOpen ? 'block' : 'hidden'}`}>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
