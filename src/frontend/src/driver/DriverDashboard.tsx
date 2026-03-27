import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  MapPin,
  Navigation,
  Package,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TripStatus } from "../backend.d";
import type { Trip } from "../backend.d";
import {
  useAcceptTrip,
  useAllTrips,
  useCancelTrip,
  useUpdateDriverProfile,
} from "../hooks/useQueries";

const DEMO_REQUESTS: Trip[] = [
  {
    id: BigInt(10),
    client: {} as any,
    driver: {} as any,
    origin: "Habana Vieja - Obispo",
    destination: "Vedado, Calle 23",
    price: 2000,
    status: TripStatus.pending,
    createdAt: BigInt(Date.now() - 120000),
  },
  {
    id: BigInt(11),
    client: {} as any,
    driver: {} as any,
    origin: "Terminal de Ómnibus",
    destination: "Hospital Hermanos Ameijeiras",
    price: 1600,
    status: TripStatus.pending,
    createdAt: BigInt(Date.now() - 300000),
  },
  {
    id: BigInt(12),
    client: {} as any,
    driver: {} as any,
    origin: "Miramar, 5ta Avenida",
    destination: "Aeropuerto José Martí",
    price: 4500,
    status: TripStatus.pending,
    createdAt: BigInt(Date.now() - 60000),
  },
];

export default function DriverDashboard() {
  const [available, setAvailable] = useState(true);
  const { data: tripsData } = useAllTrips();
  const acceptTrip = useAcceptTrip();
  const cancelTrip = useCancelTrip();
  const updateProfile = useUpdateDriverProfile();

  const pendingTrips =
    tripsData && tripsData.length > 0
      ? tripsData.filter((t) => t.status === TripStatus.pending)
      : DEMO_REQUESTS;

  const handleToggleAvailability = (val: boolean) => {
    setAvailable(val);
    updateProfile.mutate({ isAvailable: val } as any, { onError: () => {} });
  };

  const handleAccept = (trip: Trip) => {
    acceptTrip.mutate(trip.id, {
      onSuccess: () => toast.success(`Viaje aceptado: ${trip.destination}`),
      onError: () => toast.error("Error al aceptar"),
    });
  };

  const handleReject = (trip: Trip) => {
    cancelTrip.mutate(trip.id, {
      onSuccess: () => toast.info("Viaje rechazado"),
      onError: () => toast.error("Error al rechazar"),
    });
  };

  return (
    <div
      className="min-h-screen bg-background"
      data-ocid="driver.dashboard.page"
    >
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-display font-bold">
            Panel del Conductor
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-foreground/70">
              {available ? "Disponible" : "No disponible"}
            </span>
            <Switch
              checked={available}
              onCheckedChange={handleToggleAvailability}
              data-ocid="driver.availability.switch"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl shadow-card p-3 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">14 500</p>
            <p className="text-xs text-muted-foreground">Hoy (CUP)</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-3 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-3 text-center">
            <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">127</p>
            <p className="text-xs text-muted-foreground">Viajes</p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-2xl p-4 flex items-center gap-3",
            available
              ? "bg-green-50 border border-green-200"
              : "bg-gray-100 border border-border",
          )}
        >
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              available ? "bg-green-500 animate-pulse" : "bg-gray-400",
            )}
          />
          <div>
            <p
              className={cn(
                "font-semibold text-sm",
                available ? "text-green-700" : "text-gray-600",
              )}
            >
              {available ? "Estás Disponible" : "No disponible"}
            </p>
            <p className="text-xs text-muted-foreground">
              {available
                ? "Recibirás solicitudes de viaje"
                : "Activa para recibir viajes"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">
            Solicitudes de Viaje
          </h2>
          {pendingTrips.length === 0 ? (
            <div
              className="text-center py-10 bg-card rounded-2xl"
              data-ocid="driver.trips.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No hay solicitudes pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTrips.map((trip, i) => (
                <div
                  key={trip.id.toString()}
                  className="bg-card rounded-2xl shadow-card p-4"
                  data-ocid={`driver.trip.item.${i + 1}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                      {i % 2 === 0 ? (
                        <>
                          <Users className="w-3 h-3 inline mr-1" />
                          Pasajero
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3 inline mr-1" />
                          Carga
                        </>
                      )}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {trip.price.toLocaleString()} CUP
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-xs line-clamp-1">
                        {trip.origin}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs font-medium text-foreground line-clamp-1">
                        {trip.destination}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReject(trip)}
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl border-destructive/30 text-destructive"
                      data-ocid={`driver.trip.delete_button.${i + 1}`}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                    </Button>
                    <Button
                      onClick={() => handleAccept(trip)}
                      size="sm"
                      className="flex-1 rounded-xl bg-primary text-primary-foreground"
                      data-ocid={`driver.trip.primary_button.${i + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aceptar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
