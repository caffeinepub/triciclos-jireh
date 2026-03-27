import { Percent, Route, TrendingUp, Wallet } from "lucide-react";
import { TripStatus } from "../backend.d";
import { useAllTrips, useRevenueSummary } from "../hooks/useQueries";

const ADMIN_COMMISSION = 0.1;

const DEMO_TRIPS = [
  { id: 1, origin: "Habana Vieja", destination: "Vedado", price: 2800 },
  {
    id: 2,
    origin: "Terminal de Trenes",
    destination: "Hospital Calixto García",
    price: 1500,
  },
  {
    id: 3,
    origin: "Centro Habana",
    destination: "Aeropuerto José Martí",
    price: 4500,
  },
  {
    id: 5,
    origin: "Playa",
    destination: "Plaza de la Revolución",
    price: 3500,
  },
  { id: 6, origin: "Vedado", destination: "Miramar", price: 2200 },
];

export default function AdminRevenueScreen() {
  const { data: revenue } = useRevenueSummary();
  const { data: trips } = useAllTrips();

  const totalRevenue = revenue ?? 1285075;
  const completedTrips =
    trips?.filter((t) => t.status === TripStatus.completed).length ?? 284;
  const avgTripValue =
    completedTrips > 0 ? totalRevenue / completedTrips : 4525;
  const adminEarnings = totalRevenue * ADMIN_COMMISSION;

  const metrics = [
    {
      label: "Ingresos Totales",
      value: `${Math.round(totalRevenue).toLocaleString()} CUP`,
      Icon: Wallet,
      colorClass: "text-primary",
      bgClass: "bg-primary/5",
    },
    {
      label: "Ganancias Admin (10%)",
      value: `${Math.round(adminEarnings).toLocaleString()} CUP`,
      Icon: Percent,
      colorClass: "text-accent",
      bgClass: "bg-accent/5",
    },
    {
      label: "Viajes Completados",
      value: completedTrips,
      Icon: Route,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      label: "Valor Promedio/Viaje",
      value: `${Math.round(avgTripValue).toLocaleString()} CUP`,
      Icon: TrendingUp,
      colorClass: "text-yellow-600",
      bgClass: "bg-yellow-50",
    },
  ];

  const monthly = [
    { month: "Enero", amount: 820000 },
    { month: "Febrero", amount: 945000 },
    { month: "Marzo", amount: 1285000 },
  ];

  return (
    <div className="space-y-6" data-ocid="admin.revenue.section">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map(({ label, value, Icon, colorClass, bgClass }) => (
          <div key={label} className="bg-card rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}
              >
                <Icon className={`w-5 h-5 ${colorClass}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin earnings per trip */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">
            Comisión por Carrera (10%)
          </h2>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">
            Admin gana 10%
          </span>
        </div>
        <div className="space-y-3">
          {DEMO_TRIPS.map((trip) => {
            const commission = Math.round(trip.price * ADMIN_COMMISSION);
            return (
              <div
                key={trip.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
                data-ocid="admin.revenue.trip_row"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total carrera: {trip.price.toLocaleString()} CUP
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-sm font-bold text-primary">
                    +{commission.toLocaleString()} CUP
                  </p>
                  <p className="text-xs text-muted-foreground">comisión</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">
            Total comisiones (demo)
          </span>
          <span className="text-base font-bold text-primary">
            {DEMO_TRIPS.reduce(
              (sum, t) => sum + Math.round(t.price * ADMIN_COMMISSION),
              0,
            ).toLocaleString()}{" "}
            CUP
          </span>
        </div>
      </div>

      {/* Monthly revenue */}
      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Ingresos por Mes</h2>
        <div className="space-y-3">
          {monthly.map(({ month, amount }) => (
            <div key={month}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{month}</span>
                <div className="text-right">
                  <span className="font-semibold text-primary">
                    {amount.toLocaleString()} CUP
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    (Admin:{" "}
                    {Math.round(amount * ADMIN_COMMISSION).toLocaleString()}{" "}
                    CUP)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(amount / 1500000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
