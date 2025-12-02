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
  IconButton,
  Grid,
  LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Order, CreateOrderRequest } from '../../types/order';

// --- CONFIGURACIÓN DE ORACLE CLOUD ---
// URL PAR (Permite escritura - PUT)
const ORACLE_UPLOAD_BASE_URL = "https://objectstorage.us-sanjose-1.oraclecloud.com/p/latIzOWXypLKJJCntRi3FdYpdLCWtxu6LPr_DbcV8-ORUrWPRyxhxHFol8tI_-Oc/n/axtpft1uzfgy/b/ordenes-app/o/";

// URL PÚBLICA (Para lectura - GET)
const ORACLE_PUBLIC_URL_BASE = "https://objectstorage.us-sanjose-1.oraclecloud.com/n/axtpft1uzfgy/b/ordenes-app/o/";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
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

  // Estados para imágenes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Archivos nuevos a subir
  const [existingUrls, setExistingUrls] = useState<string[]>([]); // URLs que ya existían (edición)
  const [uploading, setUploading] = useState(false);

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
      
      // Manejar imágenes existentes (Si el backend ya soporta array o string único)
      if (Array.isArray((order as any).fotos)) {
        setExistingUrls((order as any).fotos);
      } else if (order.imagenUrl) {
        setExistingUrls([order.imagenUrl]);
      } else {
        setExistingUrls([]);
      }
    } else {
      // Resetear formulario
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
      setExistingUrls([]);
    }
    setSelectedFiles([]);
    setErrors({});
  }, [order, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.direccionRecogida.trim()) newErrors.direccionRecogida = 'Requerido';
    if (!formData.direccionEntrega.trim()) newErrors.direccionEntrega = 'Requerido';
    if (!formData.clienteNombre.trim()) newErrors.clienteNombre = 'Requerido';
    if (!formData.clienteTelefono.trim()) newErrors.clienteTelefono = 'Requerido';
    if (formData.precio <= 0) newErrors.precio = 'Debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // --- FUNCIÓN DE SUBIDA A ORACLE ---
  const uploadToOracle = async (file: File): Promise<string> => {
    // Limpiar nombre y agregar timestamp para unicidad
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const objectName = `ordenes/${Date.now()}_${cleanName}`;
    const uploadUrl = `${ORACLE_UPLOAD_BASE_URL}${objectName}`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                // Oracle requiere Content-Type o fallback
                'Content-Type': file.type || 'application/octet-stream', 
            },
        });

        if (!response.ok) {
            throw new Error(`Error Oracle: ${response.statusText}`);
        }

        // Retornar la URL pública final
        return `${ORACLE_PUBLIC_URL_BASE}${objectName}`;
    } catch (error) {
        console.error("Fallo al subir imagen:", error);
        throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
        setUploading(true);
        
        // 1. Subir las nuevas imágenes a Oracle
        let newUploadedUrls: string[] = [];
        if (selectedFiles.length > 0) {
            newUploadedUrls = await Promise.all(selectedFiles.map(file => uploadToOracle(file)));
        }

        // 2. Combinar URLs existentes con las nuevas
        const todasLasFotos = [...existingUrls, ...newUploadedUrls];

        // 3. Construir el objeto JSON exacto que pediste
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            direccionRecogida: formData.direccionRecogida,
            direccionEntrega: formData.direccionEntrega,
            clienteNombre: formData.clienteNombre,
            clienteTelefono: formData.clienteTelefono,
            precio: Number(formData.precio), // Asegurar que sea número
            prioridad: formData.prioridad,
            notas: formData.notas,
            fotos: todasLasFotos // Array de strings
        };

        console.log("🚀 Enviando JSON al backend:", payload);

        // 4. Enviar al backend (que ahora recibirá JSON, no FormData)
        const success = await onSubmit(payload);
        
        if (success) {
          onClose();
        }
    } catch (error) {
        console.error("Error al crear orden:", error);
        alert("Hubo un problema al subir las imágenes o guardar la orden.");
    } finally {
        setUploading(false);
    }
  };

  const handleChange = (field: keyof CreateOrderRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: any = e.target.value;
    if (field === 'precio') value = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectChange = (field: keyof CreateOrderRequest) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#0a3d35', color: 'white' }}>
        {order ? 'Editar Encargo' : 'Nuevo Encargo'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            {/* --- SECCIÓN DE FOTOS --- */}
            <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                <Box textAlign="center" mb={2}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        disabled={uploading}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} disabled={uploading}>
                            {selectedFiles.length > 0 || existingUrls.length > 0 ? 'Agregar más fotos' : 'Subir Fotos'}
                        </Button>
                    </label>
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                        JPG, PNG (Max 5MB). Se guardan en Oracle Cloud.
                    </Typography>
                </Box>

                {/* Galería de Previsualización */}
                <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                    
                    {/* Imágenes ya existentes (URL) */}
                    {existingUrls.map((url, index) => (
                        <Box key={`exist-${index}`} position="relative" width={100} height={100}>
                            <img src={url} alt="Existente" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid #4caf50' }} />
                            <IconButton 
                                size="small" 
                                onClick={() => removeExistingUrl(index)}
                                disabled={uploading}
                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' } }}
                            >
                                <DeleteIcon sx={{ fontSize: 12 }} />
                            </IconButton>
                        </Box>
                    ))}

                    {/* Imágenes nuevas (File) */}
                    {selectedFiles.map((file, index) => (
                        <Box key={`new-${index}`} position="relative" width={100} height={100}>
                            <img src={URL.createObjectURL(file)} alt="Nuevo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid #2196f3' }} />
                            <IconButton 
                                size="small" 
                                onClick={() => removeNewFile(index)}
                                disabled={uploading}
                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', width: 20, height: 20, '&:hover': { bgcolor: 'error.dark' } }}
                            >
                                <DeleteIcon sx={{ fontSize: 12 }} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
                
                {uploading && (
                    <Box mt={2}>
                        <LinearProgress />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 1, color: 'primary.main' }}>
                            Subiendo imágenes y creando orden...
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Formulario de Texto */}
            <Box>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre del encargo"
                  value={formData.nombre}
                  onChange={handleChange('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  fullWidth required disabled={uploading}
                />
                <TextField
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleChange('descripcion')}
                  multiline rows={2} fullWidth disabled={uploading}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>Datos del Cliente</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nombre del cliente"
                  value={formData.clienteNombre}
                  onChange={handleChange('clienteNombre')}
                  error={!!errors.clienteNombre}
                  helperText={errors.clienteNombre}
                  sx={{ flex: 1 }} required disabled={uploading}
                />
                <TextField
                  label="Teléfono"
                  value={formData.clienteTelefono}
                  onChange={handleChange('clienteTelefono')}
                  error={!!errors.clienteTelefono}
                  helperText={errors.clienteTelefono}
                  sx={{ flex: 1 }} required disabled={uploading}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>Ubicaciones</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Dirección de recogida"
                  value={formData.direccionRecogida}
                  onChange={handleChange('direccionRecogida')}
                  error={!!errors.direccionRecogida}
                  helperText={errors.direccionRecogida}
                  fullWidth required disabled={uploading}
                />
                <TextField
                  label="Dirección de entrega"
                  value={formData.direccionEntrega}
                  onChange={handleChange('direccionEntrega')}
                  error={!!errors.direccionEntrega}
                  helperText={errors.direccionEntrega}
                  fullWidth required disabled={uploading}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Precio"
                type="number"
                value={formData.precio}
                onChange={handleChange('precio')}
                error={!!errors.precio}
                helperText={errors.precio}
                sx={{ flex: 1 }} required inputProps={{ min: 0, step: 0.01 }} disabled={uploading}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.prioridad}
                  onChange={handleSelectChange('prioridad')}
                  label="Prioridad"
                  disabled={uploading}
                >
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="media">Media</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="urgente">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Notas adicionales"
              value={formData.notas}
              onChange={handleChange('notas')}
              fullWidth multiline rows={2} disabled={uploading}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading || uploading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || uploading} sx={{ minWidth: 100 }}>
            {loading || uploading ? 'Procesando...' : order ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderForm;