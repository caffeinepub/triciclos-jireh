import { Percent, Route, TrendingUp, Wallet } from "lucide-react";
import { TripStatus } from "../backend.d";
import { useAllTrips, useRevenueSummary } from "../hooks/useQueries";

const ADMIN_COMMISSION = 0.1;

export default function AdminRevenueScreen() {
  const { data: revenue } = useRevenueSummary();
  const { data: trips } = useAllTrips();

  const totalRevenue = revenue ?? 0;
  const completedTrips =
    trips?.filter((t) => t.status === TripStatus.completed).length ?? 0;
  const avgTripValue = completedTrips > 0 ? totalRevenue / completedTrips : 0;
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

      <div className="bg-card rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">
            Comisión por Carrera (10%)
          </h2>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">
            Admin gana 10%
          </span>
        </div>
        {completedTrips === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay carreras completadas aún
          </div>
        ) : null}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Ingresos por Mes</h2>
        <div className="text-center py-8 text-muted-foreground text-sm">
          No hay datos de ingresos aún
        </div>
      </div>
    </div>
  );
}
