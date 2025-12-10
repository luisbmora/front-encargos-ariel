import axios from 'axios';

// Ajusta esta URL base si tu configuración de entorno es diferente (ej. process.env.REACT_APP_API_URL)
const API_URL = 'http://152.67.233.117/api'; 

export const descargarReporteExcel = async (fechaInicio: string, fechaFin: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token'); // Recuperamos el token

    const response = await axios.get(`${API_URL}/reportes/encargos/entregados/excel`, {
      params: {
        fechaInicio,
        fechaFin
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob' // Vital para descargar archivos binarios
    });

    // Crear URL temporal y forzar la descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_entregas_${fechaInicio}_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error al descargar el reporte:', error);
    throw error;
  }
};