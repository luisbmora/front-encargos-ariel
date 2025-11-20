// src/api/authApi.ts
import axiosInstance from './axios';

export const loginAPI = async (email: string, password: string) => {
  try {
    console.log('[DEBUG] URL completa:', `${axiosInstance.defaults.baseURL}/usuarios/login`);
    
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[DEBUG] Respuesta:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('[ERROR] Detalles:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response?.data
    });
    
    let errorMessage = 'Error de conexión';
    if (error.response) {
      errorMessage = error.response.data?.message || 'Error en el servidor';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'El servidor no respondió a tiempo';
    }

    throw new Error(errorMessage);
  }
};