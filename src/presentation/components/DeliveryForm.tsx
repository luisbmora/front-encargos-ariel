// src/presentation/components/DeliveryForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { Delivery, CreateDeliveryRequest } from '../../types/delivery';

interface DeliveryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeliveryRequest) => Promise<boolean>;
  delivery?: Delivery | null;
  loading?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  open,
  onClose,
  onSubmit,
  delivery,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateDeliveryRequest>({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'motorcycle',
    vehiclePlate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (delivery) {
      setFormData({
        name: delivery.name,
        email: delivery.email,
        phone: delivery.phone,
        vehicleType: delivery.vehicleType,
        vehiclePlate: delivery.vehiclePlate || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'motorcycle',
        vehiclePlate: '',
      });
    }
    setErrors({});
  }, [delivery, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if ((formData.vehicleType === 'motorcycle' || formData.vehicleType === 'car') && !formData.vehiclePlate?.trim()) {
      newErrors.vehiclePlate = 'La placa es requerida para este tipo de vehículo';
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

  const handleChange = (field: keyof CreateDeliveryRequest) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const vehicleTypeLabels = {
    motorcycle: 'Motocicleta',
    bicycle: 'Bicicleta',
    car: 'Automóvil',
    walking: 'A pie',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {delivery ? 'Editar Repartidor' : 'Nuevo Repartidor'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre completo"
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
            />

            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo de vehículo</InputLabel>
              <Select
                value={formData.vehicleType}
                onChange={handleChange('vehicleType')}
                label="Tipo de vehículo"
              >
                {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(formData.vehicleType === 'motorcycle' || formData.vehicleType === 'car') && (
              <TextField
                label="Placa del vehículo"
                value={formData.vehiclePlate}
                onChange={handleChange('vehiclePlate')}
                error={!!errors.vehiclePlate}
                helperText={errors.vehiclePlate}
                fullWidth
                required
              />
            )}
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
            {loading ? 'Guardando...' : delivery ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DeliveryForm;