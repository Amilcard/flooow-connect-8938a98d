import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Copy,
  Check,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";

const LierEnfant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [childCode, setChildCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Récupérer le profil de l'utilisateur avec son code de liaison
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, linking_code")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Générer un code de liaison pour ce parent
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase.rpc("generate_profile_linking_code", {
        profile_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({
        title: "Code généré",
        description: "Ton code de liaison est prêt à être partagé",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le code",
        variant: "destructive",
      });
    },
  });

  // Récupérer les demandes d'enfants en attente
  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["child-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("child_temp_requests")
        .select(`
          *,
          minor:minor_profile_id(id, email),
          activity:activity_id(title, images, structures:structure_id(name, address)),
          slot:slot_id(start, end)
        `)
        .eq("parent_id", user.id)
        .in("status", ["parent_linked"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Lier un enfant via son code
  const handleLinkChild = async () => {
    if (!childCode || childCode.length !== 6) {
      setLinkError("Le code doit contenir 6 caractères");
      return;
    }

    setIsLinking(true);
    setLinkError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase.rpc("link_parent_to_minor", {
        p_parent_id: user.id,
        p_linking_code: childCode.toUpperCase(),
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({
          title: "Enfant lié",
          description: "Le compte a été lié avec succès. Tu peux maintenant valider sa demande.",
        });
        setChildCode("");
        queryClient.invalidateQueries({ queryKey: ["child-requests"] });
      } else {
        setLinkError(result.error || "Code invalide");
      }
    } catch (err: any) {
      console.error("Link error:", err);
      setLinkError(err.message || "Erreur lors de la liaison");
    } finally {
      setIsLinking(false);
    }
  };

  // Valider ou refuser une demande
  const validateMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "validate" | "reject" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase.rpc("validate_child_request", {
        p_parent_id: user.id,
        p_request_id: requestId,
        p_action: action,
      });

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["child-requests"] });

      if (variables.action === "validate") {
        toast({
          title: "Demande validée",
          description: "L'inscription de ton enfant a été transmise à la structure",
        });
        // TODO: Créer le booking réel ici
      } else {
        toast({
          title: "Demande refusée",
          description: "La demande d'inscription a été refusée",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = async () => {
    if (!profile?.linking_code) return;

    try {
      await navigator.clipboard.writeText(profile.linking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copié",
        description: "Le code a été copié dans le presse-papier",
      });
    } catch {
      toast({
        title: "Copie impossible",
        description: "Copie le code manuellement",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loadingProfile) return <LoadingState />;

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Lier un enfant"
        subtitle="Valider les inscriptions de vos enfants"
        backFallback="/mon-compte"
      />

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Section: Mon code parent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mon code parent</CardTitle>
            <CardDescription>
              Donne ce code à ton enfant pour qu'il lie son compte au tien
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.linking_code ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <span className="text-3xl font-mono font-bold tracking-widest text-primary">
                  {profile.linking_code}
                </span>
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Tu n'as pas encore de code de liaison
                </p>
                <Button
                  onClick={() => generateCodeMutation.mutate()}
                  disabled={generateCodeMutation.isPending}
                >
                  {generateCodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Générer mon code
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section: Lier avec le code d'un enfant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Lier un enfant avec son code
            </CardTitle>
            <CardDescription>
              Si ton enfant a généré un code, saisis-le ici pour lier son compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="childCode">Code enfant (6 caractères)</Label>
              <div className="flex gap-2">
                <Input
                  id="childCode"
                  value={childCode}
                  onChange={(e) => setChildCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Ex: XYZ789"
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono"
                />
                <Button
                  onClick={handleLinkChild}
                  disabled={isLinking || childCode.length !== 6}
                >
                  {isLinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Lier"
                  )}
                </Button>
              </div>
            </div>

            {linkError && (
              <Alert variant="destructive">
                <AlertDescription>{linkError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section: Demandes en attente */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Demandes en attente de validation</h2>

          {loadingRequests ? (
            <LoadingState />
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucune demande en attente"
              description="Les demandes d'inscription de vos enfants apparaîtront ici"
            />
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="pt-6 space-y-4">
                    {/* Info enfant */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{request.minor?.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Demande du {new Date(request.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                      </Badge>
                    </div>

                    <Separator />

                    {/* Info activité */}
                    <div className="space-y-2">
                      {request.activity?.images?.[0] && (
                        <img
                          src={request.activity.images[0]}
                          alt={request.activity.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <p className="font-medium">{request.activity?.title}</p>
                      {request.activity?.structures?.name && (
                        <p className="text-sm text-muted-foreground">
                          {request.activity.structures.name}
                        </p>
                      )}

                      {request.activity?.structures?.address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{request.activity.structures.address}</span>
                        </div>
                      )}

                      {request.slot && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {formatDate(request.slot.start)} · {formatTime(request.slot.start)} - {formatTime(request.slot.end)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => validateMutation.mutate({ requestId: request.id, action: "reject" })}
                        disabled={validateMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                      <Button
                        onClick={() => validateMutation.mutate({ requestId: request.id, action: "validate" })}
                        disabled={validateMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default LierEnfant;
