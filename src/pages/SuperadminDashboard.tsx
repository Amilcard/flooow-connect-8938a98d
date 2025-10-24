import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Activity, Building2, MapPin, UserPlus, DollarSign } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SuperadminDashboard() {
  const { toast } = useToast();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    territoryId: ''
  });

  // Fetch all territories
  const { data: territories } = useQuery({
    queryKey: ['all-territories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch global stats
  const { data: globalStats, isLoading: loadingStats } = useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      const { data: kpisData } = await supabase.functions.invoke('dashboard-kpis');
      
      const { data: allActivities } = await supabase
        .from('activities')
        .select('id, published, price_base');
      
      const { data: allStructures } = await supabase
        .from('structures')
        .select('id, territory_id');
      
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, territory_id');

      return {
        kpis: kpisData?.kpis || {},
        totalActivities: allActivities?.length || 0,
        publishedActivities: allActivities?.filter(a => a.published).length || 0,
        totalStructures: allStructures?.length || 0,
        totalUsers: allUsers?.length || 0,
        territories: territories?.length || 0
      };
    },
    enabled: !!territories
  });

  // Fetch all structures with details
  const { data: allStructures, isLoading: loadingStructures } = useQuery({
    queryKey: ['all-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('structures')
        .select(`
          *,
          territories (name, type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all user roles
  const { data: userRoles, isLoading: loadingUsers } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          territories (name, type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.role) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive"
      });
      return;
    }

    if (newUser.role !== 'family' && !newUser.territoryId) {
      toast({
        title: "Erreur",
        description: "Le territoire est requis pour ce rôle",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          territoryId: newUser.territoryId || null
        }
      });

      if (error) throw error;

      toast({
        title: "Utilisateur créé",
        description: `Un email a été envoyé à ${newUser.email}`
      });

      setIsCreateUserOpen(false);
      setNewUser({ email: '', firstName: '', lastName: '', role: '', territoryId: '' });
      
      // Refresh user roles list
      await supabase.from('user_roles').select('*');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loadingStats || loadingStructures || loadingUsers) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Dashboard Superadmin
              </h1>
              <p className="text-muted-foreground">
                Vue globale • Tous territoires
              </p>
            </div>
            
            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Créer un compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau compte</DialogTitle>
                  <DialogDescription>
                    L'utilisateur recevra un email pour définir son mot de passe
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="jean.dupont@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="structure">Structure</SelectItem>
                        <SelectItem value="territory_admin">Collectivité</SelectItem>
                        <SelectItem value="partner">Partenaire Financier</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newUser.role && newUser.role !== 'family' && (
                    <div className="space-y-2">
                      <Label htmlFor="territory">Territoire</Label>
                      <Select value={newUser.territoryId} onValueChange={(value) => setNewUser({ ...newUser, territoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un territoire" />
                        </SelectTrigger>
                        <SelectContent>
                          {territories?.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} ({t.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isCreating}>
                    {isCreating ? 'Création...' : 'Créer le compte'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Global Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats?.kpis?.inscriptions?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Réservations validées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activités</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats?.totalActivities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {globalStats?.publishedActivities || 0} publiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Structures</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats?.totalStructures || 0}</div>
                <p className="text-xs text-muted-foreground">Organismes inscrits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Territoires</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{globalStats?.territories || 0}</div>
                <p className="text-xs text-muted-foreground">Couverts</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="structures">
                <Building2 className="h-4 w-4 mr-2" />
                Structures
              </TabsTrigger>
              <TabsTrigger value="territories">
                <MapPin className="h-4 w-4 mr-2" />
                Territoires
              </TabsTrigger>
            </TabsList>

            {/* TAB: USERS */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Liste de tous les comptes créés</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Territoire</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles && userRoles.length > 0 ? (
                        userRoles.map((ur) => (
                          <TableRow key={ur.id}>
                            <TableCell>
                              <Badge variant={ur.role === 'superadmin' ? 'destructive' : 'default'}>
                                {ur.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ur.territories ? `${ur.territories.name} (${ur.territories.type})` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(ur.created_at).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: STRUCTURES */}
            <TabsContent value="structures" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Structures inscrites</CardTitle>
                  <CardDescription>Liste de tous les organismes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Territoire</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Créée le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allStructures && allStructures.length > 0 ? (
                        allStructures.map((structure) => (
                          <TableRow key={structure.id}>
                            <TableCell className="font-medium">{structure.name}</TableCell>
                            <TableCell>
                              {structure.territories ? `${structure.territories.name}` : 'N/A'}
                            </TableCell>
                            <TableCell>{structure.address || 'Non renseignée'}</TableCell>
                            <TableCell>
                              {new Date(structure.created_at).toLocaleDateString('fr-FR')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucune structure trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: TERRITORIES */}
            <TabsContent value="territories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Territoires couverts</CardTitle>
                  <CardDescription>Liste de tous les territoires</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actif</TableHead>
                        <TableHead>Couvert</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {territories && territories.length > 0 ? (
                        territories.map((territory) => (
                          <TableRow key={territory.id}>
                            <TableCell className="font-medium">{territory.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{territory.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={territory.active ? 'default' : 'secondary'}>
                                {territory.active ? 'Oui' : 'Non'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={territory.covered ? 'default' : 'secondary'}>
                                {territory.covered ? 'Oui' : 'Non'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucun territoire trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
