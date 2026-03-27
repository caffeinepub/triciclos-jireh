import { cn } from "@/lib/utils";
import { Bell, Clock, Home, User } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "../hooks/useQueries";
import ClientHome from "./ClientHome";
import ClientProfileScreen from "./ClientProfileScreen";
import NotificationsScreen from "./NotificationsScreen";
import TripHistoryScreen from "./TripHistoryScreen";

type Tab = "home" | "history" | "notifications" | "profile";

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const tabs = [
    { id: "home" as Tab, label: "Inicio", Icon: Home },
    { id: "history" as Tab, label: "Historial", Icon: Clock },
    {
      id: "notifications" as Tab,
      label: "Avisos",
      Icon: Bell,
      badge: unreadCount,
    },
    { id: "profile" as Tab, label: "Perfil", Icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 pb-20 overflow-y-auto">
        {activeTab === "home" && <ClientHome />}
        {activeTab === "history" && <TripHistoryScreen />}
        {activeTab === "notifications" && <NotificationsScreen />}
        {activeTab === "profile" && <ClientProfileScreen />}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
        <div className="flex">
          {tabs.map(({ id, label, Icon, badge }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              data-ocid={`client.${id}.tab`}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors relative",
                activeTab === id ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5"
                  strokeWidth={activeTab === id ? 2.5 : 2}
                />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "font-medium",
                  activeTab === id && "font-semibold",
                )}
              >
                {label}
              </span>
              {activeTab === id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
