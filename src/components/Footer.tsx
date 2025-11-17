import { Heart } from "lucide-react";
import { Link } from 'react-router-dom';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-card">
			<div className="container px-4 md:px-6 py-12">
			<div className="grid md:grid-cols-3 gap-6 mb-6">
				{/* Brand */}
				<div className="space-y-3">
				<div className="flex items-center gap-2 mb-2">
					<div className="p-1.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
						<Heart className="w-5 h-5 text-primary" />
					</div>
					<span className="text-base font-medium text-muted-foreground">InKlusif Flooow</span>
				</div>
				<p className="text-xs text-muted-foreground/70 leading-relaxed">
					La plateforme
				</p>
				</div>

				{/* Familles */}
				<div className="space-y-3">
					<h4 className="text-sm font-medium text-muted-foreground">Familles</h4>
					<ul className="space-y-1.5 text-xs text-muted-foreground/80">
						  <li><Link to="/search" className="hover:text-primary transition-colors">Rechercher une activité</Link></li>
						  <li><Link to="/aides" className="hover:text-primary transition-colors">Aides & mobilités</Link></li>
					</ul>
				</div>

			{/* À propos */}
			<div className="space-y-3">
				<h4 className="text-sm font-medium text-muted-foreground">À propos</h4>
				<ul className="space-y-1.5 text-xs text-muted-foreground/80">
					  <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
					  <li><Link to="/legal/mentions" className="hover:text-primary transition-colors">Mentions légales</Link></li>
					  <li><Link to="/legal/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
				</ul>
			</div>
			</div>

				<div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground/70">
					<p>© {currentYear} InKlusif Flooow. Tous droits réservés.</p>
					<p className="flex items-center gap-2">
						Fait avec <Heart className="w-3 h-3 text-accent fill-accent" /> pour vous.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
