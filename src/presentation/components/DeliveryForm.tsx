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
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
    activo: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Controla si el campo de contraseña debe aparecer en el DOM (Lógica de edición)
  const [isPasswordField, setIsPasswordField] = useState(!isEdit);
  
  // Controla si se ven los caracteres de la contraseña (Ojo visible/oculto)
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (delivery) {
      setFormData({
        nombre: delivery.nombre,
        telefono: delivery.telefono,
        email: delivery.email,
        password: '', 
        activo: delivery.activo !== undefined ? delivery.activo : true,
      });
      setIsPasswordField(false);
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        password: '',
        activo: true,
      });
      setIsPasswordField(true);
    }
    setErrors({});
    setShowPassword(false); // Resetear visibilidad al abrir
  }, [delivery, open, isEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validar Email (Formato más robusto)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingrese un formato de email válido (ej: usuario@dominio.com)';
    }

    // Validar Teléfono (Solo números y exactamente 10 dígitos)
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.length !== 10) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
    }

    // Validar Contraseña
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if ((!isEdit || (isEdit && formData.password)) && formData.password.length < 6) {
      // Si es nuevo usuario O si es edición y el usuario escribió algo en el campo
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Para edición, si no se cambió la contraseña (está vacía), no la enviamos
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
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    // Lógica específica para el teléfono
    if (field === 'telefono') {
      // 1. Eliminar cualquier caracter que no sea número
      const numericValue = value.replace(/\D/g, '');
      
      // 2. Limitar a 10 caracteres
      if (numericValue.length > 10) {
        return; // No actualizamos el estado si excede
      }
      value = numericValue;
    }

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

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
              helperText={errors.telefono || "Solo números, 10 dígitos"}
              fullWidth
              required
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9]*',
                maxLength: 10 
              }}
            />

            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.activo}
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!errors.password}
                helperText={errors.password || (isEdit ? 'Dejar en blanco para mantener la actual' : 'Mínimo 6 caracteres')}
                fullWidth
                required={!isEdit}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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