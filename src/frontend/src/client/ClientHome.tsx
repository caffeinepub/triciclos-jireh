import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Bell,
  CreditCard,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { toast } from "sonner";
import { useRequestTrip } from "../hooks/useQueries";
import EmergencyButton from "../shared/EmergencyButton";
// Fix Leaflet default icons
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const redIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#D32F2F;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#1565C0;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const DEMO_DRIVERS = [
  {
    id: "1",
    name: "Carlos Mendez",
    lat: 23.118,
    lng: -82.374,
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Maria Lopez",
    lat: 23.112,
    lng: -82.367,
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: "3",
    name: "Pedro Garcia",
    lat: 23.122,
    lng: -82.358,
    rating: 4.7,
    isAvailable: true,
  },
  {
    id: "4",
    name: "Ana Martinez",
    lat: 23.107,
    lng: -82.379,
    rating: 4.6,
    isAvailable: false,
  },
  {
    id: "5",
    name: "Jose Hernandez",
    lat: 23.126,
    lng: -82.371,
    rating: 5.0,
    isAvailable: true,
  },
];

const HAVANA_CENTER: [number, number] = [23.1136, -82.3666];

type ServiceType = "pasajeros" | "carga";
type PaymentMethod = "cash" | "digital";

export default function ClientHome() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("pasajeros");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [drivers, setDrivers] = useState(DEMO_DRIVERS);
  const [userPos] = useState<[number, number]>(HAVANA_CENTER);
  const [price, setPrice] = useState<number | null>(null);
  const [estimatedKm, setEstimatedKm] = useState<number | null>(null);
  const requestTrip = useRequestTrip();

  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.001,
          lng: d.lng + (Math.random() - 0.5) * 0.001,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (origin && destination) {
      const km = 2 + Math.random() * 8;
      setEstimatedKm(Math.round(km * 10) / 10);
      const rate = serviceType === "carga" ? 500 : 400;
      setPrice(Math.round(km * rate));
    } else {
      setPrice(null);
      setEstimatedKm(null);
    }
  }, [origin, destination, serviceType]);

  const availableDrivers = drivers.filter((d) => d.isAvailable);

  const handleConfirm = () => {
    if (!destination) {
      toast.error("Ingresa el destino");
      return;
    }
    requestTrip.mutate(
      { destination, price: price ?? 800 },
      {
        onSuccess: () => {
          toast.success("¡Viaje solicitado! Buscando conductor...");
          setOrigin("");
          setDestination("");
          setPrice(null);
          setEstimatedKm(null);
        },
        onError: () => toast.error("Error al solicitar viaje"),
      },
    );
  };

  return (
    <div className="flex flex-col bg-background" data-ocid="client.home.page">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button
          type="button"
          className="p-1.5 rounded-lg"
          data-ocid="client.menu.button"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/triciclos-logo-transparent.dim_120x120.png"
            alt="logo"
            className="w-7 h-7"
          />
          <span className="font-display font-bold text-base">
            Triciclos Jireh
          </span>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg"
          data-ocid="client.notifications.button"
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-accent flex-shrink-0" />
        <p className="text-sm font-semibold text-foreground">
          ¡Pide tu Triciclo Ecológico en Segundos!
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-border gap-3">
            <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
            <input
              type="text"
              placeholder="Origen (tu ubicación)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
              data-ocid="client.origin.input"
            />
          </div>
          <div className="flex items-center px-4 py-3 gap-3">
            <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
            <input
              type="text"
              placeholder="¿A dónde vas?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
              data-ocid="client.destination.input"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              <span className="text-primary font-bold">
                {availableDrivers.length}
              </span>{" "}
              conductores cercanos
            </span>
            <span className="text-xs text-muted-foreground">
              Actualiza cada 5s
            </span>
          </div>
          <div
            className="rounded-2xl overflow-hidden shadow-card"
            style={{ height: 250 }}
          >
            <MapContainer
              center={HAVANA_CENTER}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                center={userPos}
                radius={100}
                pathOptions={{
                  color: "#1565C0",
                  fillColor: "#1565C0",
                  fillOpacity: 0.15,
                }}
              />
              <Marker position={userPos} icon={userIcon}>
                <Popup>Tu ubicación</Popup>
              </Marker>
              {drivers.map((d) => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={redIcon}>
                  <Popup>
                    <div>
                      <strong>{d.name}</strong>
                      <br />⭐ {d.rating} •{" "}
                      {d.isAvailable ? "Disponible" : "Ocupado"}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setServiceType("pasajeros")}
            data-ocid="client.pasajeros.tab"
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
              serviceType === "pasajeros"
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border text-foreground",
            )}
          >
            <Users className="w-6 h-6" />
            <span className="text-sm font-semibold">PASAJEROS</span>
            <span className="text-xs opacity-80">400 CUP/km</span>
          </button>
          <button
            type="button"
            onClick={() => setServiceType("carga")}
            data-ocid="client.carga.tab"
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
              serviceType === "carga"
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border text-foreground",
            )}
          >
            <Package className="w-6 h-6" />
            <span className="text-sm font-semibold">CARGA/ENVÍOS</span>
            <span className="text-xs opacity-80">500 CUP/km</span>
          </button>
        </div>

        {price !== null && (
          <div className="bg-primary/5 rounded-2xl px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Precio estimado
              </span>
              <span className="text-xl font-bold text-primary">
                {price.toLocaleString()} CUP
              </span>
            </div>
            {estimatedKm !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Distancia aprox.
                </span>
                <span className="text-xs text-muted-foreground">
                  {estimatedKm} km × {serviceType === "carga" ? 500 : 400}{" "}
                  CUP/km
                </span>
              </div>
            )}
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Método de pago
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPayment("cash")}
              data-ocid="client.cash.toggle"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                payment === "cash"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              <Banknote className="w-4 h-4" /> Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPayment("digital")}
              data-ocid="client.digital.toggle"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                payment === "digital"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              <CreditCard className="w-4 h-4" /> Digital
            </button>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={requestTrip.isPending}
          className="w-full bg-primary text-primary-foreground text-base font-bold py-4 rounded-full shadow-modal"
          data-ocid="client.confirm.primary_button"
        >
          {requestTrip.isPending ? "Solicitando..." : "CONFIRMAR SOLICITUD"}
        </Button>

        <div className="pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      <EmergencyButton />
    </div>
  );
}
