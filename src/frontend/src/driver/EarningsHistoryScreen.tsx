import { cn } from "@/lib/utils";
import { Clock, MapPin, Navigation } from "lucide-react";
import { TripStatus } from "../backend.d";
import { useDriverTrips } from "../hooks/useQueries";

interface Props {
  mode: "trips" | "earnings";
}

export default function EarningsHistoryScreen({ mode }: Props) {
  const { data: tripsData } = useDriverTrips();
  const trips = tripsData
    ? tripsData.filter((t) => t.status === TripStatus.completed)
    : [];

  const totalEarnings = trips.reduce((sum, t) => sum + t.price * 0.9, 0);

  return (
    <div
      className="min-h-screen bg-background"
      data-ocid={`driver.${mode}.page`}
    >
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-lg font-display font-bold">
          {mode === "earnings" ? "Mis Ganancias" : "Mis Viajes"}
        </h1>
      </header>

      {mode === "earnings" && (
        <div className="mx-4 mt-4 bg-card rounded-2xl shadow-card p-5">
          <p className="text-xs text-muted-foreground mb-1">
            Total Ganado (mes)
          </p>
          <p className="text-3xl font-bold text-primary">
            {Math.round(totalEarnings).toLocaleString()} CUP
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            90% del precio del viaje (admin recibe 10%)
          </p>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {trips.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid={`driver.${mode}.empty_state`}
          >
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay viajes completados</p>
          </div>
        ) : (
          trips.map((trip, i) => (
            <div
              key={trip.id.toString()}
              className="bg-card rounded-2xl shadow-card p-4"
              data-ocid={`driver.${mode}.item.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Viaje #{trip.id.toString()}
                </span>
                <span
                  className={cn(
                    "font-bold",
                    mode === "earnings" ? "text-accent" : "text-primary",
                  )}
                >
                  {mode === "earnings"
                    ? `${Math.round(trip.price * 0.9).toLocaleString()} CUP`
                    : `${trip.price.toLocaleString()} CUP`}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span className="truncate">{trip.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Navigation className="w-3 h-3 text-primary" />
                  <span className="truncate">{trip.destination}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
