import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TerritoireBlock = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        Vivre mon territoire
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Agenda du territoire */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/agenda-community")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Agenda du territoire</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Événements enfants/ados, réunions parents, actualités des collectivités locales.
            </CardDescription>
            <Button variant="link" className="mt-2 p-0 h-auto text-accent-foreground">
              Voir l'agenda →
            </Button>
          </CardContent>
        </Card>

        {/* Card Échanges & communauté */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/agenda-community?tab=community")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Échanges & communauté</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Rejoignez la communauté des parents, organismes et collectivités de votre territoire.
            </CardDescription>
            <Button variant="link" className="mt-2 p-0 h-auto text-muted-foreground">
              Accéder aux échanges →
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
