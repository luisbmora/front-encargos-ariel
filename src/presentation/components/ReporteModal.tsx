import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
// Importación corregida apuntando a la carpeta api
import { descargarReporteExcel } from '../../api/reportes.service';

interface ReporteModalProps {
  open: boolean;
  onClose: () => void;
}

export const ReporteModal: React.FC<ReporteModalProps> = ({ open, onClose }) => {
  const hoy = new Date().toISOString().split('T')[0];
  
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescargar = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (fechaInicio > fechaFin) {
        setError('La fecha de inicio no puede ser mayor a la fecha fin');
        setLoading(false);
        return;
      }

      await descargarReporteExcel(fechaInicio, fechaFin);
      onClose();
    } catch (err) {
      setError('Error al descargar el archivo. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle>Descargar Reporte Diario</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Selecciona el rango de fechas para generar el reporte de pedidos entregados.
          </Typography>

          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleDescargar} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Generando...' : 'Descargar Excel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};