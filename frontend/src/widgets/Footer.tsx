export function Footer() {
  return (
    <footer className="bg-primary-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Food Store. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
