import { Link } from "react-router-dom";
import type { PedidoResumen } from "../../entities/order/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  pedido: PedidoResumen;
}

export function OrderCard({ pedido }: OrderCardProps) {
  const fecha = new Date(pedido.creado_en).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      to={`/mis-pedidos/${pedido.id}`}
      className="block bg-white rounded-xl shadow-sm border border-border-subtle p-5 hover:shadow-md hover:border-primary-100 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-text-secondary">Pedido #{pedido.id}</p>
          <p className="text-xs text-text-tertiary">{fecha}</p>
        </div>
        <OrderStatusBadge estado={pedido.estado_codigo} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <p className="text-sm text-text-secondary">
          {pedido.items_count} {pedido.items_count === 1 ? "item" : "items"}
        </p>
        <p className="font-bold text-text-primary">${pedido.total.toFixed(2)}</p>
      </div>
    </Link>
  );
}
