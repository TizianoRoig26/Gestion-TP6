import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-6xl font-bold text-text-disabled mb-4">404</h2>
      <p className="text-xl text-text-secondary mb-8">
        Página no encontrada
      </p>
      <Link
        to="/"
        className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
