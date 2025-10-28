import { Heart } from "lucide-react";
import { Link } from 'react-router-dom';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-card">
			<div className="container px-4 md:px-6 py-12">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
							<Heart className="w-6 h-6 text-primary" />
						</div>
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
							  <li><Link to="/activities" className="hover:text-primary transition-colors">Rechercher une activité</Link></li>
							  <li><Link to="/aides" className="hover:text-primary transition-colors">Simulateur d'aides</Link></li>
							  <li><Link to="/mon-compte" className="hover:text-primary transition-colors">Mon compte</Link></li>
							  <li><Link to="/" className="hover:text-primary transition-colors">Guide d'utilisation</Link></li>
						</ul>
					</div>

					{/* Organismes */}
					<div className="space-y-4">
						<h4 className="font-semibold text-foreground">Organismes</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							  <li><Link to="/" className="hover:text-primary transition-colors">Rejoindre la plateforme</Link></li>
							  <li><Link to="/" className="hover:text-primary transition-colors">Gérer mes activités</Link></li>
							  <li><Link to="/" className="hover:text-primary transition-colors">Tarifs & aides acceptées</Link></li>
							  <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
						</ul>
					</div>

				{/* À propos */}
				<div className="space-y-4">
					<h4 className="font-semibold text-foreground">À propos</h4>
					<ul className="space-y-2 text-sm text-muted-foreground">
						  <li><Link to="/about" className="hover:text-primary transition-colors">Notre mission</Link></li>
						  <li><Link to="/collectivites" className="hover:text-primary transition-colors">Offre Collectivités</Link></li>
						  <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
						  <li><Link to="/legal/mentions" className="hover:text-primary transition-colors">Mentions légales</Link></li>
						  <li><Link to="/legal/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
						  <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
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
