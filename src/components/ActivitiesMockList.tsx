import { useEffect, useState } from 'react';
import { fetchMockActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MockActivity {
  id: string;
  theme: string;
  titre: string;
  ageMin: number;
  ageMax: number;
  lieu: {
    nom: string;
    adresse: string;
    transport: string;
  };
  cout: number;
}

export default function ActivitiesMockList() {
  const [items, setItems] = useState<MockActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchMockActivities()
      .then(setItems)
      .catch(e => setErr(e.message ?? 'Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des activités…</span>
      </div>
    );
  }

  if (err) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Erreur: {err}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Activités Mock (40 disponibles)</h2>
      <div className="grid gap-4">
        {items.slice(0, 8).map(a => (
          <Card key={a.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{a.titre}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {a.theme}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">📍</span>
                <span>{a.lieu.nom}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{a.lieu.adresse}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  👤 {a.ageMin}-{a.ageMax} ans
                </span>
                <span className="font-semibold text-primary">
                  {a.cout}€
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
