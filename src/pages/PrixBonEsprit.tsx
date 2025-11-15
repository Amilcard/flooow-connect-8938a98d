import PageLayout from "@/components/PageLayout";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const PrixBonEsprit = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 pb-24">
        <BackButton />
        
        {/* Hero Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main">Prix Bon Esprit</h1>
              <p className="text-lg text-text-muted">Vote des élèves</p>
            </div>
          </div>
          <p className="text-xl text-text-secondary">
            Mettre en lumière les héros du quotidien de ton école ou de ton quartier.
          </p>
        </div>

        {/* Content Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">À quoi sert ce prix ?</CardTitle>
            <CardDescription>
              Valoriser celles et ceux qui font du bien autour de toi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-text-secondary leading-relaxed">
                Ici, tu peux voter pour une personne de ton école ou de ton quartier qui représente vraiment le bon esprit.
              </p>

              <div className="bg-accent/30 rounded-lg p-6 my-6">
                <h3 className="text-lg font-semibold mb-4 text-text-main">Ce peut être :</h3>
                <ul className="space-y-3 text-text-secondary">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>un camarade toujours prêt à aider,</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>un élève engagé dans la vie de l'établissement,</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>un jeune qui encourage les autres,</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>une personne discrète mais essentielle au quotidien,</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>ou encore un bénévole, un animateur, un éducateur, un "héros du quotidien" que tout le monde apprécie.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-lg p-6 border-l-4 border-primary">
                <p className="text-lg font-semibold text-text-main mb-2">L'objectif :</p>
                <p className="text-text-secondary">
                  Mettre en lumière celles et ceux qui font du bien autour d'eux.
                </p>
              </div>

              <p className="text-text-secondary leading-relaxed mt-6">
                Choisis la personne que tu souhaites soutenir et explique en quelques mots pourquoi elle mérite le Prix Bon Esprit cette année.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PrixBonEsprit;
