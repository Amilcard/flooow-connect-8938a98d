import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/domain";
import { Users, MapPin } from "lucide-react";
import { optimizeSupabaseImage } from "@/lib/imageMapping";

interface ActivityCardMobileProps {
  activity: Activity;
}

export const ActivityCardMobile = ({ activity }: ActivityCardMobileProps) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    navigate(`/activity/${activity.id}`);
  };

  const fallbackBg = "hsl(var(--primary-soft))";
  // PERF: Optimize Supabase images with transformations
  const imageUrl = optimizeSupabaseImage(activity.image, { width: 320, height: 570 }) || "";

  return (
    <div
      onClick={handleClick}
      className="aspect-[9/16] rounded-2xl overflow-hidden shadow-md bg-[hsl(var(--bg-surface))] relative cursor-pointer transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Voir l'activité ${activity.title}`}
    >
      {/* Image avec lazy loading */}
      {!imgError && imageUrl ? (
        <img
          src={imageUrl}
          alt={activity.title}
          loading="lazy"
          className="w-full h-full object-cover object-center"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: fallbackBg }}
          aria-label="Image non disponible"
        />
      )}

      {/* Gradient overlay bottom 42% */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "42%",
          background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
        }}
      />

      {/* Content zone */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
        {/* Title - 2 lines max */}
        <h3 className="font-semibold text-base line-clamp-2 mb-2">
          {activity.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 items-center text-sm text-white/90">
          {activity.category && (
            <Badge
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm text-white border-0"
            >
              {activity.category}
            </Badge>
          )}
          {activity.ageRange && (
            <span className="flex items-center gap-1">
              <Users size={14} />
              {activity.ageRange}
            </span>
          )}
          {activity.price !== undefined && (
            <span className="font-semibold">
              {activity.price === 0 ? "GRATUIT" : `${activity.price}€`}
            </span>
          )}
        </div>
      </div>

      {/* Floating CTA - bottom right, 44px touch target */}
      <Button
        size="sm"
        className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-sm min-w-[44px] min-h-[44px] pointer-events-auto"
        style={{
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--text-on-primary))",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        aria-label={`Voir les détails de ${activity.title}`}
      >
        Voir
      </Button>
    </div>
  );
};
