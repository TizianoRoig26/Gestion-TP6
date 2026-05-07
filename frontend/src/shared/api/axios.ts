import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not defined. Create a .env file based on .env.example",
  );
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===========================================
// Refresh Token Queue
// ===========================================
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  pendingQueue = [];
}

async function refreshTokens() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    { refresh_token: refreshToken },
  );

  const { access_token, refresh_token } = response.data;
  useAuthStore.getState().updateTokens({
    accessToken: access_token,
    refreshToken: refresh_token,
  });

  return access_token;
}

// ===========================================
// Request Interceptor: attach Bearer token
// ===========================================
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===========================================
// Response Interceptor: handle 401 + refresh
// ===========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 for non-refresh requests
    if (error.response?.status !== 401 || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshTokens();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ===========================================
// Error Mapping Helper
// ===========================================
export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;

    // Custom error messages by status code
    switch (status) {
      case 400:
        return data?.detail as string ?? "Datos inválidos. Revisá los campos.";
      case 401:
        return "Credenciales inválidas";
      case 403:
        return "No tenés permisos para esta acción";
      case 404:
        return "Recurso no encontrado";
      case 429:
        return "Demasiados intentos, esperá antes de reintentar";
      case 500:
        return "Error interno del servidor. Intentá de nuevo más tarde";
      default:
        return data?.detail as string ?? "Error inesperado. Intentá de nuevo";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Error inesperado. Intentá de nuevo";
}
