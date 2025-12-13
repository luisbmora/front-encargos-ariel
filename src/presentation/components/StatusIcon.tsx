import React from 'react';
import { Box, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Reloj
import CheckIcon from '@mui/icons-material/Check'; // Check simple
import DoneAllIcon from '@mui/icons-material/DoneAll'; // Doble check
import VisibilityIcon from '@mui/icons-material/Visibility'; // Ojo

type EstadoNotificacion = 'PENDIENTE' | 'ENVIADA_WS' | 'RECIBIDA' | 'vista' | 'aceptada' | string;

interface Props {
  estado: EstadoNotificacion;
}

export const StatusIcon: React.FC<Props> = ({ estado }) => {
  switch (estado) {
    case 'PENDIENTE':
      return (
        <Tooltip title="Pendiente (Repartidor desconectado)">
          <AccessTimeIcon color="disabled" fontSize="small" />
        </Tooltip>
      );
    case 'ENVIADA_WS':
      return (
        <Tooltip title="Enviado al celular">
          <CheckIcon color="primary" fontSize="small" />
        </Tooltip>
      );
    case 'RECIBIDA':
      return (
        <Tooltip title="Recibido en el celular">
          <DoneAllIcon color="success" fontSize="small" />
        </Tooltip>
      );
    case 'vista':
    case 'aceptada':
      return (
        <Tooltip title="Visto por el repartidor">
          <Box display="flex" alignItems="center" color="#1976d2">
            <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
            <DoneAllIcon fontSize="small" />
          </Box>
        </Tooltip>
      );
    default:
      return <AccessTimeIcon color="disabled" fontSize="small" />;
  }
};