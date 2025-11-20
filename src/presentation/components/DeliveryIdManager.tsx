// src/presentation/components/DeliveryIdManager.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const DeliveryIdManager: React.FC = () => {
  const [newId, setNewId] = useState('');
  const [deliveryIds, setDeliveryIds] = useState<string[]>([
    '68b1250b5eb8750fe343f177', // David M
  ]);

  const addDeliveryId = () => {
    if (newId.trim() && !deliveryIds.includes(newId.trim())) {
      setDeliveryIds([...deliveryIds, newId.trim()]);
      setNewId('');
    }
  };

  const removeDeliveryId = (id: string) => {
    setDeliveryIds(deliveryIds.filter(deliveryId => deliveryId !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDeliveryId();
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gestionar IDs de Repartidores
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Agrega los IDs de los repartidores que quieres monitorear en el mapa.
        Puedes obtener estos IDs desde tu base de datos o API de repartidores.
      </Alert>

      {/* Agregar nuevo ID */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="ID del Repartidor"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ej: 68b1250b5eb8750fe343f177"
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          onClick={addDeliveryId}
          startIcon={<AddIcon />}
          disabled={!newId.trim()}
        >
          Agregar
        </Button>
      </Box>

      {/* Lista de IDs */}
      <Typography variant="subtitle1" gutterBottom>
        IDs Configurados ({deliveryIds.length}):
      </Typography>
      
      <List>
        {deliveryIds.map((id, index) => (
          <ListItem key={id} divider>
            <ListItemText
              primary={id}
              secondary={index === 0 ? 'David M (Ejemplo)' : `Repartidor ${index + 1}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => removeDeliveryId(id)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {deliveryIds.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No hay IDs configurados. Agrega al menos uno para ver repartidores en el mapa.
        </Typography>
      )}

      {/* Información adicional */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Nota:</strong> Para obtener más IDs de repartidores, puedes:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1 }}>
          <li>Consultar tu base de datos de repartidores</li>
          <li>Usar el endpoint GET /api/repartidores de tu API</li>
          <li>Revisar los logs de tu aplicación backend</li>
        </Typography>
      </Box>
    </Paper>
  );
};

export default DeliveryIdManager;