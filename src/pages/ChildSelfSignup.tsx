import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Key, Mail, Calendar, User } from "lucide-react";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function ChildSelfSignup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Code path state
  const [codeForm, setCodeForm] = useState({
    familyCode: '',
    firstName: '',
    dob: ''
  });

  // Email path state
  const [emailForm, setEmailForm] = useState({
    parentEmail: '',
    childName: '',
    childDob: ''
  });

  const handleCodeSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('child-signup-code', {
        body: {
          familyCode: codeForm.familyCode,
          firstName: codeForm.firstName,
          dob: codeForm.dob
        }
      });

      if (error) throw error;

      toast({
        title: "Inscription réussie ! 🎉",
        description: data.message
      });

      navigate('/home');
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de t'inscrire. Vérifie le code avec tes parents.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('child-signup-email', {
        body: {
          parentEmail: emailForm.parentEmail,
          childName: emailForm.childName,
          childDob: emailForm.childDob
        }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé ! 📧",
        description: data.message
      });

      setEmailForm({ parentEmail: '', childName: '', childDob: '' });
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">M'inscrire moi-même</h1>
            <p className="text-muted-foreground">
              Tu peux t'inscrire si tu as le code de tes parents ou leur email
            </p>
          </div>

          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">
                <Key className="h-4 w-4 mr-2" />
                Avec un code
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Avec l'email parent
              </TabsTrigger>
            </TabsList>

            {/* PARCOURS A : CODE PARENT */}
            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Inscription rapide
                  </CardTitle>
                  <CardDescription>
                    Demande le code famille à tes parents (ex: FAM-2K9L)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCodeSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="familyCode">
                        <Key className="h-4 w-4 inline mr-2" />
                        Code famille
                      </Label>
                      <Input
                        id="familyCode"
                        value={codeForm.familyCode}
                        onChange={(e) => setCodeForm({ ...codeForm, familyCode: e.target.value.toUpperCase() })}
                        placeholder="FAM-XXXX"
                        maxLength={8}
                        required
                        className="font-mono text-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        💡 Ton parent trouve ce code dans son compte
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        <User className="h-4 w-4 inline mr-2" />
                        Mon prénom
                      </Label>
                      <Input
                        id="firstName"
                        value={codeForm.firstName}
                        onChange={(e) => setCodeForm({ ...codeForm, firstName: e.target.value })}
                        placeholder="Lucas"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Ma date de naissance
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={codeForm.dob}
                        onChange={(e) => setCodeForm({ ...codeForm, dob: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Inscription...' : '✨ M\'inscrire maintenant'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PARCOURS B : EMAIL PARENT */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Demande de validation
                  </CardTitle>
                  <CardDescription>
                    Tes parents recevront un email pour valider ton inscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email de mon parent
                      </Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={emailForm.parentEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, parentEmail: e.target.value })}
                        placeholder="parent@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childName">
                        <User className="h-4 w-4 inline mr-2" />
                        Mon prénom
                      </Label>
                      <Input
                        id="childName"
                        value={emailForm.childName}
                        onChange={(e) => setEmailForm({ ...emailForm, childName: e.target.value })}
                        placeholder="Emma"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childDob">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Ma date de naissance
                      </Label>
                      <Input
                        id="childDob"
                        type="date"
                        value={emailForm.childDob}
                        onChange={(e) => setEmailForm({ ...emailForm, childDob: e.target.value })}
                        required
                      />
                    </div>

                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">⏱️ Comment ça marche ?</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Ton parent reçoit un email</li>
                        <li>Il vérifie que c'est bien toi</li>
                        <li>Il valide en cliquant sur le lien</li>
                        <li>Tu es inscrit(e) !</li>
                      </ol>
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ Si ton parent ne valide pas sous 48h, la demande sera annulée.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Envoi...' : '📧 Envoyer la demande'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
