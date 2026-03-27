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
import type { Trip } from "../backend.d";
import { useAllTrips } from "../hooks/useQueries";

const DEMO_TRIPS: Trip[] = [
  {
    id: BigInt(1),
    client: {} as any,
    driver: {} as any,
    origin: "Habana Vieja",
    destination: "Vedado",
    price: 2800,
    status: TripStatus.completed,
    createdAt: BigInt(Date.now() - 3600000),
  },
  {
    id: BigInt(2),
    client: {} as any,
    driver: {} as any,
    origin: "Terminal de Trenes",
    destination: "Hospital Calixto García",
    price: 1500,
    status: TripStatus.inProgress,
    createdAt: BigInt(Date.now() - 1800000),
  },
  {
    id: BigInt(3),
    client: {} as any,
    driver: {} as any,
    origin: "Centro Habana",
    destination: "Aeropuerto José Martí",
    price: 4500,
    status: TripStatus.pending,
    createdAt: BigInt(Date.now() - 600000),
  },
  {
    id: BigInt(4),
    client: {} as any,
    driver: {} as any,
    origin: "Universidad de La Habana",
    destination: "Miramar",
    price: 1200,
    status: TripStatus.cancelled,
    createdAt: BigInt(Date.now() - 7200000),
  },
  {
    id: BigInt(5),
    client: {} as any,
    driver: {} as any,
    origin: "Playa",
    destination: "Plaza de la Revolución",
    price: 3500,
    status: TripStatus.accepted,
    createdAt: BigInt(Date.now() - 900000),
  },
];

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
  const { data: tripsData } = useAllTrips();
  const trips = tripsData && tripsData.length > 0 ? tripsData : DEMO_TRIPS;
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? trips : trips.filter((t) => t.status === filter);

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
