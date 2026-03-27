import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, ChevronUp, Copy, Leaf } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const baseUrl = window.location.origin + window.location.pathname;

type Role = "client" | "driver" | "admin";

interface RoleCard {
  role: Role;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  hash: string;
  bg: string;
  border: string;
  btnClass: string;
  iconBg: string;
}

const ROLES: RoleCard[] = [
  {
    role: "client",
    label: "Cliente",
    emoji: "🧑",
    tagline: "Solicita tu viaje",
    description:
      "Pide un triciclo, sigue tu ruta en tiempo real y paga en CUP.",
    hash: "#/cliente",
    bg: "bg-white",
    border: "border-red-200",
    btnClass: "bg-red-600 hover:bg-red-700 text-white",
    iconBg: "bg-red-50",
  },
  {
    role: "driver",
    label: "Conductor",
    emoji: "🚲",
    tagline: "Acepta viajes y gana",
    description:
      "Recibe solicitudes, acepta carreras y cobra el 90% de cada viaje.",
    hash: "#/conductor",
    bg: "bg-white",
    border: "border-green-200",
    btnClass: "bg-green-600 hover:bg-green-700 text-white",
    iconBg: "bg-green-50",
  },
  {
    role: "admin",
    label: "Administrador",
    emoji: "🛡️",
    tagline: "Gestiona la plataforma",
    description:
      "Supervisa viajes, conductores y estadísticas. Recibe el 10% de comisión.",
    hash: "#/admin",
    bg: "bg-white",
    border: "border-amber-200",
    btnClass: "bg-amber-500 hover:bg-amber-600 text-white",
    iconBg: "bg-amber-50",
  },
];

