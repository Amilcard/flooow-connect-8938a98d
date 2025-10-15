import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

import Footer from "@/components/Footer";

const Support = () => {
  const faqItems = [
    {
      question: "Comment réserver une activité ?",
      answer: "Sélectionnez une activité, choisissez un créneau, puis suivez les étapes de réservation.",
    },
    {
      question: "Comment annuler une réservation ?",
      answer: "Accédez à vos réservations depuis 'Mon compte' et sélectionnez 'Annuler'.",
    },
    {
      question: "Les aides sont-elles automatiquement appliquées ?",
      answer: "Oui, lors de la réservation, vous pouvez simuler les aides disponibles.",
    },
    {
      question: "Comment ajouter un enfant ?",
      answer: "Dans 'Mon compte', cliquez sur 'Gérer mes enfants' puis 'Ajouter un enfant'.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Support</h1>
          <p className="text-muted-foreground">
            Besoin d'aide ? Nous sommes là pour vous
          </p>
        </div>

        {/* Contact options */}
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat en direct
              </CardTitle>
              <CardDescription>
                Discutez avec notre équipe (9h-18h)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Démarrer une conversation</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email
              </CardTitle>
              <CardDescription>
                Réponse sous 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                support@flooow.fr
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Téléphone
              </CardTitle>
              <CardDescription>
                Du lundi au vendredi, 9h-18h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                01 23 45 67 89
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Questions fréquentes
          </h2>
          
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
      <Footer />
    </div>
  );
};

export default Support;
