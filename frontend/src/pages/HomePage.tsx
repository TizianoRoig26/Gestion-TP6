import { Link } from "react-router-dom";
import { useCategories } from "../shared/api/catalogos";
import type { CategoriaTreeItem } from "../entities/category/types";

/* ─────────── Category icon map ─────────── */
const CATEGORY_ICONS: Record<string, string> = {
  Pizzas: "🍕",
  Ensaladas: "🥗",
  Carnes: "🥩",
  Postres: "🍰",
  Pastas: "🍝",
  Hamburguesas: "🍔",
  Bebidas: "🥤",
  Gaseosas: "🥤",
  Aguas: "💧",
  Jugos: "🧃",
  Snacks: "🍿",
  Veggie: "🥦",
  Vegano: "🌱",
};

const CATEGORY_DESCS: Record<string, string> = {
  Pizzas: "Las más sabrosas",
  Ensaladas: "Frescas y saludables",
  Carnes: "Corte premium",
  Postres: "Dulce tentación",
  Pastas: "Artesanales",
  Hamburguesas: "Hechas al momento",
};

/* ─────────── Hero Section ─────────── */
function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-800 to-primary-900">
      {/* Subtle texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[500px] rounded-full bg-accent-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[400px] rounded-full bg-primary-500/15 blur-[100px]" />

      <div className="relative mx-auto flex max-w-screen-xl flex-col items-center px-4 py-24 text-center sm:py-32 lg:py-40">
        {/* Logo decoration */}
        <span className="mb-6 inline-flex size-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
          <img
            src="/images/logo-aji.svg"
            alt="BigPepper"
            className="size-16"
          />
        </span>

        {/* Brand name */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Big
          <span className="text-accent-500">Pepper</span>
        </h1>

        {/* Slogan */}
        <p className="mb-4 max-w-2xl text-xl font-semibold text-primary-200 sm:text-2xl">
          El sabor que enciende tu día
        </p>

        {/* Subtitle / value prop */}
        <p className="mb-10 max-w-lg text-base text-primary-100/80 sm:text-lg">
          Productos frescos, sabores auténticos. De la cocina a tu puerta con la
          calidad que merecés.
        </p>

        {/* CTA */}
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-primary-900 shadow-lg shadow-accent-500/25 transition-all duration-300 hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          Explorar Catálogo
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 sm:gap-16">
          {[
            { value: "150+", label: "Productos" },
            { value: "4.8", label: "Rating" },
            { value: "30min", label: "Delivery" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-accent-500 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-primary-200/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Featured Categories ─────────── */
function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories();

  // Show children categories (those with padre_id) as featured
  const featured = categories
    .filter((c: CategoriaTreeItem) => c.padre_id !== null)
    .slice(0, 6);

  if (isLoading) {
    return (
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-2 h-10 w-64 animate-pulse rounded-lg bg-surface-tertiary" />
            <div className="mx-auto h-5 w-48 animate-pulse rounded bg-surface-tertiary" />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 rounded-2xl border border-border-default bg-white p-8"
              >
                <div className="size-16 animate-pulse rounded-xl bg-surface-tertiary" />
                <div className="h-4 w-20 animate-pulse rounded bg-surface-tertiary" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Categorías destacadas
          </h2>
          <p className="mt-2 text-text-secondary">
            Descubrí todo lo que tenemos para vos
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((cat: CategoriaTreeItem) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoria_id=${cat.id}`}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border-default bg-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-ambient hover:-translate-y-1"
            >
              <span className="inline-flex size-16 items-center justify-center rounded-xl bg-primary-50 text-3xl transition-transform duration-300 group-hover:scale-110">
                {CATEGORY_ICONS[cat.nombre] ?? "🍽️"}
              </span>
              <div className="text-center">
                <h3 className="font-semibold text-text-primary">{cat.nombre}</h3>
                <p className="mt-0.5 text-sm text-text-tertiary">
                  {CATEGORY_DESCS[cat.nombre] ?? cat.descripcion ?? "Gran variedad"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Ver todas las categorías
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Secondary CTA ─────────── */
function HomeCTA() {
  return (
    <section className="bg-gradient-to-r from-primary-700 to-primary-800 py-20">
      <div className="mx-auto max-w-screen-xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          ¿Listo para pedir?
        </h2>
        <p className="mb-8 text-lg text-primary-200">
          Hacé tu pedido ahora y recibilo en la puerta de tu casa.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-primary-900 shadow-lg shadow-accent-500/25 transition-all duration-300 hover:bg-accent-600 hover:shadow-xl hover:-translate-y-0.5"
          >
            Ver Menú
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Main Page ─────────── */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <FeaturedCategories />
      <HomeCTA />
    </>
  );
}
