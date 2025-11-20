// src/presentation/components/DeliveryForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Delivery, CreateDeliveryRequest } from '../../types/delivery';

interface DeliveryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeliveryRequest | any) => Promise<boolean>;
  delivery?: Delivery | null;
  loading?: boolean;
  isEdit?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  open,
  onClose,
  onSubmit,
  delivery,
  loading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<any>({
    nombre: '',
    telefono: '',
    email: '',
    password: '',
    //activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordField, setIsPasswordField] = useState(!isEdit);

  useEffect(() => {
    if (delivery) {
      setFormData({
        nombre: delivery.nombre,
        telefono: delivery.telefono,
        email: delivery.email,
        password: '', // No mostramos la contraseña actual por seguridad
        //activo: delivery.activo,
      });
      setIsPasswordField(false);
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        password: '',
        //activo: true,
      });
      setIsPasswordField(true);
    }
    setErrors({});
  }, [delivery, open, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Para edición, si no se cambió la contraseña, no la enviamos
    const submitData = isEdit && !formData.password 
      ? { ...formData, password: undefined } 
      : formData;

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData((prev: typeof formData) => ({
      ...prev,
      [field]: value,
    })); 
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const togglePasswordField = () => {
    setIsPasswordField(!isPasswordField);
    if (!isPasswordField) {
      setFormData((prev: any) => ({ ...prev, password: '' }));
    }
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
              value={formData.nombre}
              onChange={handleChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
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
              value={formData.telefono}
              onChange={handleChange('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono}
              fullWidth
              required
            />

            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleChange('activo')}
                    color="primary"
                  />
                }
                label="Activo"
              />
            )}

            {isPasswordField && (
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password || (isEdit ? 'Dejar en blanco para mantener la contraseña actual' : 'Mínimo 6 caracteres')}
                fullWidth
                required={!isEdit}
              />
            )}

            {isEdit && (
              <Button 
                onClick={togglePasswordField} 
                variant="outlined" 
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                {isPasswordField ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
              </Button>
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