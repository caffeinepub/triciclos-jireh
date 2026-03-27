import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bike, FileText, LogOut, Phone, Star } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export default function DriverProfileScreen() {
  const { data: profile } = useCallerProfile();
  const { clear } = useInternetIdentity();
  const demoRole = localStorage.getItem("demoRole");

  const handleLogout = () => {
    if (demoRole) {
      localStorage.removeItem("demoRole");
      window.location.reload();
    } else {
      clear();
    }
  };

  const name = profile?.name || "Conductor Demo";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background" data-ocid="driver.profile.page">
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
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">4.8</span>
              <span className="text-xs text-muted-foreground ml-1">
                (127 viajes)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card divide-y divide-border">
          {[
            {
              Icon: Phone,
              label: "Teléfono",
              value: profile?.phone || "+502 5555-9876",
            },
            {
              Icon: Bike,
              label: "Triciclo",
              value: "Modelo ECO-3 • Placa GT-001",
            },
            { Icon: FileText, label: "Licencia", value: "GT-2024-DRV-001" },
            { Icon: Star, label: "Calificación", value: "4.8 / 5.0 ⭐" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-destructive/30 text-destructive rounded-2xl"
          data-ocid="driver.profile.delete_button"
        >
          <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
