import { Heart } from "lucide-react";
import { Link } from 'react-router-dom';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-card">
			<div className="container px-4 md:px-6 py-12">
			<div className="grid md:grid-cols-3 gap-8 mb-8">
				{/* Brand */}
				<div className="space-y-4">
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
						<Heart className="w-6 h-6 text-primary" />
					</div>
					<span className="text-xl font-semibold text-foreground">InKlusif Flooow</span>
				</div>
				<p className="text-sm text-muted-foreground leading-relaxed">
					La plateforme
				</p>
				</div>

				{/* Familles */}
				<div className="space-y-4">
					<h4 className="font-semibold text-foreground">Familles</h4>
					<ul className="space-y-2 text-sm text-muted-foreground">
						  <li><Link to="/search" className="hover:text-primary transition-colors">Rechercher une activité</Link></li>
						  <li><Link to="/aides" className="hover:text-primary transition-colors">Aides & mobilités</Link></li>
					</ul>
				</div>

			{/* À propos */}
			<div className="space-y-4">
				<h4 className="font-semibold text-foreground">À propos</h4>
				<ul className="space-y-2 text-sm text-muted-foreground">
					  <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
					  <li><Link to="/legal/mentions" className="hover:text-primary transition-colors">Mentions légales</Link></li>
					  <li><Link to="/legal/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
				</ul>
			</div>
			</div>

				<div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
					<p>© {currentYear} InKlusif Flooow. Tous droits réservés.</p>
					<p className="flex items-center gap-2">
						Fait avec <Heart className="w-4 h-4 text-accent fill-accent" /> pour vous.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
