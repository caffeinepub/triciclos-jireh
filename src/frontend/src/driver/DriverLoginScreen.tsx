import { Eye, EyeOff, Lock, Truck } from "lucide-react";
import { useState } from "react";

const DRIVER_CODE = "Conductor2025";

interface DriverLoginScreenProps {
  onSuccess: () => void;
}

export default function DriverLoginScreen({
  onSuccess,
}: DriverLoginScreenProps) {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === DRIVER_CODE) {
      sessionStorage.setItem("driverAuthorized", "true");
      onSuccess();
    } else {
      setError("Código incorrecto. Inténtalo de nuevo.");
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center gap-6 ${
          shake ? "animate-shake" : ""
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <Truck className="w-8 h-8 text-green-600" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">
            Panel de Conductores
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Introduce el código de conductor para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showCode ? "text" : "password"}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Código secreto"
              className="w-full pl-9 pr-10 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 text-center tracking-widest text-lg"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Acceder
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Triciclos Jireh · Solo conductores autorizados
        </p>
      </div>
    </div>
  );
}
