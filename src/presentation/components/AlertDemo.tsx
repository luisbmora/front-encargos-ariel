// src/presentation/components/AlertDemo.tsx
import React from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import { AlertService } from '../../utils/alerts';

const AlertDemo: React.FC = () => {
  const showSuccessAlert = () => {
    AlertService.success('¡Operación exitosa!', 'Los datos se guardaron correctamente');
  };

  const showErrorAlert = () => {
    AlertService.error('Error en la operación', 'No se pudo completar la acción solicitada');
  };

  const showConfirmAlert = async () => {
    const result = await AlertService.confirm(
      '¿Confirmar acción?',
      '¿Estás seguro de que quieres continuar?',
      'Sí, continuar'
    );
    
    if (result.isConfirmed) {
      AlertService.toast.success('¡Confirmado!');
    } else {
      AlertService.toast.info('Operación cancelada');
    }
  };

  const showDeleteConfirm = async () => {
    const result = await AlertService.confirmDelete('Juan Pérez', 'repartidor');
    
    if (result.isConfirmed) {
      AlertService.toast.success('Repartidor eliminado');
    }
  };

  const showLoadingAlert = () => {
    AlertService.loading('Procesando...', 'Por favor espera mientras se completa la operación');
    
    // Simular operación
    setTimeout(() => {
      AlertService.close();
      AlertService.success('¡Completado!', 'La operación se realizó exitosamente');
    }, 3000);
  };

  const showCrudAlerts = async () => {
    await AlertService.crud.created('Pedido', '#123456');
    setTimeout(async () => {
      await AlertService.crud.updated('Repartidor', 'Juan Pérez');
    }, 1000);
    setTimeout(async () => {
      await AlertService.crud.deleted('Pedido', '#789012');
    }, 2000);
  };

  const showToastAlerts = () => {
    AlertService.toast.success('¡Éxito! Operación completada');
    setTimeout(() => {
      AlertService.toast.error('Error: Algo salió mal');
    }, 1000);
    setTimeout(() => {
      AlertService.toast.info('Info: Proceso en curso');
    }, 2000);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🎨 Demo de Alertas SweetAlert2
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Prueba todas las alertas disponibles en el sistema
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="success" onClick={showSuccessAlert}>
            Alerta de Éxito
          </Button>
          
          <Button variant="contained" color="error" onClick={showErrorAlert}>
            Alerta de Error
          </Button>
          
          <Button variant="contained" color="primary" onClick={showConfirmAlert}>
            Confirmación
          </Button>
          
          <Button variant="contained" color="warning" onClick={showDeleteConfirm}>
            Confirmar Eliminación
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={showLoadingAlert}>
            Alerta de Carga
          </Button>
          
          <Button variant="outlined" onClick={showCrudAlerts}>
            Alertas CRUD
          </Button>
          
          <Button variant="outlined" onClick={showToastAlerts}>
            Toast Notifications
          </Button>
        </Box>
      </Stack>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Estas alertas se usan automáticamente en todas las operaciones CRUD del sistema:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>✅ Crear pedidos y repartidores</li>
          <li>✏️ Editar información</li>
          <li>🗑️ Eliminar con confirmación</li>
          <li>🔄 Cambiar estados</li>
          <li>📋 Asignar repartidores</li>
        </Typography>
      </Box>
    </Paper>
  );
};

export default AlertDemo;