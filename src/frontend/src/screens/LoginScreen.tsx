import { Button } from "@/components/ui/button";
import { Leaf, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const setDemo = (role: string) => {
    localStorage.setItem("demoRole", role);
    window.location.reload();
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
          className="flex flex-col items-center gap-4 mb-12"
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
