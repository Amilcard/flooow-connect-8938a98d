import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { 
   
  CreditCard, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Star,
  Edit,
  Wallet,
  Smartphone,
  Building
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applepay' | 'googlepay' | 'sepa';
  name: string;
  details: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  isExpired: boolean;
  brand?: 'visa' | 'mastercard' | 'amex';
}

const MoyensPaiement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Carte Visa',
      details: 'Carte bancaire principale',
      lastFour: '4242',
      expiryDate: '12/26',
      isDefault: true,
      isExpired: false,
      brand: 'visa'
    },
    {
      id: '2',
      type: 'paypal',
      name: 'PayPal',
      details: 'marie.martin@email.com',
      isDefault: false,
      isExpired: false
    },
    {
      id: '3',
      type: 'card',
      name: 'Carte Mastercard',
      details: 'Carte de secours',
      lastFour: '5555',
      expiryDate: '08/25',
      isDefault: false,
      isExpired: true,
      brand: 'mastercard'
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    type: 'card'
  });

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        if (method.brand === 'visa') {
          return <div className="w-8 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">VISA</div>;
        } else if (method.brand === 'mastercard') {
          return <div className="w-8 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded">MC</div>;
        } else if (method.brand === 'amex') {
          return <div className="w-8 h-5 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">AMEX</div>;
        }
        return <CreditCard className="w-6 h-6 text-gray-600" />;
      case 'paypal':
        return <div className="w-8 h-5 bg-blue-500 text-white text-xs font-bold flex items-center justify-center rounded">PP</div>;
      case 'applepay':
        return <Smartphone className="w-6 h-6 text-gray-900" />;
      case 'googlepay':
        return <Wallet className="w-6 h-6 text-blue-600" />;
      case 'sepa':
        return <Building className="w-6 h-6 text-green-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const setAsDefault = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    
    toast({
      title: "Moyen de paiement par défaut mis à jour",
      description: "Ce moyen de paiement sera utilisé par défaut pour vos réservations.",
    });
  };

  const deletePaymentMethod = (methodId: string) => {
    const methodToDelete = paymentMethods.find(m => m.id === methodId);
    
    if (methodToDelete?.isDefault && paymentMethods.length > 1) {
      // Set another method as default before deleting
      const otherMethods = paymentMethods.filter(m => m.id !== methodId);
      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === otherMethods[0].id
        }))
      );
    }
    
    setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
    setMethodToDelete(null);
    
    toast({
      title: "Moyen de paiement supprimé",
      description: "Le moyen de paiement a été supprimé avec succès.",
    });
  };

  const addPaymentMethod = () => {
    if (!newCard.number || !newCard.name || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const brand = newCard.number.startsWith('4') ? 'visa' : 
                 newCard.number.startsWith('5') ? 'mastercard' : 'visa';

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `Carte ${brand === 'visa' ? 'Visa' : 'Mastercard'}`,
      details: newCard.name,
      lastFour: newCard.number.slice(-4),
      expiryDate: `${newCard.expiryMonth}/${newCard.expiryYear}`,
      isDefault: paymentMethods.length === 0,
      isExpired: false,
      brand
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setNewCard({
      number: '',
      name: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      type: 'card'
    });
    setShowAddDialog(false);

    toast({
      title: "Carte ajoutée",
      description: "Votre nouvelle carte a été ajoutée avec succès.",
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <PageLayout showHeader={false}>
      {/* Header blanc standard */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between px-4 py-3">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <BackButton fallback="/mon-compte" positioning="relative" size="sm" showText={true} label="Retour" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground leading-tight">Moyens de paiement</h1>
              <p className="text-sm text-muted-foreground">
                {paymentMethods.length} moyen{paymentMethods.length > 1 ? 's' : ''} de paiement
              </p>
            </div>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter une carte bancaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ 
                      ...newCard, 
                      number: formatCardNumber(e.target.value).replace(/\s/g, '') 
                    })}
                    maxLength={19}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nom sur la carte</Label>
                  <Input
                    id="cardName"
                    placeholder="Marie MARTIN"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Mois</Label>
                    <Select 
                      value={newCard.expiryMonth} 
                      onValueChange={(value) => setNewCard({ ...newCard, expiryMonth: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Année</Label>
                    <Select 
                      value={newCard.expiryYear} 
                      onValueChange={(value) => setNewCard({ ...newCard, expiryYear: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AA" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={String(year).slice(-2)}>
                              {String(year).slice(-2)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ 
                        ...newCard, 
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                      })}
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button onClick={addPaymentMethod} className="flex-1">
                    Ajouter la carte
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Informations de sécurité */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Paiements sécurisés
                </h3>
                <p className="text-blue-800 text-sm">
                  Vos informations de paiement sont chiffrées et sécurisées. Nous ne stockons jamais 
                  les numéros de carte complets sur nos serveurs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des moyens de paiement */}
        {paymentMethods.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun moyen de paiement</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez une carte bancaire pour effectuer vos réservations
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une carte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Moyens de paiement enregistrés</h2>
            
            {paymentMethods.map((method) => (
              <Card 
                key={method.id} 
                className={`transition-all hover:shadow-md ${
                  method.isDefault ? 'border-primary bg-primary/5' : ''
                } ${method.isExpired ? 'border-red-200 bg-red-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getPaymentIcon(method)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{method.name}</h4>
                          {method.isDefault && (
                            <Badge variant="default">
                              <Star className="w-3 h-3 mr-1" />
                              Par défaut
                            </Badge>
                          )}
                          {method.isExpired && (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expirée
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {method.type === 'card' ? (
                            <div>
                              <p>•••• •••• •••• {method.lastFour}</p>
                              <p>Expire le {method.expiryDate} • {method.details}</p>
                            </div>
                          ) : (
                            <p>{method.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && !method.isExpired && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAsDefault(method.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Définir par défaut
                        </Button>
                      )}
                      
                      {method.isExpired && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* TODO: Implement card update */}}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Mettre à jour
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setMethodToDelete(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Autres options de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Autres options</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-5 bg-blue-500 text-white text-xs font-bold flex items-center justify-center rounded">PP</div>
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-muted-foreground">Payez avec votre compte PayPal</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connecter
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-gray-900" />
                <div>
                  <p className="font-medium">Apple Pay</p>
                  <p className="text-sm text-muted-foreground">Paiement rapide avec Touch ID</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configurer
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Google Pay</p>
                  <p className="text-sm text-muted-foreground">Paiement avec votre compte Google</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configurer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog 
        open={!!methodToDelete} 
        onOpenChange={() => setMethodToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce moyen de paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Vous devrez ajouter à nouveau ce moyen 
              de paiement si vous souhaitez l'utiliser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => methodToDelete && deletePaymentMethod(methodToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default MoyensPaiement;