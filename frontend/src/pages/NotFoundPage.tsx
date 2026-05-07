import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-6xl font-bold text-gray-300 mb-4">404</h2>
      <p className="text-xl text-gray-600 mb-8">
        Página no encontrada
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
