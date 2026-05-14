import { Link } from "react-router-dom";
import { LoginForm } from "../features/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Iniciar Sesión
        </h2>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-border-default">
          <LoginForm />
          <p className="text-center mt-4 text-sm text-text-secondary">
            ¿No tenés cuenta?{" "}
            <Link
              to="/register"
              className="text-primary-500 hover:text-primary-600"
            >
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
