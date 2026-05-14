interface OrderStatusBadgeProps {
  estado: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    bg: "bg-accent-100",
    text: "text-accent-600",
  },
  CONFIRMADO: {
    label: "Confirmado",
    bg: "bg-primary-100",
    text: "text-primary-600",
  },
  EN_PREPARACION: {
    label: "En preparación",
    bg: "bg-accent-100",
    text: "text-accent-600",
  },
  EN_CAMINO: {
    label: "En camino",
    bg: "bg-primary-100",
    text: "text-primary-600",
  },
  ENTREGADO: {
    label: "Entregado",
    bg: "bg-secondary-100",
    text: "text-secondary-600",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-danger-100",
    text: "text-danger-600",
  },
};

export function OrderStatusBadge({ estado, size = "md" }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[estado] || {
    label: estado,
    bg: "bg-surface-tertiary",
    text: "text-text-primary",
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
