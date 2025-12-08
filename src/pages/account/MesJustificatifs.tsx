import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Justificatif {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
}

const MesJustificatifs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([
    {
      id: "pass_sport",
      name: "Pass'Sport — Attestation allocataire",
      description: "Attestation CAF, MSA ou notification ARS/AEEH/AAH",
      required: true,
      uploaded: false,
    },
    {
      id: "pass_region",
      name: "PASS'Région — Carte lycéen/apprenti",
      description: "Certificat de scolarité ou contrat d'apprentissage",
      required: true,
      uploaded: false,
    },
    {
      id: "caf_loire",
      name: "CAF Loire — Quotient familial",
      description: "Attestation CAF avec QF",
      required: false,
      uploaded: false,
    },
    {
      id: "ccas_ricamarie",
      name: "La Ricamarie — Justificatif domicile",
      description: "Justificatif de domicile récent (< 3 mois)",
      required: false,
      uploaded: false,
    },
  ]);

  const handleUpload = (id: string) => {
    // Simuler l'upload
    setJustificatifs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, uploaded: true } : j))
    );
    toast({
      title: "Document ajouté",
      description: "Le justificatif a été enregistré avec succès",
    });
  };

  const allRequiredUploaded = justificatifs
    .filter((j) => j.required)
    .every((j) => j.uploaded);

  const uploadedCount = justificatifs.filter(j => j.uploaded).length;
  const totalCount = justificatifs.length;

  return (
    <PageLayout showHeader={false}>
      {/* Nouveau bandeau blanc standard */}
      <PageHeader
        title="Mes justificatifs"
        subtitle={`${uploadedCount}/${totalCount} document${totalCount > 1 ? 's' : ''} ajouté${uploadedCount > 1 ? 's' : ''}`}
        backFallback="/mon-compte"
        tourId="documents-page-header"
      />

      <main className="container py-6 space-y-6" data-tour-id="account-documents">
        {/* Résumé des documents */}
        <Card className={!allRequiredUploaded ? "bg-muted/50 border-orange-200" : "bg-green-50 border-green-200"}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {!allRequiredUploaded ? (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Documents manquants
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  Tous les documents obligatoires sont ajoutés
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {!allRequiredUploaded
                ? "Télécharge au moins les documents obligatoires pour pouvoir transmettre ta demande d'aide."
                : "Tu peux maintenant transmettre tes justificatifs pour finaliser ta demande."}
            </p>
          </CardContent>
        </Card>

        {/* Liste des justificatifs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents requis
          </h2>

          {justificatifs.map((justificatif) => (
            <Card key={justificatif.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{justificatif.name}</CardTitle>
                      {justificatif.required && (
                        <Badge variant="destructive" className="text-xs">
                          Obligatoire
                        </Badge>
                      )}
                      {justificatif.uploaded && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Validé
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {justificatif.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!justificatif.uploaded ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpload(justificatif.id)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger le document
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Document validé</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bouton transmettre */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Button
              className="w-full"
              disabled={!allRequiredUploaded}
            >
              Transmettre les justificatifs
            </Button>
            {!allRequiredUploaded && (
              <p className="text-xs text-muted-foreground text-center">
                Tous les documents obligatoires doivent être ajoutés
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              🔒 Tes documents sont sécurisés et ne sont accessibles qu'aux organismes 
              concernés pour la validation de tes demandes d'aide.
            </p>
          </CardContent>
        </Card>
      </main>
    </PageLayout>
  );
};

export default MesJustificatifs;