const LINK_COLORS: Record<Role, { color: string; badge: string }> = {
  client: {
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  driver: {
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
  },
  admin: {
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
};

function getPreselectedRole(): Role | null {
  const hash = window.location.hash;
  if (hash === "#/cliente") return "client";
  if (hash === "#/conductor") return "driver";
  if (hash === "#/admin") return "admin";
  return null;
}

interface FormState {
  name: string;
  phone: string;
  tricycleNumber: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  tricycleNumber?: string;
}

export default function LoginScreen() {
  const preselected = getPreselectedRole();
  const [selectedRole, setSelectedRole] = useState<Role | null>(preselected);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    tricycleNumber: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [linksOpen, setLinksOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    if (preselected) {
      // Small delay to allow page to render before scrolling
      setTimeout(() => {
        document
          .getElementById(`role-card-${preselected}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [preselected]);

  const selectRole = (role: Role) => {
    if (selectedRole === role) {
      setSelectedRole(null);
      setErrors({});
    } else {
      setSelectedRole(role);
      setErrors({});
      setForm({ name: "", phone: "", tricycleNumber: "" });
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.phone.trim()) e.phone = "El teléfono es obligatorio";
    else if (!/^[0-9+\-\s]{6,15}$/.test(form.phone.trim()))
      e.phone = "Teléfono inválido";
    if (selectedRole === "driver" && !form.tricycleNumber.trim()) {
      e.tricycleNumber = "El número de triciclo es obligatorio";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !validate()) return;
    localStorage.setItem("demoRole", selectedRole);
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        name: form.name.trim(),
        phone: form.phone.trim(),
        ...(selectedRole === "driver"
          ? { tricycleNumber: form.tricycleNumber.trim() }
          : {}),
      }),
    );
    window.location.reload();
  };

  const copyLink = async (hash: string) => {
    const url = baseUrl + hash;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedHash(hash);
      toast.success("¡Enlace copiado!");
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <div
      className="min-h-screen bg-primary flex flex-col"
      data-ocid="login.page"
    >
      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-modal">
            <img
              src="/assets/generated/triciclos-logo-transparent.dim_120x120.png"
              alt="Triciclos Jireh"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-white">
              Triciclos Jireh
            </h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Leaf className="w-4 h-4 text-green-300" />
              <p className="text-white/80 text-sm">
                Transporte Ecológico en Cuba
              </p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/90 text-center text-base font-medium mb-6"
        >
          ¿Cómo quieres registrarte?
        </motion.p>

        {/* Role Cards */}
        <div className="w-full max-w-sm space-y-3">
          {ROLES.map((card, idx) => {
            const isOpen = selectedRole === card.role;
            return (
              <motion.div
                key={card.role}
                id={`role-card-${card.role}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.1 }}
              >
                <div
                  className={`rounded-3xl border-2 overflow-hidden shadow-card transition-all duration-200 ${
                    isOpen
                      ? `${card.border} ${card.bg}`
                      : "border-white/20 bg-white/10"
                  }`}
                >
                  {/* Card header — always visible */}
                  <button
                    type="button"
                    onClick={() => selectRole(card.role)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
                    data-ocid={`login.${card.role}.button`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        isOpen ? card.iconBg : "bg-white/15"
                      }`}
                    >
                      {card.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-lg leading-tight ${
                          isOpen ? "text-foreground" : "text-white"
                        }`}
                      >
                        {card.label}
                      </p>
                      <p
                        className={`text-sm ${
                          isOpen ? "text-muted-foreground" : "text-white/75"
                        }`}
                      >
                        {card.tagline}
                      </p>
                    </div>
                    <span
                      className={
                        isOpen ? "text-muted-foreground" : "text-white/60"
                      }
                    >
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </span>
                  </button>

                  {/* Expandable registration form */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="form"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <form
                          onSubmit={handleSubmit}
                          className="px-5 pb-5 space-y-4"
                        >
                          <p className="text-sm text-muted-foreground">
                            {card.description}
                          </p>

                          <div className="space-y-1">
                            <Label
                              htmlFor="reg-name"
                              className="text-sm font-medium text-foreground"
                            >
                              Nombre completo
                            </Label>
                            <Input
                              id="reg-name"
                              type="text"
                              placeholder="Ej: Juan García"
                              value={form.name}
                              onChange={(e) =>
                                setForm((p) => ({ ...p, name: e.target.value }))
                              }
                              className="rounded-2xl h-12 text-base"
                              data-ocid="login.name.input"
                            />
                            {errors.name && (
                              <p
                                className="text-red-500 text-xs mt-1"
                                data-ocid="login.name.error_state"
                              >
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor="reg-phone"
                              className="text-sm font-medium text-foreground"
                            >
                              Teléfono
                            </Label>
                            <Input
                              id="reg-phone"
                              type="tel"
                              placeholder="Ej: 5312345678"
                              value={form.phone}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              className="rounded-2xl h-12 text-base"
                              data-ocid="login.phone.input"
                            />
                            {errors.phone && (
                              <p
                                className="text-red-500 text-xs mt-1"
                                data-ocid="login.phone.error_state"
                              >
                                {errors.phone}
                              </p>
                            )}
                          </div>

                          {card.role === "driver" && (
                            <div className="space-y-1">
                              <Label
                                htmlFor="reg-tricycle"
                                className="text-sm font-medium text-foreground"
                              >
                                Número de triciclo
                              </Label>
                              <Input
                                id="reg-tricycle"
                                type="text"
                                placeholder="Ej: TJ-001"
                                value={form.tricycleNumber}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    tricycleNumber: e.target.value,
                                  }))
                                }
                                className="rounded-2xl h-12 text-base"
                                data-ocid="login.tricycle.input"
                              />
                              {errors.tricycleNumber && (
                                <p
                                  className="text-red-500 text-xs mt-1"
                                  data-ocid="login.tricycle.error_state"
                                >
                                  {errors.tricycleNumber}
                                </p>
                              )}
                            </div>
                          )}

                          <Button
                            type="submit"
                            className={`w-full h-12 rounded-2xl text-base font-bold ${card.btnClass}`}
                            data-ocid="login.register.submit_button"
                          >
                            Registrarme como {card.label}
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Direct links — collapsible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm mt-6"
        >
          <button
            type="button"
            onClick={() => setLinksOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white/90 text-sm font-medium"
            data-ocid="login.links.toggle"
          >
            <span>🔗 Ver enlaces directos por rol</span>
            {linksOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {linksOpen && (
              <motion.div
                key="links"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div className="bg-white rounded-3xl p-4 mt-2 space-y-2 shadow-modal">
                  <p className="text-xs text-muted-foreground text-center">
                    Comparte estos enlaces para acceso directo por rol
                  </p>
                  {ROLES.map((r) => {
                    const url = baseUrl + r.hash;
                    const copied = copiedHash === r.hash;
                    const colors = LINK_COLORS[r.role];
                    return (
                      <div
                        key={r.role}
                        className={`rounded-2xl border p-3 ${colors.color}`}
                        data-ocid={`login.${r.role}.card`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg flex-shrink-0">
                              {r.emoji}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                  {r.label}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}
                                >
                                  {r.hash}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground/70 truncate font-mono mt-0.5">
                                {url.length > 40 ? `...${url.slice(-38)}` : url}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyLink(r.hash)}
                            className="flex-shrink-0 p-2 rounded-xl hover:bg-black/5 transition-colors"
                            data-ocid={`login.${r.role}.copy_button`}
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="pb-8 text-center">
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
