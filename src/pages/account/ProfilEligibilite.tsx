import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, Calendar, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ProfilEligibilite = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [age, setAge] = useState<string>("");
  const [hasARS, setHasARS] = useState<string>("");
  const [hasAEEH, setHasAEEH] = useState<string>("");
  const [hasAAH, setHasAAH] = useState<string>("");
  const [isStudent, setIsStudent] = useState<string>("");
  const [qf, setQf] = useState<string>("");
  const [estimatedAids, setEstimatedAids] = useState<any[]>([]);

  // Récupérer le profil utilisateur
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-eligibility"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (userProfile) {
      setQf(userProfile.quotient_familial?.toString() || "");
    }
  }, [userProfile]);

  const calculateEligibility = () => {
    if (!age || !qf) {
      toast({
        title: "Information manquante",
        description: "Renseigne au moins l'âge et le quotient familial",
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);
    const qfNum = parseInt(qf);
    const aids: any[] = [];

    // Pass'Sport
    if (ageNum >= 6 && ageNum <= 18 && (hasARS === "oui" || hasAEEH === "oui" || hasAAH === "oui")) {
      aids.push({
        name: "Pass'Sport 2025-2026",
        amount: "70€",
        description: "Aide pour ta licence sportive",
      });
    }

    // PASS'Région
    if (ageNum >= 15 && ageNum <= 25 && isStudent === "oui") {
      aids.push({
        name: "PASS'Région jeunes",
        amount: "Variable",
        description: "Sport, culture, santé, permis",
      });
    }

    // CAF Loire
    if (qfNum <= 1200) {
      aids.push({
        name: "CAF Loire — Loisirs & Séjours",
        amount: "Variable",
        description: "Aides pour loisirs et vacances",
      });
    }

    setEstimatedAids(aids);

    if (aids.length === 0) {
      toast({
        title: "Aucune aide identifiée",
        description: "Selon les critères renseignés, aucune aide automatique n'est détectée. Contacte le CCAS de ta commune.",
      });
    } else {
      toast({
        title: `${aids.length} aide(s) potentielle(s)`,
        description: "Vérifie les détails ci-dessous",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card">
        <div className="container flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/mon-compte")}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Profil d'éligibilité</h1>
            <p className="text-sm text-muted-foreground">
              Estime tes aides potentielles
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* État vide */}
        {!age && !qf && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5" />
                Renseigne 4 champs pour estimer tes aides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complète les informations ci-dessous pour obtenir une estimation personnalisée.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Mes informations</CardTitle>
            <CardDescription>
              Renseigne les critères pour calculer ton éligibilité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Âge de l'enfant</Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 12"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="3"
                max="25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qf">Quotient familial (QF)</Label>
              <Input
                id="qf"
                type="number"
                placeholder="Ex: 800"
                value={qf}
                onChange={(e) => setQf(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ars">Bénéficiaire ARS (Allocation de Rentrée Scolaire)</Label>
              <Select value={hasARS} onValueChange={setHasARS}>
                <SelectTrigger id="ars">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aeeh">Bénéficiaire AEEH (Allocation d'Éducation de l'Enfant Handicapé)</Label>
              <Select value={hasAEEH} onValueChange={setHasAEEH}>
                <SelectTrigger id="aeeh">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aah">Bénéficiaire AAH (Allocation aux Adultes Handicapés)</Label>
              <Select value={hasAAH} onValueChange={setHasAAH}>
                <SelectTrigger id="aah">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Lycéen, apprenti ou étudiant</Label>
              <Select value={isStudent} onValueChange={setIsStudent}>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculateEligibility} className="w-full">
              <Euro className="w-4 h-4 mr-2" />
              Calculer mes aides
            </Button>
          </CardContent>
        </Card>

        {/* Résultats */}
        {estimatedAids.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aides estimées ({estimatedAids.length})
            </h2>
            {estimatedAids.map((aid) => (
              <Card key={aid.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{aid.name}</CardTitle>
                      <CardDescription className="mt-1">{aid.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {aid.amount}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  💡 Ces estimations sont indicatives. Pour valider ton éligibilité, 
                  ajoute tes justificatifs dans la section "Mes justificatifs".
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilEligibilite;