import { Button } from "@/components/ui/button";
import { Check, Copy, Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const baseUrl = window.location.origin + window.location.pathname;

const ROLE_LINKS = [
  {
    hash: "#/admin",
    label: "Administrador",
    emoji: "🛡️",
    description: "Panel de gestión y estadísticas",
    color: "bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-800",
    demoRole: "admin",
  },
  {
    hash: "#/cliente",
    label: "Cliente",
    emoji: "🧑",
    description: "Solicitar y gestionar viajes",
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    demoRole: "client",
  },
  {
    hash: "#/conductor",
    label: "Conductor",
    emoji: "🚲",
    description: "Aceptar viajes y ver ganancias",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    demoRole: "driver",
  },
];

export default function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const setDemo = (role: string) => {
    localStorage.setItem("demoRole", role);
    window.location.reload();
  };

  const copyLink = async (hash: string) => {
    const url = baseUrl + hash;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedHash(hash);
      toast.success("¡Enlace copiado!");
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div
      className="min-h-screen bg-primary flex flex-col"
      data-ocid="login.page"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <div className="w-24 h-24 bg-primary-foreground rounded-full flex items-center justify-center shadow-modal">
            <img
              src="/assets/generated/triciclos-logo-transparent.dim_120x120.png"
              alt="Triciclos Jireh"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-primary-foreground">
              Triciclos Jireh
            </h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Leaf className="w-4 h-4 text-green-300" />
              <p className="text-primary-foreground/80 text-sm">
                Transporte Ecológico
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* Login card */}
          <div className="bg-primary-foreground rounded-3xl p-6 shadow-modal space-y-4">
            <h2 className="text-lg font-semibold text-foreground text-center">
              Iniciar Sesión
            </h2>
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-2xl text-base"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Conectando...
                </>
              ) : (
                "🔐 Internet Identity"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-primary-foreground px-2 text-muted-foreground">
                  o modo demo
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setDemo("client")}
                className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
                data-ocid="login.secondary_button"
              >
                🧑 Demo Cliente
              </Button>
              <Button
                variant="outline"
                onClick={() => setDemo("driver")}
                className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
                data-ocid="login.secondary_button"
              >
                🚲 Demo Conductor
              </Button>
              <Button
                variant="outline"
                onClick={() => setDemo("admin")}
                className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/5"
                data-ocid="login.secondary_button"
              >
                🛡️ Demo Admin
              </Button>
            </div>
          </div>

          {/* Direct links card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary-foreground rounded-3xl p-6 shadow-modal space-y-3"
          >
            <div className="text-center">
              <h3 className="font-semibold text-foreground">
                🔗 Enlaces Directos
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Comparte estos enlaces para acceso directo por rol
              </p>
            </div>

            {ROLE_LINKS.map((link) => {
              const url = baseUrl + link.hash;
              const copied = copiedHash === link.hash;
              return (
                <div
                  key={link.hash}
                  className={`rounded-2xl border p-3 ${link.color}`}
                  data-ocid={`login.${link.demoRole}.card`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl flex-shrink-0">
                        {link.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {link.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${link.badgeColor}`}
                          >
                            {link.hash}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 truncate font-mono mt-0.5">
                          {url.length > 40 ? `...${url.slice(-38)}` : url}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyLink(link.hash)}
                      className="flex-shrink-0 p-2 rounded-xl hover:bg-black/5 transition-colors"
                      title="Copiar enlace"
                      data-ocid={`login.${link.demoRole}.button`}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      <div className="pb-8 text-center">
        <p className="text-primary-foreground/50 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
