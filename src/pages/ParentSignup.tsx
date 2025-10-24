import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSmartBack } from "@/hooks/useSmartBack";

const ParentSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleBack = useSmartBack("/");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save to localStorage every 10s
  useEffect(() => {
    const savedData = localStorage.getItem("parent-signup-draft");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }

    const interval = setInterval(() => {
      localStorage.setItem("parent-signup-draft", JSON.stringify(formData));
    }, 10000);

    return () => clearInterval(interval);
  }, [formData]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const passwordChecks = [
    { label: "Au moins 8 caractères", valid: formData.password.length >= 8 },
    { label: "Une majuscule", valid: /[A-Z]/.test(formData.password) },
    { label: "Un chiffre", valid: /[0-9]/.test(formData.password) },
    { label: "Un caractère spécial", valid: /[^A-Za-z0-9]/.test(formData.password) }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (passwordStrength < 100) {
      toast({
        title: "Mot de passe trop faible",
        description: "Veuillez respecter tous les critères de sécurité",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Compte créé",
        description: "Votre compte parent a été créé avec succès"
      });

      localStorage.removeItem("parent-signup-draft");
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-destructive";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 50) return "Faible";
    if (passwordStrength < 75) return "Moyen";
    return "Fort";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft />
          </Button>
          <h1 className="font-semibold text-lg">Inscription Parent</h1>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-md mx-auto">
        <Alert className="mb-6">
          <AlertDescription>
            Vos données sont sauvegardées automatiquement toutes les 10 secondes
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Étape 1/1</span>
                <span className="font-medium">Informations personnelles</span>
              </div>
              <Progress value={100} />
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={passwordStrength} 
                      className={`flex-1 [&>div]:${getStrengthColor()}`}
                    />
                    <span className="text-sm font-medium">{getStrengthLabel()}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {check.valid ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={check.valid ? "text-foreground" : "text-muted-foreground"}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isSubmitting || passwordStrength < 100}
            >
              {isSubmitting ? "Création du compte..." : "Créer mon compte"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              En créant un compte, vous acceptez nos conditions d'utilisation
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ParentSignup;
