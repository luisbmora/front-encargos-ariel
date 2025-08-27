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
  IconButton,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Order, CreateOrderRequest, OrderItem } from '../../types/order';
import GoogleMap from './GoogleMap';

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
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupLocation: { lat: 0, lng: 0 },
    deliveryLocation: { lat: 0, lng: 0 },
    items: [{ name: '', quantity: 1, price: 0 }],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || '',
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        pickupLocation: order.pickupLocation,
        deliveryLocation: order.deliveryLocation,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        notes: order.notes || '',
      });
    } else {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        pickupAddress: '',
        deliveryAddress: '',
        pickupLocation: { lat: 0, lng: 0 },
        deliveryLocation: { lat: 0, lng: 0 },
        items: [{ name: '', quantity: 1, price: 0 }],
        notes: '',
      });
    }
    setErrors({});
  }, [order, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre del cliente es requerido';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es requerido';
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'La dirección de recogida es requerida';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'La dirección de entrega es requerida';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
    }

    formData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = 'El nombre del producto es requerido';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      }
      if (item.price < 0) {
        newErrors[`item_${index}_price`] = 'El precio no puede ser negativo';
      }
    });

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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));

    // Limpiar errores del item
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleMapClick = (type: 'pickup' | 'delivery') => (event: any) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    if (type === 'pickup') {
      setFormData(prev => ({ ...prev, pickupLocation: location }));
    } else {
      setFormData(prev => ({ ...prev, deliveryLocation: location }));
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {order ? 'Editar Pedido' : 'Nuevo Pedido'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Información del Cliente */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Información del Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre del cliente"
                    value={formData.customerName}
                    onChange={handleChange('customerName')}
                    error={!!errors.customerName}
                    helperText={errors.customerName}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono"
                    value={formData.customerPhone}
                    onChange={handleChange('customerPhone')}
                    error={!!errors.customerPhone}
                    helperText={errors.customerPhone}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email (opcional)"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleChange('customerEmail')}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Direcciones */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Direcciones
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dirección de recogida"
                    value={formData.pickupAddress}
                    onChange={handleChange('pickupAddress')}
                    error={!!errors.pickupAddress}
                    helperText={errors.pickupAddress}
                    fullWidth
                    required
                    multiline
                    rows={2}
                  />
                  <Button
                    size="small"
                    onClick={() => setShowPickupMap(!showPickupMap)}
                    sx={{ mt: 1 }}
                  >
                    {showPickupMap ? 'Ocultar' : 'Mostrar'} Mapa
                  </Button>
                  {showPickupMap && (
                    <Box sx={{ mt: 2 }}>
                      <GoogleMap
                        height="200px"
                        onMapClick={handleMapClick('pickup')}
                        markers={formData.pickupLocation.lat !== 0 ? [{
                          id: 'pickup',
                          position: formData.pickupLocation,
                          title: 'Punto de recogida',
                        }] : []}
                      />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dirección de entrega"
                    value={formData.deliveryAddress}
                    onChange={handleChange('deliveryAddress')}
                    error={!!errors.deliveryAddress}
                    helperText={errors.deliveryAddress}
                    fullWidth
                    required
                    multiline
                    rows={2}
                  />
                  <Button
                    size="small"
                    onClick={() => setShowDeliveryMap(!showDeliveryMap)}
                    sx={{ mt: 1 }}
                  >
                    {showDeliveryMap ? 'Ocultar' : 'Mostrar'} Mapa
                  </Button>
                  {showDeliveryMap && (
                    <Box sx={{ mt: 2 }}>
                      <GoogleMap
                        height="200px"
                        onMapClick={handleMapClick('delivery')}
                        markers={formData.deliveryLocation.lat !== 0 ? [{
                          id: 'delivery',
                          position: formData.deliveryLocation,
                          title: 'Punto de entrega',
                        }] : []}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Productos */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Productos
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Agregar Producto
                </Button>
              </Box>

              {errors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.items}
                </Alert>
              )}

              {formData.items.map((item, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Nombre del producto"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        error={!!errors[`item_${index}_name`]}
                        helperText={errors[`item_${index}_name`]}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Cantidad"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        error={!!errors[`item_${index}_quantity`]}
                        helperText={errors[`item_${index}_quantity`]}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Precio"
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        error={!!errors[`item_${index}_price`]}
                        helperText={errors[`item_${index}_price`]}
                        fullWidth
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={10} sm={3}>
                      <TextField
                        label="Notas (opcional)"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Typography variant="h6">
                  Total: ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Notas */}
            <TextField
              label="Notas adicionales (opcional)"
              value={formData.notes}
              onChange={handleChange('notes')}
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