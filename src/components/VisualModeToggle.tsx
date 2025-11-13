import { LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const VisualModeToggle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const visualMode = searchParams.get("visual") === "true";

  if (!isMobile) return null;

  const toggleVisualMode = () => {
    const newParams = new URLSearchParams(searchParams);
    if (visualMode) {
      newParams.delete("visual");
    } else {
      newParams.set("visual", "true");
    }
    setSearchParams(newParams);
  };

  return (
    <button
      onClick={toggleVisualMode}
      className="fixed bottom-5 left-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      aria-label={visualMode ? "Mode liste" : "Mode visuel"}
      style={{
        boxShadow: "0 4px 16px rgba(74, 144, 226, 0.3)"
      }}
    >
      {visualMode ? (
        <List className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      ) : (
        <LayoutGrid className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      )}
    </button>
  );
};

export default VisualModeToggle;
