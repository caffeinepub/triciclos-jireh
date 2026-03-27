import { cn } from "@/lib/utils";
import { Bell, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "../backend.d";
import { useMarkNotificationRead, useNotifications } from "../hooks/useQueries";

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: BigInt(1),
    user: {} as any,
    message: "Tu conductor Carlos está a 2 minutos",
    read: false,
    createdAt: BigInt(Date.now() - 300000),
  },
  {
    id: BigInt(2),
    user: {} as any,
    message: "¡Viaje completado! Ganas 15 puntos de lealtad",
    read: false,
    createdAt: BigInt(Date.now() - 3600000),
  },
  {
    id: BigInt(3),
    user: {} as any,
    message: "Nuevo conductor disponible en tu zona",
    read: true,
    createdAt: BigInt(Date.now() - 86400000),
  },
  {
    id: BigInt(4),
    user: {} as any,
    message: "Promoción: 20% de descuento en tu próximo viaje",
    read: true,
    createdAt: BigInt(Date.now() - 172800000),
  },
];

export default function NotificationsScreen() {
  const { data: notifData } = useNotifications();
  const notifications =
    notifData && notifData.length > 0 ? notifData : DEMO_NOTIFICATIONS;
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (n: Notification) => {
    if (n.read) return;
    markRead.mutate(n.id, {
      onError: () => toast.error("Error al marcar notificación"),
    });
  };

  return (
    <div className="min-h-screen bg-background" data-ocid="notifications.page">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-lg font-display font-bold">Notificaciones</h1>
      </header>

      <div className="px-4 py-4 space-y-2">
        {notifications.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="notifications.empty_state"
          >
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <button
              type="button"
              key={n.id.toString()}
              onClick={() => handleMarkRead(n)}
              className={cn(
                "w-full text-left bg-card rounded-2xl shadow-card p-4 flex items-start gap-3 transition-opacity",
                n.read && "opacity-60",
              )}
              data-ocid={`notifications.item.${i + 1}`}
            >
              <div
                className={cn(
                  "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                  n.read ? "bg-muted" : "bg-primary",
                )}
              />
              <p
                className={cn(
                  "flex-1 text-sm",
                  !n.read && "font-semibold text-foreground",
                  n.read && "text-muted-foreground",
                )}
              >
                {n.message}
              </p>
              {!n.read && (
                <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
