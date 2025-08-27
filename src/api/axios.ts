// src/api/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  timeout: 15000
});

// Interceptor para logs
instance.interceptors.request.use(config => {
  console.log('[AXIOS] Enviando petición a:', config.url);
  return config;
});

instance.interceptors.response.use(
  response => {
    console.log('[AXIOS] Respuesta recibida de:', response.config.url);
    return response;
  },
  error => {
    console.error('[AXIOS] Error en petición:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default instance;