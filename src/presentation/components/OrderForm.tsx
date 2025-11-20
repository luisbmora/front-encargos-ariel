// src/presentation/components/OrderForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Order, CreateOrderRequest } from '../../types/order';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderRequest) => Promise<boolean>;
  order?: Order | null;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  open,
  onClose,
  onSubmit,
  order,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateOrderRequest>({
    nombre: '',
    descripcion: '',
    direccionRecogida: '',
    direccionEntrega: '',
    clienteNombre: '',
    clienteTelefono: '',
    precio: 0,
    notas: '',
    prioridad: 'media',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        nombre: order.nombre,
        descripcion: order.descripcion || '',
        direccionRecogida: order.direccionRecogida,
        direccionEntrega: order.direccionEntrega,
        clienteNombre: order.clienteNombre,
        clienteTelefono: order.clienteTelefono,
        precio: order.precio,
        notas: order.notas || '',
        prioridad: order.prioridad,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        direccionRecogida: '',
        direccionEntrega: '',
        clienteNombre: '',
        clienteTelefono: '',
        precio: 0,
        notas: '',
        prioridad: 'media',
      });
    }
    setErrors({});
  }, [order, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del encargo es requerido';
    }

    if (!formData.direccionRecogida.trim()) {
      newErrors.direccionRecogida = 'La dirección de recogida es requerida';
    }

    if (!formData.direccionEntrega.trim()) {
      newErrors.direccionEntrega = 'La dirección de entrega es requerida';
    }

    if (!formData.clienteNombre.trim()) {
      newErrors.clienteNombre = 'El nombre del cliente es requerido';
    }

    if (!formData.clienteTelefono.trim()) {
      newErrors.clienteTelefono = 'El teléfono es requerido';
    }

    if (formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const handleChange = (field: keyof CreateOrderRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: any = e.target.value;
    
    if (field === 'precio') {
      value = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSelectChange = (field: keyof CreateOrderRequest) => (
    e: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {order ? 'Editar Encargo' : 'Nuevo Encargo'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Información Básica */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre del encargo"
                  value={formData.nombre}
                  onChange={handleChange('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  fullWidth
                  required
                />
                <TextField
                  label="Descripción (opcional)"
                  value={formData.descripcion}
                  onChange={handleChange('descripcion')}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Información del Cliente */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Información del Cliente
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nombre del cliente"
                  value={formData.clienteNombre}
                  onChange={handleChange('clienteNombre')}
                  error={!!errors.clienteNombre}
                  helperText={errors.clienteNombre}
                  sx={{ flex: 1 }}
                  required
                />
                <TextField
                  label="Teléfono"
                  value={formData.clienteTelefono}
                  onChange={handleChange('clienteTelefono')}
                  error={!!errors.clienteTelefono}
                  helperText={errors.clienteTelefono}
                  sx={{ flex: 1 }}
                  required
                />
              </Box>
            </Box>

            {/* Direcciones */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Direcciones
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Dirección de recogida"
                  value={formData.direccionRecogida}
                  onChange={handleChange('direccionRecogida')}
                  error={!!errors.direccionRecogida}
                  helperText={errors.direccionRecogida}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
                <TextField
                  label="Dirección de entrega"
                  value={formData.direccionEntrega}
                  onChange={handleChange('direccionEntrega')}
                  error={!!errors.direccionEntrega}
                  helperText={errors.direccionEntrega}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />
              </Box>
            </Box>

            {/* Precio y Prioridad */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Precio"
                type="number"
                value={formData.precio}
                onChange={handleChange('precio')}
                error={!!errors.precio}
                helperText={errors.precio}
                sx={{ flex: 1 }}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.prioridad}
                  onChange={handleSelectChange('prioridad')}
                  label="Prioridad"
                >
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="urgente">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Notas */}
            <TextField
              label="Notas adicionales (opcional)"
              value={formData.notas}
              onChange={handleChange('notas')}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'Guardando...' : order ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderForm;