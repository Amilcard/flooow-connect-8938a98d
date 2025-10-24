import { useState } from "react";
import Header from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/LoadingState";
import { Building2, Users, Euro } from "lucide-react";

// Import des composants de contenu de chaque dashboard
import CollectiviteDashboardContent from "./dashboard-content/CollectiviteDashboardContent";
import StructureDashboardContent from "./dashboard-content/StructureDashboardContent";
import FinanceurDashboardContent from "./dashboard-content/FinanceurDashboardContent";

export default function DemoDashboard() {
  const [activeRole, setActiveRole] = useState<"collectivite" | "structure" | "financeur">("collectivite");

  // Mock territory ID pour la démo
  const mockTerritoryId = "550e8400-e29b-41d4-a716-446655440000";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Bannière démo */}
        <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            🎭 <strong>Mode Démo</strong> - Bascule entre les 3 vues métier sans authentification
          </p>
        </Card>

        {/* Sélecteur de rôle */}
        <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="collectivite" className="gap-2">
              <Building2 className="w-4 h-4" />
              Collectivité
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-2">
              <Users className="w-4 h-4" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="financeur" className="gap-2">
              <Euro className="w-4 h-4" />
              Financeur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collectivite">
            <CollectiviteDashboardContent territoryId={mockTerritoryId} />
          </TabsContent>

          <TabsContent value="structure">
            <StructureDashboardContent />
          </TabsContent>

          <TabsContent value="financeur">
            <FinanceurDashboardContent />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
