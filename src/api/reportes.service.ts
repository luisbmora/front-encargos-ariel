import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'; 

export const descargarReporteExcel = async (fechaInicio: string, fechaFin: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token'); 

    const response = await axios.get(`/reportes/encargos/entregados/excel`, {
      params: { fechaInicio, fechaFin },
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob' // Recibimos datos binarios
    });

    // --- NUEVA VALIDACIÓN DE SEGURIDAD ---
    // Si el servidor devuelve JSON en lugar de un archivo, es un error.
    if (response.headers['content-type']?.includes('application/json')) {
      // Convertimos el blob a texto para leer el error real
      const text = await response.data.text();
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.message || 'Error al generar el Excel');
    }
    // ------------------------------------

    // Si todo está bien, descargamos
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_entregas_${fechaInicio}_${fechaFin}.xlsx`);
    document.body.appendChild(link);
    link.click();
    
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('Error al descargar el reporte:', error);
    // Esto lanzará el error para que tu Modal lo muestre en rojo
    throw error; 
  }
};