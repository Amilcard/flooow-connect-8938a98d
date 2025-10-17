import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, Building2, Send } from "lucide-react";

interface ContactOrganizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  activityTitle: string;
}

export const ContactOrganizerModal = ({
  open,
  onOpenChange,
  organizerName,
  organizerEmail,
  organizerPhone,
  activityTitle
}: ContactOrganizerModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending email (in production, this would call an edge function)
    try {
      // Format email body
      const subject = encodeURIComponent(`Question sur l'activité: ${activityTitle}`);
      const body = encodeURIComponent(
        `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone}\n\nMessage:\n${message}`
      );
      
      // Open email client with pre-filled information
      window.location.href = `mailto:${organizerEmail}?subject=${subject}&body=${body}`;
      
      toast.success("Votre demande a été préparée. Votre client email va s'ouvrir.");
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Contacter l'organisme
          </DialogTitle>
          <DialogDescription>
            Posez vos questions à propos de "{activityTitle}"
          </DialogDescription>
        </DialogHeader>

        {/* Organizer Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-medium">{organizerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${organizerEmail}`} className="hover:underline">
              {organizerEmail}
            </a>
          </div>
          {organizerPhone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <a href={`tel:${organizerPhone}`} className="hover:underline">
                {organizerPhone}
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Votre nom *</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom Nom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Votre email *</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Votre téléphone</Label>
            <Input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Votre question *</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre question..."
              rows={5}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
