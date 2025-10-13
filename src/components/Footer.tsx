import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">InKlusif Flooow</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme gratuite pour faciliter l'accès aux activités pour tous les enfants.
            </p>
          </div>

          {/* Familles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Familles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Rechercher une activité</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Simulateur d'aides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mon compte</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guide d'utilisation</a></li>
            </ul>
          </div>

          {/* Organismes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Organismes</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Rejoindre la plateforme</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gérer mes activités</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tarifs & aides acceptées</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>

          {/* À propos */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">À propos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Notre mission</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} InKlusif Flooow. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            Fait avec <Heart className="w-4 h-4 text-accent fill-accent" /> pour l'inclusion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
