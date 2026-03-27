import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmergencyButton() {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    toast.error("🚨 Alerta de emergencia enviada. Contactando autoridades...", {
      duration: 5000,
    });
    setTimeout(() => setPressed(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      data-ocid="emergency.button"
      className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-modal transition-all ${
        pressed
          ? "bg-red-900 scale-95"
          : "bg-destructive hover:bg-red-900 animate-pulse-ring"
      }`}
      aria-label="Botón de emergencia"
    >
      <AlertTriangle className="w-6 h-6 text-primary-foreground" />
    </button>
  );
}
