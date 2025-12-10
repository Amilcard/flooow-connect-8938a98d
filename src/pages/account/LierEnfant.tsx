import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Heart,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

const LierEnfant = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [childCode, setChildCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Recuperer le profil de l'utilisateur avec son code de liaison
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, linking_code, first_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Generer un code de liaison pour ce parent
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase.rpc("generate_profile_linking_code", {
        profile_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast({
        title: "Code genere !",
        description: "Ton code Family Flooow est pret a etre partage avec ton enfant.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Oups !",
        description: error.message || "Impossible de generer le code. Reessaie dans quelques instants.",
        variant: "destructive",
      });
    },
  });

  // Recuperer les demandes d'enfants en attente
  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["child-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase
        .from("child_temp_requests")
        .select(`
          *,
          minor:minor_profile_id(id, email, first_name),
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
      setLinkError("Le code doit contenir 6 caracteres");
      return;
    }

    setIsLinking(true);
    setLinkError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase.rpc("link_parent_to_minor", {
        p_parent_id: user.id,
        p_linking_code: childCode.toUpperCase(),
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({
          title: "Enfant lie avec succes !",
          description: "Le compte a ete lie. Tu peux maintenant valider sa demande d'inscription.",
        });
        setChildCode("");
        queryClient.invalidateQueries({ queryKey: ["child-requests"] });
      } else {
        setLinkError(result.error || "Code invalide ou expire");
      }
    } catch (err: any) {
      console.error("Link error:", err);
      setLinkError(err.message || "Une erreur est survenue. Reessaie dans quelques instants.");
    } finally {
      setIsLinking(false);
    }
  };

  // Valider ou refuser une demande
  const validateMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "validate" | "reject" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifie");

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
          title: "Inscription validee !",
          description: "Super ! L'inscription de ton enfant a ete transmise a la structure.",
        });
        // TODO: Creer le booking reel ici
      } else {
        toast({
          title: "Demande refusee",
          description: "La demande d'inscription a ete refusee. Tu peux en discuter avec ton enfant.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Oups !",
        description: error.message || "Une erreur est survenue. Reessaie dans quelques instants.",
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
        title: "Code copie !",
        description: "Tu peux maintenant l'envoyer a ton enfant.",
      });
    } catch {
      toast({
        title: "Copie impossible",
        description: "Selectionne le code manuellement pour le copier.",
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

  // Format code for display (ABC DEF)
  const displayCode = profile?.linking_code
    ? `${profile.linking_code.slice(0, 3)} ${profile.linking_code.slice(3)}`
    : "";

  if (loadingProfile) return <LoadingState />;

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Lier un enfant"
        subtitle="Family Flooow"
        backFallback="/mon-compte"
      />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Message inspirant Family Flooow */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-base text-foreground font-medium">
                Bienvenue dans l'espace Family Flooow
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Ici, tu peux lier le compte de ton enfant au tien et valider ses inscriptions aux activites. Ensemble, on facilite les loisirs en famille !"
              </p>
            </div>
          </div>
        </Card>

        {/* Section: Mon code parent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Mon code Family Flooow</CardTitle>
            </div>
            <CardDescription>
              Donne ce code a ton enfant pour qu'il puisse lier son compte au tien
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.linking_code ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-6">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Ton code unique</span>
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-3xl font-mono font-bold tracking-[0.2em] text-foreground">
                      {displayCode}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copie !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier le code
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
                <p className="text-xs text-center text-muted-foreground">
                  Ton enfant trouvera l'option "Mon parent a deja Flooow" lors de son inscription.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">
                    Tu n'as pas encore de code Family Flooow
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Genere-en un pour permettre a ton enfant de lier son compte
                  </p>
                </div>
                <Button
                  onClick={() => generateCodeMutation.mutate()}
                  disabled={generateCodeMutation.isPending}
                  className="gap-2"
                >
                  {generateCodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generer mon code
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
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Lier avec le code de ton enfant</CardTitle>
            </div>
            <CardDescription>
              Si ton enfant a genere un code depuis son compte, saisis-le ici
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="childCode">Code enfant (6 caracteres)</Label>
              <div className="flex gap-2">
                <Input
                  id="childCode"
                  value={childCode}
                  onChange={(e) => setChildCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="Ex : ABC123"
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono"
                />
                <Button
                  onClick={handleLinkChild}
                  disabled={isLinking || childCode.length !== 6}
                  className="gap-2"
                >
                  {isLinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Lier
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {linkError && (
              <Alert variant="destructive">
                <AlertDescription>{linkError}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Ton enfant peut generer un code en cliquant sur "Mon parent n'a pas encore Flooow" lors d'une inscription.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Section: Demandes en attente */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Demandes en attente de validation</h2>
          </div>

          {loadingRequests ? (
            <LoadingState />
          ) : pendingRequests.length === 0 ? (
            <Card className="bg-muted/30 border-0 p-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Aucune demande en attente</p>
                  <p className="text-sm text-muted-foreground">
                    Les demandes d'inscription de tes enfants apparaitront ici
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Message info */}
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Ton enfant attend ta validation. Prends le temps de verifier l'activite avant de valider.
                  </p>
                </div>
              </Card>

              {pendingRequests.map((request: any) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="pt-6 space-y-4">
                    {/* Info enfant */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {request.minor?.first_name?.[0]?.toUpperCase() || request.minor?.email?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.minor?.first_name || request.minor?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Demande du {new Date(request.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                      </Badge>
                    </div>

                    <Separator />

                    {/* Info activite */}
                    <div className="space-y-3">
                      {request.activity?.images?.[0] && (
                        <img
                          src={request.activity.images[0]}
                          alt={request.activity.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <p className="font-semibold text-foreground">{request.activity?.title}</p>
                      {request.activity?.structures?.name && (
                        <p className="text-sm text-muted-foreground">
                          {request.activity.structures.name}
                        </p>
                      )}

                      {request.activity?.structures?.address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{request.activity.structures.address}</span>
                        </div>
                      )}

                      {request.slot && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span>
                            {formatDate(request.slot.start)} - {formatTime(request.slot.start)} a {formatTime(request.slot.end)}
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
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </Button>
                      <Button
                        onClick={() => validateMutation.mutate({ requestId: request.id, action: "validate" })}
                        disabled={validateMutation.isPending}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Valider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer inspirant */}
        <Card className="bg-muted/30 border-0 p-4 mt-6">
          <p className="text-xs text-center text-muted-foreground">
            Family Flooow : ensemble, on facilite l'acces aux loisirs pour toute la famille.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LierEnfant;
