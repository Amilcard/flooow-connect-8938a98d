import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Facebook, Twitter, Linkedin, Mail, Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ActivityShareData,
  shareOnFacebook,
  shareOnTwitter,
  shareOnLinkedIn,
  shareByEmail,
  copyActivityLink,
  shareWithWebAPI,
} from "@/lib/shareActivity";

interface ActivityShareButtonProps {
  activity: ActivityShareData;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export const ActivityShareButton = ({
  activity,
  variant = "outline",
  size = "default",
  className = "",
  showLabel = true,
}: ActivityShareButtonProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const success = await copyActivityLink(activity);
    if (success) {
      setLinkCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien de l'activité a été copié dans le presse-papier",
      });
      setTimeout(() => setLinkCopied(false), 3000);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleWebShare = async () => {
    const success = await shareWithWebAPI(activity);
    if (!success) {
      toast({
        description: "Le partage système n'est pas disponible sur cet appareil",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className={showLabel ? "mr-2" : ""} size={18} />
          {showLabel && "Partager"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleWebShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => shareOnFacebook(activity)}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnTwitter(activity)}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareOnLinkedIn(activity)}>
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareByEmail(activity)}>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {linkCopied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-600">Lien copié !</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copier le lien
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
