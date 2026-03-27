import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Gift,
  LogOut,
  Mail,
  Phone,
  Shield,
  Star,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export default function ClientProfileScreen() {
  const { data: profile } = useCallerProfile();
  const { clear, identity } = useInternetIdentity();
  const demoRole = localStorage.getItem("demoRole");

  const handleLogout = () => {
    if (demoRole) {
      localStorage.removeItem("demoRole");
      window.location.reload();
    } else {
      clear();
    }
  };

  const name = profile?.name || "Usuario Demo";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const principal = `${identity?.getPrincipal().toString().slice(0, 12)}...`;

  return (
    <div className="min-h-screen bg-background" data-ocid="profile.page">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-lg font-display font-bold">Mi Perfil</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{name}</h2>
            <p className="text-xs text-muted-foreground">
              {demoRole ? "modo demo" : principal}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {profile?.email || "demo@triciclos.gt"}
            </p>
          </div>
        </div>

        <div className="bg-primary rounded-2xl p-4 flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary-foreground" />
          <div>
            <p className="text-primary-foreground/70 text-xs">
              Puntos de Lealtad
            </p>
            <p className="text-2xl font-bold text-primary-foreground">
              {profile?.loyaltyPoints?.toString() || "250"} pts
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
          {[
            {
              Icon: Phone,
              label: "Teléfono",
              value: profile?.phone || "+502 5555-1234",
            },
            {
              Icon: Mail,
              label: "Correo",
              value: profile?.email || "demo@triciclos.gt",
            },
            { Icon: Star, label: "Calificación", value: "4.8 ⭐" },
            { Icon: Shield, label: "Cuenta", value: "Cliente Verificado" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-destructive/30 text-destructive rounded-2xl"
          data-ocid="profile.delete_button"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
