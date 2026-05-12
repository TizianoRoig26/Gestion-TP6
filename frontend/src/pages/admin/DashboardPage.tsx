import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../../shared/ui/Button";
import {
  useMetricasResumen,
  useVentasPeriodo,
  useTopProductos,
  usePedidosPorEstado,
} from "../../shared/api/admin";

// ─── Helpers ───────────────────────────────────────────────

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function monthStartISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const GRANULARIDAD_OPTIONS = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
];

const PIE_COLORS: Record<string, string> = {
  PENDIENTE: "#FBBF24",
  CONFIRMADO: "#3B82F6",
  EN_PREPARACION: "#8B5CF6",
  EN_CAMINO: "#06B6D4",
  ENTREGADO: "#22C55E",
  CANCELADO: "#EF4444",
};

function getPieColor(codigo: string): string {
  return PIE_COLORS[codigo] ?? "#9CA3AF";
}

// ─── KPI Card ──────────────────────────────────────────────

function KpiCard({
  title,
  value,
  prefix,
  loading,
}: {
  title: string;
  value: string;
  prefix?: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-28 bg-gray-200 animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">
          {prefix}
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Chart wrapper (loading / empty) ───────────────────────

function ChartCard({
  title,
  children,
  loading,
  isEmpty,
  height = 300,
}: {
  title: string;
  children: React.ReactNode;
  loading: boolean;
  isEmpty: boolean;
  height?: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      {loading ? (
        <div
          className="bg-gray-200 animate-pulse rounded"
          style={{ height }}
        />
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center text-gray-400 text-sm"
          style={{ height }}
        >
          Sin datos para el periodo seleccionado
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ─── Currency formatter ────────────────────────────────────

const currency = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

// ─── Main Component ────────────────────────────────────────

export function DashboardPage() {
  const [desde, setDesde] = useState(monthStartISO);
  const [hasta, setHasta] = useState(todayISO);
  const [appliedDesde, setAppliedDesde] = useState(desde);
  const [appliedHasta, setAppliedHasta] = useState(hasta);
  const [granularidad, setGranularidad] = useState("dia");

  const filters = { desde: appliedDesde, hasta: appliedHasta };

  const { data: metricas, isLoading: loadingM } = useMetricasResumen(filters);
  const { data: ventas, isLoading: loadingV } = useVentasPeriodo(
    appliedDesde,
    appliedHasta,
    granularidad,
  );
  const { data: topProductos, isLoading: loadingT } = useTopProductos(10, filters);
  const { data: pedidosEstado, isLoading: loadingP } = usePedidosPorEstado(filters);

  const handleApplyFilter = useCallback(() => {
    setAppliedDesde(desde);
    setAppliedHasta(hasta);
  }, [desde, hasta]);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de metricas y rendimiento del negocio
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button size="sm" onClick={handleApplyFilter}>
          Aplicar
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ventas totales"
          value={metricas ? currency(metricas.total_ventas) : "$0"}
          loading={loadingM}
        />
        <KpiCard
          title="Pedidos"
          value={metricas ? String(metricas.cantidad_pedidos) : "0"}
          loading={loadingM}
        />
        <KpiCard
          title="Usuarios registrados"
          value={metricas ? String(metricas.cantidad_usuarios) : "0"}
          loading={loadingM}
        />
        <KpiCard
          title="Ticket promedio"
          value={metricas ? currency(metricas.ticket_promedio) : "$0"}
          loading={loadingM}
        />
      </div>

      {/* ── Granularity selector ── */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">
          Agrupar ventas por:
        </span>
        <div className="flex gap-1">
          {GRANULARIDAD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGranularidad(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                granularidad === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LineChart — Ventas ── lg:col-span-2 */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Evolucion de ventas"
            loading={loadingV}
            isEmpty={!ventas || ventas.length === 0}
            height={320}
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={ventas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => [currency(value), "Monto"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monto_total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Monto total"
                />
                <Line
                  type="monotone"
                  dataKey="cantidad_pedidos"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Cant. pedidos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* PieChart — Distribucion de pedidos */}
        <div>
          <ChartCard
            title="Pedidos por estado"
            loading={loadingP}
            isEmpty={!pedidosEstado || pedidosEstado.length === 0}
            height={320}
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pedidosEstado}
                  dataKey="cantidad"
                  nameKey="estado_nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ estado_nombre, cantidad }) =>
                    `${estado_nombre}: ${cantidad}`
                  }
                >
                  {(pedidosEstado ?? []).map((entry) => (
                    <Cell
                      key={entry.estado_codigo}
                      fill={getPieColor(entry.estado_codigo)}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* BarChart — Top productos ── full width */}
        <div className="lg:col-span-3">
          <ChartCard
            title="Top 10 productos mas vendidos"
            loading={loadingT}
            isEmpty={!topProductos || topProductos.length === 0}
            height={350}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={topProductos}
                layout="vertical"
                margin={{ left: 120, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  width={110}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "cantidad_total") return [value, "Cantidad"];
                    if (name === "ingreso_total") return [currency(value), "Ingreso"];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="cantidad_total"
                  fill="#3B82F6"
                  name="Cantidad"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="ingreso_total"
                  fill="#22C55E"
                  name="Ingreso"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
