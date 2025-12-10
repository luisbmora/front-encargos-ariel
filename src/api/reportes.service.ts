import axios from 'axios';

// ---------------------------------------------------------------------------
// 1. CONFIGURACIÓN "MÁGICA" (Esto soluciona tu problema)
// Esto le dice a Axios: "Si no te doy una URL completa, usa esta base"
// Así, cuando tú pidas '/reportes', Axios pedirá 'http://localhost:3000/api/reportes'
// ---------------------------------------------------------------------------
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const descargarReporteExcel = async (fechaInicio: string, fechaFin: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token'); 

    // 2. TU CÓDIGO (Queda exactamente como querías)
    // Gracias a la config de arriba, ahora sí encontrará al backend
    const response = await axios.get(`/reportes/encargos/entregados/excel`, {
      params: { 
        fechaInicio, 
        fechaFin 
      },
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      responseType: 'blob' // Fundamental para archivos
    });

    // 3. VERIFICACIÓN DE SEGURIDAD
    // Si por error recibimos JSON (error) en vez de archivo, lo detectamos aquí
    if (response.headers['content-type']?.includes('application/json')) {
      const text = await response.data.text();
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.message || 'Error desconocido del servidor');
    }

    // 4. DESCARGAR EL ARCHIVO REAL
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // IMPORTANTE: Asegúrate que la extensión sea .xlsx (Excel) y no .csv
    link.setAttribute('download', `reporte_entregas_${fechaInicio}_${fechaFin}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('Error al descargar el reporte:', error);
    throw error;
  }
};