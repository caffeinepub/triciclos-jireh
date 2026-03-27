import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TripStatus } from "../backend.d";
import { useAllTrips } from "../hooks/useQueries";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  completed: { label: "Completado", variant: "default" },
  pending: { label: "Pendiente", variant: "outline" },
  accepted: { label: "Aceptado", variant: "secondary" },
  inProgress: { label: "En Curso", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const FILTERS = [
  "all",
  TripStatus.pending,
  TripStatus.accepted,
  TripStatus.inProgress,
  TripStatus.completed,
  TripStatus.cancelled,
];
const FILTER_LABELS: Record<string, string> = {
  all: "Todos",
  pending: "Pendiente",
  accepted: "Aceptado",
  inProgress: "En Curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default function AdminTripsScreen() {
  const { data: trips } = useAllTrips();
  const [filter, setFilter] = useState<string>("all");

  const allTrips = trips ?? [];
  const filtered =
    filter === "all" ? allTrips : allTrips.filter((t) => t.status === filter);

  return (
    <div className="space-y-4" data-ocid="admin.trips.section">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="rounded-full whitespace-nowrap text-xs"
            data-ocid={`admin.trips.${f}.tab`}
          >
            {FILTER_LABELS[f]}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="admin.trips.table">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                  data-ocid="admin.trips.empty_state"
                >
                  No hay viajes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((trip) => {
                const cfg = statusConfig[trip.status] ?? statusConfig.pending;
                return (
                  <TableRow
                    key={trip.id.toString()}
                    data-ocid="admin.trips.row"
                  >
                    <TableCell className="text-sm font-mono">
                      #{trip.id.toString()}
                    </TableCell>
                    <TableCell className="text-sm max-w-28 truncate">
                      {trip.origin}
                    </TableCell>
                    <TableCell className="text-sm max-w-28 truncate">
                      {trip.destination}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {trip.price.toLocaleString()} CUP
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
