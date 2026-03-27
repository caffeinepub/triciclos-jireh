import { cn } from "@/lib/utils";
import {
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminRatingsScreen from "./AdminRatingsScreen";
import AdminRevenueScreen from "./AdminRevenueScreen";
import AdminTripsScreen from "./AdminTripsScreen";
import AdminUsersScreen from "./AdminUsersScreen";

type AdminPage = "dashboard" | "users" | "trips" | "revenue" | "ratings";

const navItems = [
  { id: "dashboard" as AdminPage, label: "Dashboard", Icon: LayoutDashboard },
  { id: "users" as AdminPage, label: "Usuarios", Icon: Users },
  { id: "trips" as AdminPage, label: "Viajes", Icon: Route },
  { id: "revenue" as AdminPage, label: "Ingresos", Icon: DollarSign },
  { id: "ratings" as AdminPage, label: "Calificaciones", Icon: Star },
];

export default function AdminApp() {
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("demoRole");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex" data-ocid="admin.page">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/triciclos-logo-transparent.dim_120x120.png"
              alt="logo"
              className="w-8 h-8"
            />
            <span className="font-display font-bold text-sidebar-foreground">
              Admin Panel
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => {
                setActivePage(id);
                setSidebarOpen(false);
              }}
              data-ocid={`admin.${id}.link`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activePage === id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden w-full border-0 p-0"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            data-ocid="admin.menu.button"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground">
            {navItems.find((n) => n.id === activePage)?.label}
          </h1>
        </header>
        <div className="p-4">
          {activePage === "dashboard" && <AdminDashboard />}
          {activePage === "users" && <AdminUsersScreen />}
          {activePage === "trips" && <AdminTripsScreen />}
          {activePage === "revenue" && <AdminRevenueScreen />}
          {activePage === "ratings" && <AdminRatingsScreen />}
        </div>
      </main>
    </div>
  );
}
