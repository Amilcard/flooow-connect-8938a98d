import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Leaflet icons fix (MUST be imported before any map component renders)
import "./utils/leafletIconFix";

createRoot(document.getElementById("root")!).render(<App />);
