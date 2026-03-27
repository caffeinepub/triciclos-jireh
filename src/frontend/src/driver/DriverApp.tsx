import { cn } from "@/lib/utils";
import { Clock, DollarSign, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import DriverDashboard from "./DriverDashboard";
import DriverProfileScreen from "./DriverProfileScreen";
import EarningsHistoryScreen from "./EarningsHistoryScreen";

type Tab = "dashboard" | "trips" | "earnings" | "profile";

export default function DriverApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs = [
    { id: "dashboard" as Tab, label: "Panel", Icon: LayoutDashboard },
    { id: "trips" as Tab, label: "Viajes", Icon: Clock },
    { id: "earnings" as Tab, label: "Ganancias", Icon: DollarSign },
    { id: "profile" as Tab, label: "Perfil", Icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 pb-20 overflow-y-auto">
        {activeTab === "dashboard" && <DriverDashboard />}
        {activeTab === "trips" && <EarningsHistoryScreen mode="trips" />}
        {activeTab === "earnings" && <EarningsHistoryScreen mode="earnings" />}
        {activeTab === "profile" && <DriverProfileScreen />}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              data-ocid={`driver.${id}.tab`}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors relative",
                activeTab === id ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={activeTab === id ? 2.5 : 2}
              />
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
