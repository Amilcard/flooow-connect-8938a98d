import { Button } from "@/components/ui/button";
import communityImg from "@/assets/onboarding-community.png";
import activitiesImg from "@/assets/onboarding-activites.png";
import aidesImg from "@/assets/onboarding-aides.png";
import appImg from "@/assets/onboarding-megaphone.png";
import { MapPin, Calculator, Smartphone } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-background min-h-screen overflow-y-auto">
      <div className="flex-1 w-full max-w-[800px] mx-auto px-5 py-10 space-y-12">
        
        {/* HERO SECTION */}
        <section id="hero" className="text-center space-y-6">
          <img 
            src={communityImg} 
            alt="Bienvenue testeurs" 
            className="w-full max-w-[300px] mx-auto block rounded-2xl shadow-sm"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-[1.2]">
            Bienvenue les Flooow Testeurs
          </h1>
          <p className="text-lg leading-[1.6] text-muted-foreground">
            Vous faites partie des premiers à tester l'appli. On a une idée simple : vous aider à trouver des activités pour vos enfants sans exploser le budget.
          </p>
          <p className="font-semibold text-lg leading-[1.6] text-foreground">
            Vous testez, on écoute, on ajuste. Bugs, idées, remarques : on note tout. L'objectif : une appli pensée pour les familles.
          </p>
          <p className="italic text-muted-foreground leading-[1.6]">
            Tout n'est pas encore parfait, c'est justement le principe de cette version. Merci de jouer le jeu !
          </p>
        </section>

        {/* SECTION 2 - ACTIVITÉS */}
        <section id="section-2" className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <img src={activitiesImg} alt="Géolocalisation" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-[1.3]">
              2. On repère les activités près de chez vous
            </h2>
          </div>
          <p className="text-base leading-[1.6] text-muted-foreground">
            Sport, culture, loisirs, scolarité : tout au même endroit. Vous vous géolocalisez, on vous montre ce qui existe vraiment.
          </p>
          <ul className="space-y-3 pl-2">
            <li className="relative pl-8 text-base leading-[1.5] text-foreground">
              <span className="absolute left-0 text-orange-500 font-bold">✓</span>
              Activités triées par thématique, âge et budget
            </li>
            <li className="relative pl-8 text-base leading-[1.5] text-foreground">
              <span className="absolute left-0 text-orange-500 font-bold">✓</span>
              Infos claires : horaires, lieu, contacts
            </li>
          </ul>
        </section>

        {/* SECTION 3 - AIDES */}
        <section id="section-3" className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <img src={aidesImg} alt="Calculateur aides" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-[1.3]">
              3. On fait le point sur vos aides
            </h2>
          </div>
          <p className="text-base leading-[1.6] text-muted-foreground">
            Flooow repère les aides qui peuvent alléger le coût des activités. Vous renseignez quelques infos, on vous donne une estimation claire du reste à charge.
          </p>
          <ul className="space-y-3 pl-2">
            <li className="relative pl-8 text-base leading-[1.5] text-foreground">
              <span className="absolute left-0 text-purple-500 font-bold">✓</span>
              Moins de paperasse, plus de visibilité
            </li>
            <li className="relative pl-8 text-base leading-[1.5] text-foreground">
              <span className="absolute left-0 text-purple-500 font-bold">✓</span>
              Un simulateur pour ne rien rater
            </li>
          </ul>
        </section>

        {/* SECTION 4 - GUICHET UNIQUE */}
        <section id="section-4" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <img src={appImg} alt="Application" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-[1.3]">
              4. Flooow, votre guichet unique du quotidien
            </h2>
          </div>
          <p className="text-base leading-[1.6] text-muted-foreground">
            Une appli testée avec de vraies familles, pour de vrais besoins. Au menu aussi : infos pratiques, agenda local, espace parent, notifications.
          </p>
          
          <div className="bg-gray-50 border-l-4 border-orange-500 p-6 rounded-r-lg my-6">
            <p className="font-bold text-foreground mb-4">Flooow, c'est bon pour :</p>
            <ul className="space-y-3">
              <li className="relative pl-8 text-base leading-[1.5] text-foreground">
                <span className="absolute left-0 text-orange-500 font-bold">→</span>
                <strong>Votre portefeuille</strong> : aides et bons plans repérés
              </li>
              <li className="relative pl-8 text-base leading-[1.5] text-foreground">
                <span className="absolute left-0 text-orange-500 font-bold">→</span>
                <strong>Votre temps</strong> : tout centralisé, sans prise de tête
              </li>
              <li className="relative pl-8 text-base leading-[1.5] text-foreground">
                <span className="absolute left-0 text-orange-500 font-bold">→</span>
                <strong>La planète</strong> : des activités de proximité, des trajets malins
              </li>
            </ul>
          </div>

          <p className="text-center text-xl font-bold text-orange-500 mt-8">
            Alors, qu'est-ce qu'on dit ?
          </p>
        </section>

      </div>

      <div className="sticky bottom-0 p-6 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-[800px] mx-auto">
          <Button
            onClick={onNext}
            className="w-full h-14 text-lg font-bold rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02]"
            size="lg"
          >
            C'est parti !
          </Button>
        </div>
      </div>
    </div>
  );
};
