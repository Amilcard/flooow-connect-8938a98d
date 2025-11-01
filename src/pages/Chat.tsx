import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Users, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Messagerie</h1>
        </div>

        {/* Coming Soon Message */}
        <Card className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Messagerie bientôt disponible
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              La fonctionnalité de chat sera bientôt disponible pour échanger avec les structures et autres parents.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid gap-4 pt-6 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 mt-1">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Discussions avec les structures</h3>
                <p className="text-sm text-muted-foreground">
                  Posez vos questions directement aux organisateurs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 mt-1">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Échanges entre parents</h3>
                <p className="text-sm text-muted-foreground">
                  Partagez vos expériences avec d'autres familles
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2 mt-1">
                <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium">Notifications en temps réel</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez les réponses instantanément
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Chat;
