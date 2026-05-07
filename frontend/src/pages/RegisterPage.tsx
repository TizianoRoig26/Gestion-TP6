import { Link } from "react-router-dom";
import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Crear Cuenta
        </h2>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <RegisterForm />
          <p className="text-center mt-4 text-sm text-gray-600">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700"
            >
              Iniciá Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
