interface OrderStatusBadgeProps {
  estado: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  CONFIRMADO: {
    label: "Confirmado",
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  EN_PREPARACION: {
    label: "En preparación",
    bg: "bg-orange-100",
    text: "text-orange-800",
  },
  EN_CAMINO: {
    label: "En camino",
    bg: "bg-cyan-100",
    text: "text-cyan-800",
  },
  ENTREGADO: {
    label: "Entregado",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

export function OrderStatusBadge({ estado, size = "md" }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[estado] || {
    label: estado,
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span className={`inline-block ${config.bg} ${config.text} ${sizeClasses} font-medium rounded-full`}>
      {config.label}
    </span>
  );
}

// Helper to get all states in FSM order (for timeline)
export const FSM_STATES = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
];
