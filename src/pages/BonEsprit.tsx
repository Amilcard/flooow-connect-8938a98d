import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BonEsprit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    nominator_first_name: "",
    nominator_last_name: "",
    nominator_email: "",
    city_or_structure: "",
    nominee_first_name: "",
    nominee_last_name: "",
    nominee_structure: "",
    nominee_role: "",
    reason: "",
    class_or_group: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: "Acceptation requise",
        description: "Veuillez accepter que votre proposition puisse être utilisée de manière anonymisée.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implémenter l'envoi vers Supabase ou API
      // Pour l'instant, simulation
      console.log("Proposition Bon Esprit:", formData);

      toast({
        title: "Proposition envoyée !",
        description: "Merci pour votre contribution. Votre proposition a bien été enregistrée.",
      });

      // Reset du formulaire
      setFormData({
        nominator_first_name: "",
        nominator_last_name: "",
        nominator_email: "",
        city_or_structure: "",
        nominee_first_name: "",
        nominee_last_name: "",
        nominee_structure: "",
        nominee_role: "",
        reason: "",
        class_or_group: "",
      });
      setAcceptTerms(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur s'est produite lors de l'envoi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Bon esprit – les héros du quotidien"
        subtitle="Mettez en lumière les personnes qui font la différence"
        backFallback="/home"
      />

      <div className="container mx-auto px-4 py-6 pb-24 max-w-5xl">
        {/* Bandeau d'intro orange */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Proposez une personnalité Bon esprit</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
              Chaque jour, des personnes s'engagent pour les enfants et les familles : bénévoles,
              éducateurs, animateurs, enseignants, agents de terrain… Avec Bon esprit, vous pouvez
              les mettre à l'honneur. Décrivez une personne, une situation ou une action qui vous a
              marqué : les écoles et structures participantes éliront ensuite la personnalité "Bon
              esprit" de votre territoire.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Formulaire de nomination */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de nomination</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour proposer une personne qui mérite d'être reconnue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section : Vos informations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Vos informations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nominator_first_name">Votre prénom *</Label>
                    <Input
                      id="nominator_first_name"
                      value={formData.nominator_first_name}
                      onChange={(e) => handleInputChange("nominator_first_name", e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nominator_last_name">Votre nom *</Label>
                    <Input
                      id="nominator_last_name"
                      value={formData.nominator_last_name}
                      onChange={(e) => handleInputChange("nominator_last_name", e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominator_email">Votre email *</Label>
                  <Input
                    id="nominator_email"
                    type="email"
                    value={formData.nominator_email}
                    onChange={(e) => handleInputChange("nominator_email", e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Pour être recontacté si besoin
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city_or_structure">Ville / établissement ou structure *</Label>
                  <Input
                    id="city_or_structure"
                    value={formData.city_or_structure}
                    onChange={(e) => handleInputChange("city_or_structure", e.target.value)}
                    placeholder="Ex: École Jean Moulin, Lyon"
                    required
                  />
                </div>
              </div>

              {/* Section : La personne proposée */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-accent-blue">
                  La personne que vous proposez
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nominee_first_name">Prénom de la personne *</Label>
                    <Input
                      id="nominee_first_name"
                      value={formData.nominee_first_name}
                      onChange={(e) => handleInputChange("nominee_first_name", e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nominee_last_name">Nom de la personne *</Label>
                    <Input
                      id="nominee_last_name"
                      value={formData.nominee_last_name}
                      onChange={(e) => handleInputChange("nominee_last_name", e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominee_structure">
                    Structure où elle intervient *
                  </Label>
                  <Input
                    id="nominee_structure"
                    value={formData.nominee_structure}
                    onChange={(e) => handleInputChange("nominee_structure", e.target.value)}
                    placeholder="Ex: École, club, association, service municipal..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominee_role">Rôle de la personne *</Label>
                  <Select
                    value={formData.nominee_role}
                    onValueChange={(value) => handleInputChange("nominee_role", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enseignant">Enseignant(e)</SelectItem>
                      <SelectItem value="coach">Coach sportif</SelectItem>
                      <SelectItem value="animateur">Animateur/Animatrice</SelectItem>
                      <SelectItem value="benevole">Bénévole</SelectItem>
                      <SelectItem value="educateur">Éducateur/Éducatrice</SelectItem>
                      <SelectItem value="agent">Agent de terrain</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Pourquoi cette personne est-elle Bon esprit ? *
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    placeholder="Racontez une situation, une action, un geste ou un engagement qui vous a marqué..."
                    rows={6}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Décrivez en quelques phrases ce qui rend cette personne exceptionnelle
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class_or_group">
                    Classe ou groupe (optionnel)
                  </Label>
                  <Input
                    id="class_or_group"
                    value={formData.class_or_group}
                    onChange={(e) => handleInputChange("class_or_group", e.target.value)}
                    placeholder="Ex: CM2 B, Club de foot U11..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Si la proposition vient d'une classe ou d'un groupe
                  </p>
                </div>
              </div>

              {/* Acceptation */}
              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="accept_terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label
                  htmlFor="accept_terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  J'accepte que ma proposition puisse être utilisée de manière anonymisée pour
                  valoriser cette personne
                </Label>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer ma proposition
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bloc explicatif sur le mode de sélection - Fond bleu */}
        <Card className="mt-8 bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 border-accent-blue/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🗳️ Comment sont élues les personnalités Bon esprit ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              À la fin de chaque période (par exemple un trimestre), les écoles et structures
              participantes reçoivent un récapitulatif anonymisé des propositions. Elles votent
              ensuite pour élire la "Personnalité Bon esprit" de l'année.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les lauréats pourront être mis à l'honneur dans la rubrique{" "}
              <button
                onClick={() => navigate("/ma-ville-mon-actu")}
                className="text-accent-blue hover:underline font-medium"
              >
                Ma ville, mon actu
              </button>{" "}
              et lors d'un temps fort sur le territoire.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BonEsprit;
