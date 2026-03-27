import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AdminApp from "./admin/AdminApp";
import ClientApp from "./client/ClientApp";
import DriverApp from "./driver/DriverApp";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import LoginScreen from "./screens/LoginScreen";

type AppRole = "client" | "driver" | "admin" | null;

// Handle hash-based role routing on first load
const hash = window.location.hash;
if (hash === "#/admin") {
  localStorage.setItem("demoRole", "admin");
} else if (hash === "#/cliente") {
  localStorage.setItem("demoRole", "client");
} else if (hash === "#/conductor") {
  localStorage.setItem("demoRole", "driver");
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [role, setRole] = useState<AppRole>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const demoRole = localStorage.getItem("demoRole") as AppRole | null;

  useEffect(() => {
    if (demoRole) return;
    if (!actor || isFetching) return;
    if (!identity) return;

    setRoleLoading(true);
    actor
      .getCallerUserRole()
      .then((r) => {
        if (r === "admin") setRole("admin");
        else setRole("client");
      })
      .catch(() => setRole("client"))
      .finally(() => setRoleLoading(false));
  }, [actor, isFetching, identity, demoRole]);

  if (isInitializing || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando Triciclos Jireh...</p>
        </div>
      </div>
    );
  }

  const effectiveRole: AppRole = demoRole || (identity ? role : null);

  if (!effectiveRole) {
    return (
      <>
        <LoginScreen />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {effectiveRole === "admin" && <AdminApp />}
      {effectiveRole === "driver" && <DriverApp />}
      {effectiveRole === "client" && <ClientApp />}
      <Toaster />
    </>
  );
}
