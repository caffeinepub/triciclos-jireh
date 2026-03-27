import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Package,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TripStatus } from "../backend.d";
import type { Trip } from "../backend.d";
import TileMap from "../components/TileMap";
import {
  useAcceptTrip,
  useAllTrips,
  useCancelTrip,
  useUpdateDriverProfile,
} from "../hooks/useQueries";

const HAVANA_CENTER: [number, number] = [23.1136, -82.3666];

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: "16",
      addressdetails: "0",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      { headers: { "Accept-Language": "es" } },
    );
    if (!res.ok) return `Mi ubicación (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    const data = await res.json();
    return (
      data.display_name ?? `Mi ubicación (${lat.toFixed(4)}, ${lon.toFixed(4)})`
    );
  } catch {
    return `Mi ubicación (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }
}

export default function DriverDashboard() {
  const [available, setAvailable] = useState(true);
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(
    null,
  );
  const [driverAddress, setDriverAddress] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(HAVANA_CENTER);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: tripsData } = useAllTrips();
  const acceptTrip = useAcceptTrip();
  const cancelTrip = useCancelTrip();
  const updateProfile = useUpdateDriverProfile();

  const pendingTrips = tripsData
    ? tripsData.filter((t) => t.status === TripStatus.pending)
    : [];

  // Auto-detect GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords: [number, number] = [lat, lon];
        setDriverCoords(coords);
        setMapCenter(coords);
        const address = await reverseGeocode(lat, lon);
        setDriverAddress(address);
        setGpsLoading(false);
        toast.success("Ubicación GPS detectada");
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS no disponible en este dispositivo");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords: [number, number] = [lat, lon];
        setDriverCoords(coords);
        setMapCenter(coords);
        const address = await reverseGeocode(lat, lon);
        setDriverAddress(address);
        setGpsLoading(false);
        toast.success("Ubicación GPS actualizada");
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Permiso de GPS denegado. Actívalo en tu navegador.");
        } else {
          toast.error("No se pudo obtener la ubicación GPS");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

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

  const mapMarkers = [
    {
      id: "driver",
      position: driverCoords ?? mapCenter,
      color: "#D32F2F",
      label: "\u{1F6B2}",
      popupText: "Tu ubicación",
    },
  ];

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
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Hoy (CUP)</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-3 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">--</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-3 text-center">
            <CheckCircle className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Viajes</p>
          </div>
        </div>

        {/* GPS Location Card */}
        <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Tu ubicación
              </span>
            </div>
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={gpsLoading}
              data-ocid="driver.gps.button"
              className={cn(
                "flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all",
                driverCoords
                  ? "bg-green-600 text-white border-green-600"
                  : "border-border text-muted-foreground hover:border-green-600 hover:text-green-600",
              )}
            >
              {gpsLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LocateFixed className="w-3 h-3" />
              )}
              GPS
            </button>
          </div>
          {driverAddress && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {driverAddress}
            </p>
          )}
          <div className="rounded-xl overflow-hidden">
            <TileMap
              center={mapCenter}
              zoom={14}
              height={200}
              markers={mapMarkers}
            />
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
