import axios from 'axios';

// Configuración de la instancia de Axios
const api = axios.create({
    // CAMBIO REALIZADO: Apuntando a la IP del VPS en lugar de Render
    //baseURL: '/api', 
    baseURL: 'http://152.67.233.117/api', 

    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar el Token a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Logs para depuración
        console.log(`[AXIOS] Enviando petición a: ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        console.log(`[AXIOS] Respuesta recibida de: ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[AXIOS] Error en petición:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
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

export default api;