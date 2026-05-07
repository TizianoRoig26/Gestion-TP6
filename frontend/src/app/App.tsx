import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { router } from "./router";
import { ErrorBoundary } from "../shared/ui/ErrorBoundary";
import { ToastContainer } from "../shared/ui/Toast";

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
        <ToastContainer />
      </Providers>
    </ErrorBoundary>
  );
}
