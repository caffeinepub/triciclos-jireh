import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Navigation, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TripStatus } from "../backend.d";
import type { Trip } from "../backend.d";
import { useClientTrips, useSubmitRating } from "../hooks/useQueries";

const DEMO_TRIPS: Trip[] = [
  {
    id: BigInt(1),
    client: {} as any,
    driver: {} as any,
    origin: "Habana Vieja, Obispo",
    destination: "Mercado Cuatro Caminos",
    price: 1200,
    status: TripStatus.completed,
    createdAt: BigInt(Date.now() - 86400000),
  },
  {
    id: BigInt(2),
    client: {} as any,
    driver: {} as any,
    origin: "Centro Habana",
    destination: "Universidad de La Habana",
    price: 2000,
    status: TripStatus.completed,
    createdAt: BigInt(Date.now() - 172800000),
  },
  {
    id: BigInt(3),
    client: {} as any,
    driver: {} as any,
    origin: "Vedado",
    destination: "Aeropuerto José Martí",
    price: 4000,
    status: TripStatus.cancelled,
    createdAt: BigInt(Date.now() - 259200000),
  },
  {
    id: BigInt(4),
    client: {} as any,
    driver: {} as any,
    origin: "Miramar",
    destination: "Plaza de la Revolución",
    price: 2500,
    status: TripStatus.inProgress,
    createdAt: BigInt(Date.now() - 3600000),
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Completado", className: "bg-green-100 text-green-700" },
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "Aceptado", className: "bg-blue-100 text-blue-700" },
  inProgress: { label: "En Curso", className: "bg-primary/10 text-primary" },
  cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-500" },
};

export default function TripHistoryScreen() {
  const { data: tripsData } = useClientTrips();
  const trips = tripsData && tripsData.length > 0 ? tripsData : DEMO_TRIPS;
  const [ratingTrip, setRatingTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const submitRating = useSubmitRating();

  const handleSubmitRating = () => {
    if (!ratingTrip) return;
    submitRating.mutate(
      {
        tripId: ratingTrip.id,
        driverId: ratingTrip.driver,
        score: rating,
        comment,
      },
      {
        onSuccess: () => {
          toast.success("¡Gracias por tu calificación!");
          setRatingTrip(null);
          setComment("");
          setRating(5);
        },
        onError: () => toast.error("Error al calificar"),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background" data-ocid="history.page">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-lg font-display font-bold">Historial de Viajes</h1>
      </header>

      <div className="px-4 py-4 space-y-3">
        {trips.length === 0 ? (
          <div className="text-center py-16" data-ocid="history.empty_state">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay viajes aún</p>
          </div>
        ) : (
          trips.map((trip, i) => {
            const cfg = statusConfig[trip.status] ?? statusConfig.pending;
            return (
              <div
                key={trip.id.toString()}
                className="bg-card rounded-2xl shadow-card p-4"
                data-ocid={`history.item.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      cfg.className,
                    )}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-base font-bold text-primary">
                    {trip.price.toLocaleString()} CUP
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="truncate">{trip.origin || "Origen"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Navigation className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </div>
                </div>
                {trip.status === TripStatus.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRatingTrip(trip)}
                    className="mt-3 w-full rounded-xl border-primary/30 text-primary text-xs"
                    data-ocid={`history.edit_button.${i + 1}`}
                  >
                    <Star className="w-3.5 h-3.5 mr-1" /> Calificar conductor
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!ratingTrip} onOpenChange={() => setRatingTrip(null)}>
        <DialogContent
          className="rounded-3xl max-w-sm mx-auto"
          data-ocid="rating.dialog"
        >
          <DialogHeader>
            <DialogTitle>Calificar Conductor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button type="button" key={s} onClick={() => setRating(s)}>
                  <Star
                    className={cn(
                      "w-8 h-8",
                      s <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300",
                    )}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe un comentario (opcional)"
              className="w-full border border-border rounded-xl p-3 text-sm resize-none outline-none"
              rows={3}
              data-ocid="rating.textarea"
            />
            <Button
              onClick={handleSubmitRating}
              disabled={submitRating.isPending}
              className="w-full bg-primary text-primary-foreground rounded-xl"
              data-ocid="rating.submit_button"
            >
              Enviar Calificación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
