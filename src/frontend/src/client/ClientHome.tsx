import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Bell,
  CreditCard,
  Leaf,
  Loader2,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  Package,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TileMap from "../components/TileMap";
import { useRequestTrip } from "../hooks/useQueries";
import EmergencyButton from "../shared/EmergencyButton";

const DEMO_DRIVERS = [
  {
    id: "d1",
    name: "Carlos Mendez",
    lat: 23.118,
    lng: -82.374,
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: "d2",
    name: "Maria Lopez",
    lat: 23.112,
    lng: -82.367,
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: "d3",
    name: "Pedro Garcia",
    lat: 23.122,
    lng: -82.358,
    rating: 4.7,
    isAvailable: true,
  },
  {
    id: "d4",
    name: "Ana Martinez",
    lat: 23.107,
    lng: -82.379,
    rating: 4.6,
    isAvailable: false,
  },
  {
    id: "d5",
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
type PickingMode = "origin" | "destination" | null;

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function geocodeAddress(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    format: "json",
    q: query,
    limit: "5",
    addressdetails: "0",
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "Accept-Language": "es" } },
  );
  if (!res.ok) return [];
  return res.json();
}

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

async function fetchOSRMRoute(
  origin: [number, number],
  dest: [number, number],
): Promise<{ polyline: [number, number][]; distanceKm: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number],
    );
    const distanceKm = route.distance / 1000;
    return { polyline: coords, distanceKm };
  } catch {
    return null;
  }
}

