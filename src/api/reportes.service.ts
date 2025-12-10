import axios from 'axios';

// Asegúrate de que esta URL coincida con tu backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'; 

export const descargarReporteExcel = async (fechaInicio: string, fechaFin: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token'); 

    const response = await axios.get(`${API_URL}/reportes/encargos/entregados/excel`, {
      params: {
        fechaInicio,
        fechaFin
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob' // Importante para recibir el archivo binario
    });

    // Crear URL temporal
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // --- AQUÍ ESTABA EL ERROR ---
    // Cambiamos la extensión a .xlsx porque tu backend genera un Excel real, no un CSV
    link.setAttribute('download', `reporte_entregas_${fechaInicio}_${fechaFin}.xlsx`); 
    
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