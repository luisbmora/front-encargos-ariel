# 🚚 CRUD de Repartidores - Configuración

## ✅ Funcionalidades Implementadas

### 🎯 CRUD Completo
- ✅ **Crear** repartidores con validación de formularios
- ✅ **Leer** lista completa con paginación y filtros
- ✅ **Actualizar** información de repartidores existentes
- ✅ **Eliminar** repartidores con confirmación
- ✅ **Activar/Desactivar** estado de repartidores

### 📱 Diseño Responsivo
- ✅ **Vista de tabla** para desktop
- ✅ **Vista de tarjetas** para móviles
- ✅ **FAB (Floating Action Button)** en móviles
- ✅ **Navegación adaptativa** con drawer colapsible

### 🎨 Tema Personalizado
- ✅ Colores morado (#6A1B9A) y amarillo (#FFD600)
- ✅ Tipografía Roboto consistente
- ✅ Componentes Material-UI estilizados

### 🔒 Seguridad
- ✅ **Rutas protegidas** con autenticación
- ✅ **Interceptores Axios** para tokens JWT
- ✅ **Manejo de errores** centralizado
- ✅ **Validación de formularios** client-side

## 🛠️ Configuración del Backend

### Endpoints Esperados (REST API)

```typescript
// GET /api/deliveries - Obtener todos los repartidores
// GET /api/deliveries/:id - Obtener repartidor por ID
// POST /api/deliveries - Crear nuevo repartidor
// PUT /api/deliveries/:id - Actualizar repartidor
// DELETE /api/deliveries/:id - Eliminar repartidor
// PATCH /api/deliveries/:id/toggle-status - Cambiar estado
```

### Estructura de Datos

```typescript
interface Delivery {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'walking';
  vehiclePlate?: string;
  isActive: boolean;
  currentLocation?: { lat: number; lng: number };
  rating?: number;
  totalDeliveries?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Headers de Autenticación

```typescript
// Todos los requests incluyen automáticamente:
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🚀 Cómo Usar

### 1. Navegación
- Haz clic en **"Repartidores"** en el menú lateral
- La página se carga automáticamente con la lista actual

### 2. Crear Repartidor
- **Desktop**: Botón "Nuevo Repartidor" en la esquina superior derecha
- **Móvil**: FAB (botón flotante) en la esquina inferior derecha
- Completa el formulario y haz clic en "Crear"

### 3. Editar Repartidor
- Haz clic en el ícono de **lápiz** (✏️) en la fila del repartidor
- Modifica los campos necesarios y haz clic en "Actualizar"

### 4. Activar/Desactivar
- Haz clic en el ícono de **toggle** (🔄) para cambiar el estado
- Los repartidores inactivos aparecen con chip rojo

### 5. Eliminar Repartidor
- Haz clic en el ícono de **papelera** (🗑️)
- Confirma la eliminación en el diálogo

## 📊 Características Técnicas

### Estado Global
- **React Context** para navegación entre páginas
- **Custom Hooks** para manejo de estado de repartidores
- **Error Handling** centralizado con mensajes de usuario

### Validaciones
- **Email** formato válido requerido
- **Teléfono** campo obligatorio
- **Placa** requerida para motos y autos
- **Nombre** campo obligatorio

### Performance
- **Lazy Loading** de componentes
- **Memoización** de componentes pesados
- **Debounce** en búsquedas (futuro)
- **Paginación** del lado del servidor (futuro)

## 🔧 Personalización

### Cambiar Endpoints
Edita `src/api/deliveryApi.ts`:
```typescript
// Cambiar la base URL
const response = await axios.get('/tu-endpoint/deliveries');
```

### Agregar Campos
1. Actualiza `src/types/delivery.ts`
2. Modifica `src/presentation/components/DeliveryForm.tsx`
3. Actualiza la tabla en `src/presentation/pages/DeliveriesPage.tsx`

### Cambiar Colores
Edita `src/theme/theme.ts`:
```typescript
primary: {
  main: '#TU_COLOR_AQUI',
}
```

## 🐛 Troubleshooting

### Error de CORS
```typescript
// En tu backend, agrega:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Token Expirado
- El sistema redirige automáticamente al login
- Verifica que tu backend envíe tokens válidos

### Datos No Cargan
1. Verifica que tu API esté corriendo en `localhost:3000`
2. Revisa la consola del navegador para errores
3. Confirma que los endpoints coincidan con los esperados

## 📱 Responsive Breakpoints

- **xs**: 0px - 599px (móviles)
- **sm**: 600px - 959px (tablets)
- **md**: 960px - 1279px (desktop pequeño)
- **lg**: 1280px+ (desktop grande)

¡El CRUD está listo para usar! 🎉