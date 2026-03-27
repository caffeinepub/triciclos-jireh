import { Activity, Route, Star, TrendingUp, Users, Wallet } from "lucide-react";
import { TripStatus } from "../backend.d";
import {
  useAllRatings,
  useAllTrips,
  useAllUsers,
  useRevenueSummary,
} from "../hooks/useQueries";

export default function AdminDashboard() {
  const { data: trips } = useAllTrips();
  const { data: users } = useAllUsers();
  const { data: revenue } = useRevenueSummary();
  const { data: ratings } = useAllRatings();

  const activeTrips =
    trips?.filter(
      (t) =>
        t.status === TripStatus.inProgress || t.status === TripStatus.accepted,
    ).length ?? 0;
  const totalUsers = users?.length ?? 0;
  const totalRevenue = revenue ?? 0;
  const totalRatings = ratings?.length ?? 0;
  const avgRating =
    ratings && ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + Number(r.score), 0) / ratings.length
        ).toFixed(1)
      : "0.0";

  const stats = [
    {
      label: "Usuarios Totales",
      value: totalUsers,
      Icon: Users,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      label: "Viajes Activos",
      value: activeTrips,
      Icon: Activity,
      colorClass: "text-primary",
      bgClass: "bg-primary/5",
    },
    {
      label: "Ingresos (CUP)",
      value: `${Math.round(totalRevenue).toLocaleString()} CUP`,
      Icon: Wallet,
      colorClass: "text-accent",
      bgClass: "bg-accent/5",
    },
    {
      label: "Calificaciones",
      value: `${totalRatings} (${avgRating}⭐)`,
      Icon: Star,
      colorClass: "text-yellow-600",
      bgClass: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="admin.dashboard.section">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map(({ label, value, Icon, colorClass, bgClass }) => (
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
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Actividad Reciente</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground text-sm">
          No hay actividad reciente
        </div>
      </div>
    </div>
  );
}