export default function ClientHome() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("pasajeros");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [drivers, setDrivers] = useState(DEMO_DRIVERS);
  const [price, setPrice] = useState<number | null>(null);
  const [estimatedKm, setEstimatedKm] = useState<number | null>(null);
  const [pickingMode, setPickingMode] = useState<PickingMode>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(
    null,
  );
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(
    null,
  );
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HAVANA_CENTER);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Search suggestions state
  const [originSuggestions, setOriginSuggestions] = useState<NominatimResult[]>(
    [],
  );
  const [destSuggestions, setDestSuggestions] = useState<NominatimResult[]>([]);
  const [searchingOrigin, setSearchingOrigin] = useState(false);
  const [searchingDest, setSearchingDest] = useState(false);
  const [showOriginSugg, setShowOriginSugg] = useState(false);
  const [showDestSugg, setShowDestSugg] = useState(false);

  const originDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestTrip = useRequestTrip();

  // Auto-detect GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords: [number, number] = [lat, lon];
        setOriginCoords(coords);
        setMapCenter(coords);
        const address = await reverseGeocode(lat, lon);
        setOrigin(address);
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
        setOriginCoords(coords);
        setMapCenter(coords);
        const address = await reverseGeocode(lat, lon);
        setOrigin(address);
        setOriginSuggestions([]);
        setGpsLoading(false);
        toast.success("Ubicación GPS detectada");
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

  // Animate driver positions
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

  // Fetch route when both coords available
  useEffect(() => {
    if (!originCoords || !destCoords) {
      setRoutePolyline(null);
      setPrice(null);
      setEstimatedKm(null);
      return;
    }
    setLoadingRoute(true);
    fetchOSRMRoute(originCoords, destCoords).then((result) => {
      setLoadingRoute(false);
      if (result) {
        setRoutePolyline(result.polyline);
        const km = Math.max(0.1, result.distanceKm);
        setEstimatedKm(Math.round(km * 10) / 10);
        const rate = serviceType === "carga" ? 500 : 400;
        setPrice(Math.round(km * rate));
      } else {
        // Fallback haversine
        const R = 6371;
        const dLat = ((destCoords[0] - originCoords[0]) * Math.PI) / 180;
        const dLng = ((destCoords[1] - originCoords[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((originCoords[0] * Math.PI) / 180) *
            Math.cos((destCoords[0] * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const km = Math.max(0.1, R * 2 * Math.asin(Math.sqrt(a)));
        setEstimatedKm(Math.round(km * 10) / 10);
        const rate = serviceType === "carga" ? 500 : 400;
        setPrice(Math.round(km * rate));
        setRoutePolyline([originCoords, destCoords]);
      }
    });
  }, [originCoords, destCoords, serviceType]);

  // Origin search debounced
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setOriginCoords(null);
    setShowOriginSugg(true);
    if (originDebounce.current) clearTimeout(originDebounce.current);
    if (val.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    originDebounce.current = setTimeout(async () => {
      setSearchingOrigin(true);
      const results = await geocodeAddress(`${val} Cuba`);
      setOriginSuggestions(results);
      setSearchingOrigin(false);
    }, 500);
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    setDestCoords(null);
    setShowDestSugg(true);
    if (destDebounce.current) clearTimeout(destDebounce.current);
    if (val.length < 3) {
      setDestSuggestions([]);
      return;
    }
    destDebounce.current = setTimeout(async () => {
      setSearchingDest(true);
      const results = await geocodeAddress(`${val} Cuba`);
      setDestSuggestions(results);
      setSearchingDest(false);
    }, 500);
  };

  const handleMapClick = (latlng: [number, number]) => {
    if (!pickingMode) return;
    const label = `Punto seleccionado (${latlng[0].toFixed(4)}, ${latlng[1].toFixed(4)})`;
    if (pickingMode === "origin") {
      setOriginCoords(latlng);
      setOrigin(label);
      setOriginSuggestions([]);
    } else {
      setDestCoords(latlng);
      setDestination(label);
      setDestSuggestions([]);
    }
    setPickingMode(null);
  };

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
          setOriginCoords(null);
          setDestCoords(null);
          setRoutePolyline(null);
        },
        onError: () => toast.error("Error al solicitar viaje"),
      },
    );
  };

  const userMarkerPosition = originCoords ?? mapCenter;

  const mapMarkers = [
    {
      id: "user",
      position: userMarkerPosition,
      color: "#1565C0",
      label: "\u2022",
      popupText: "Tu ubicaci\u00f3n",
    },
    ...drivers
      .filter((d) => d.isAvailable)
      .map((d) => ({
        id: d.id,
        position: [d.lat, d.lng] as [number, number],
        color: "#D32F2F",
        label: "\u{1F6B2}",
        popupText: `${d.name} \u2B50 ${d.rating}`,
      })),
    ...(originCoords
      ? [
          {
            id: "origin",
            position: originCoords,
            color: "#2E7D32",
            label: "A",
            popupText: "Origen",
          },
        ]
      : []),
    ...(destCoords
      ? [
          {
            id: "dest",
            position: destCoords,
            color: "#B71C1C",
            label: "B",
            popupText: "Destino",
          },
        ]
      : []),
  ];

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
        {/* Address inputs */}
        <div className="bg-card rounded-2xl shadow-card overflow-visible">
          {/* Origin row */}
          <div
            className={cn(
              "flex items-center px-4 py-3 border-b border-border gap-3 transition-all duration-200 relative",
              pickingMode === "origin" &&
                "bg-primary/5 ring-2 ring-primary ring-inset",
            )}
          >
            <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Origen — escribe o toca el mapa"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginSugg(true)}
                onBlur={() => setTimeout(() => setShowOriginSugg(false), 200)}
                className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                data-ocid="client.origin.input"
              />
              {/* Suggestions dropdown */}
              {showOriginSugg &&
                (originSuggestions.length > 0 || searchingOrigin) && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-xl border border-border z-50 mt-1 max-h-48 overflow-y-auto">
                    {searchingOrigin ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                      </div>
                    ) : (
                      originSuggestions.map((r) => (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: suggestion list
                        <div
                          key={r.display_name}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/5 border-b border-border last:border-0"
                          onMouseDown={() => {
                            setOrigin(r.display_name);
                            setOriginCoords([
                              Number.parseFloat(r.lat),
                              Number.parseFloat(r.lon),
                            ]);
                            setOriginSuggestions([]);
                            setShowOriginSugg(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Search className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="line-clamp-2 leading-tight">
                              {r.display_name}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>
            {origin && (
              <button
                type="button"
                onClick={() => {
                  setOrigin("");
                  setOriginCoords(null);
                  setOriginSuggestions([]);
                }}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* GPS button */}
            <button
              type="button"
              onClick={handleUseGPS}
              disabled={gpsLoading}
              title="Usar mi ubicación GPS"
              data-ocid="client.origin.gps_button"
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all whitespace-nowrap flex-shrink-0",
                originCoords
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
            <button
              type="button"
              onClick={() =>
                setPickingMode(pickingMode === "origin" ? null : "origin")
              }
              data-ocid="client.origin.map_button"
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all whitespace-nowrap flex-shrink-0",
                pickingMode === "origin"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              📍 Mapa
            </button>
          </div>

          {/* Destination row */}
          <div
            className={cn(
              "flex items-center px-4 py-3 gap-3 transition-all duration-200 relative",
              pickingMode === "destination" &&
                "bg-primary/5 ring-2 ring-primary ring-inset",
            )}
          >
            <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Destino — escribe o toca el mapa"
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                onFocus={() => setShowDestSugg(true)}
                onBlur={() => setTimeout(() => setShowDestSugg(false), 200)}
                className="w-full text-sm outline-none bg-transparent placeholder:text-muted-foreground"
                data-ocid="client.destination.input"
              />
              {showDestSugg &&
                (destSuggestions.length > 0 || searchingDest) && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-xl border border-border z-50 mt-1 max-h-48 overflow-y-auto">
                    {searchingDest ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                      </div>
                    ) : (
                      destSuggestions.map((r) => (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: suggestion list
                        <div
                          key={r.display_name}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/5 border-b border-border last:border-0"
                          onMouseDown={() => {
                            setDestination(r.display_name);
                            setDestCoords([
                              Number.parseFloat(r.lat),
                              Number.parseFloat(r.lon),
                            ]);
                            setDestSuggestions([]);
                            setShowDestSugg(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Search className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <span className="line-clamp-2 leading-tight">
                              {r.display_name}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>
            {destination && (
              <button
                type="button"
                onClick={() => {
                  setDestination("");
                  setDestCoords(null);
                  setDestSuggestions([]);
                }}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setPickingMode(
                  pickingMode === "destination" ? null : "destination",
                )
              }
              data-ocid="client.destination.map_button"
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all whitespace-nowrap flex-shrink-0",
                pickingMode === "destination"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              📍 Mapa
            </button>
          </div>
        </div>

        {/* Map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              <span className="text-primary font-bold">
                {availableDrivers.length}
              </span>{" "}
              conductores cercanos
            </span>
            <span className="text-xs text-muted-foreground">
              {loadingRoute ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Calculando
                  ruta...
                </span>
              ) : (
                "Arrastra para mover · ± para zoom"
              )}
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-card relative">
            {pickingMode && (
              <div
                className="absolute top-0 left-0 right-0 z-50 bg-primary text-primary-foreground text-center text-sm font-semibold py-2 px-3"
                style={{ pointerEvents: "none" }}
              >
                📍 Toca el mapa para seleccionar{" "}
                {pickingMode === "origin" ? "origen" : "destino"}
              </div>
            )}
            <TileMap
              center={mapCenter}
              zoom={14}
              height={300}
              markers={mapMarkers}
              onClick={pickingMode ? handleMapClick : undefined}
              crosshairCursor={!!pickingMode}
              routePolyline={routePolyline}
              routeDistanceKm={estimatedKm}
            />
          </div>
        </div>

        {/* Service type */}
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

        {/* Price estimate */}
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
                  Distancia por ruta
                </span>
                <span className="text-xs text-muted-foreground">
                  {estimatedKm} km × {serviceType === "carga" ? 500 : 400}{" "}
                  CUP/km
                </span>
              </div>
            )}
          </div>
        )}

        {/* Payment */}
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
