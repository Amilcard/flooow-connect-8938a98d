import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Pause } from 'lucide-react';

type Props = {
  onExport: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
};

const DataManagement: React.FC<Props> = ({ onExport, onDeactivate, onDelete }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Download className="w-5 h-5" />
        <span>Gestion des données</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Exporter mes données</p>
          <p className="text-sm text-muted-foreground">Télécharger toutes vos données personnelles (RGPD)</p>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-orange-600">Désactiver mon compte</p>
          <p className="text-sm text-muted-foreground">Suspension temporaire - réactivable à tout moment</p>
        </div>
        <Button variant="outline" size="sm" onClick={onDeactivate} className="flex items-center text-orange-600 border-orange-600 hover:bg-orange-50">
          <Pause className="w-4 h-4 mr-2" />
          Désactiver
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-red-600">Supprimer mon compte</p>
          <p className="text-sm text-muted-foreground">Suppression définitive dans 30 jours - toutes vos données</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete} className="flex items-center text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default DataManagement;
