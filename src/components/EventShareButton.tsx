import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Link2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  shareOnFacebook,
  shareOnTwitter,
  shareOnLinkedIn,
  shareOnWhatsApp,
  shareByEmail,
  copyEventLink,
  shareWithWebAPI,
  type EventShareData,
} from '@/lib/shareEvent';

interface EventShareButtonProps {
  event: EventShareData;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const EventShareButton = ({ 
  event, 
  variant = 'outline', 
  size = 'sm',
  className 
}: EventShareButtonProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyEventLink(event);
    if (success) {
      setLinkCopied(true);
      toast.success('Lien copié dans le presse-papier');
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleWebShare = async () => {
    const success = await shareWithWebAPI(event);
    if (!success) {
      // Fallback si Web Share API n'est pas disponible
      toast.info('Utilisez les options ci-dessus pour partager');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <span className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {navigator.share && (
          <>
            <DropdownMenuItem onClick={handleWebShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => shareOnFacebook(event)}>
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => shareOnTwitter(event)}>
          <Twitter className="h-4 w-4 mr-2 text-sky-500" />
          Twitter / X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => shareOnLinkedIn(event)}>
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => shareOnWhatsApp(event)}>
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => shareByEmail(event)}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyLink}>
          {linkCopied ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          {linkCopied ? 'Lien copié !' : 'Copier le lien'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
