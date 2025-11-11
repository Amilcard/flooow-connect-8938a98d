import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpFloatingButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/faq")}
      className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[#5C7CFA] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
      aria-label="Aide et support"
      style={{
        boxShadow: "0 4px 16px rgba(74, 144, 226, 0.3)"
      }}
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
};

export default HelpFloatingButton;
