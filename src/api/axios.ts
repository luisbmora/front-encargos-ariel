// src/api/axios.ts
import axios from "axios";

const instance = axios.create({
  //baseURL: "http://localhost:3000/api/",
  baseURL: 'https://api-encargos-ariel.onrender.com/api',
  timeout: 15000,
});

// Interceptor para agregar el token de autenticación
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("[AXIOS] Enviando petición a:", config.url);
  return config;
});

// Interceptor para manejar respuestas y errores
instance.interceptors.response.use(
  (response) => {
    console.log("[AXIOS] Respuesta recibida de:", response.config.url);
    return response;
  },
  (error) => {
    console.error("[AXIOS] Error en petición:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.log("[AXIOS] Token expirado o inválido, limpiando sesión");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes("login")) {
        // Usar setTimeout para evitar problemas de navegación
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
