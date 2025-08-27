# 📦 CRUD de Pedidos - Configuración Completa

## ✅ Funcionalidades Implementadas

### 🎯 CRUD Completo de Pedidos
- ✅ **Crear** pedidos con múltiples productos y ubicaciones en mapa
- ✅ **Leer** lista completa con filtros por estado
- ✅ **Actualizar** información de pedidos existentes
- ✅ **Eliminar** pedidos con confirmación
- ✅ **Cambiar estado** del pedido (pending → assigned → picked_up → in_transit → delivered)

### 🚚 Sistema de Asignación de Repartidores
- ✅ **Asignar repartidor** desde la página de pedidos
- ✅ **Asignar desde el mapa** haciendo clic en repartidores
- ✅ **Ver estado** de repartidores (libre/ocupado) en tiempo real
- ✅ **Desasignar** repartidores cuando sea necesario

### 🗺️ Mapa Inteligente
- ✅ **Ubicación actual** automática del usuario
- ✅ **Repartidores en tiempo real** con colores por estado:
  - 🟢 **Verde**: Libre (sin pedidos asignados)
  - 🔴 **Rojo**: Ocupado (con pedidos activos)
  - 🔵 **Azul**: Tu ubicación actual
- ✅ **Click en repartidores** para ver detalles y asignar pedidos
- ✅ **Selección de ubicaciones** en formulario de pedidos

### 📱 Diseño Responsivo
- ✅ **Vista de tabla** para desktop con todas las acciones
- ✅ **Vista de tarjetas** para móviles con información compacta
- ✅ **FAB flotante** para crear pedidos en móvil
- ✅ **Botones de cambio de estado** rápidos

## 🛠️ Configuración del Backend

### Endpoints Esperados (REST API)

```typescript
// Pedidos
GET /api/orders                    // Obtener todos los pedidos
GET /api/orders/:id                // Obtener pedido por ID
POST /api/orders                   // Crear nuevo pedido
PUT /api/orders/:id                // Actualizar pedido
DELETE /api/orders/:id             // Eliminar pedido
PATCH /api/orders/:id/status       // Cambiar estado del pedido
GET /api/orders?status=pending     // Filtrar por estado
GET /api/orders?deliveryId=123     // Pedidos de un repartidor

// Asignación de Repartidores
POST /api/orders/:id/assign        // Asignar repartidor
DELETE /api/orders/:id/assign      // Desasignar repartidor
```

### Estructura de Datos

```typescript
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryId?: string;
  deliveryName?: string;
  estimatedDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}
```

### Eventos de Socket (Tiempo Real)

```typescript
// Eventos que el frontend escucha
'order-update'     // Cuando cambia un pedido
'delivery-update'  // Cuando cambia estado de repartidor
'location-update'  // Cuando repartidor cambia ubicación

// Eventos que el frontend emite
'join-delivery'    // Unirse a sala de repartidor
'update-location'  // Actualizar ubicación
```

## 🚀 Cómo Usar el Sistema

### 1. 📦 Gestión de Pedidos

#### Crear Pedido:
1. Ve a **"Pedidos"** en el menú lateral
2. Haz clic en **"Nuevo Pedido"** (desktop) o FAB (móvil)
3. Completa la información del cliente
4. Agrega direcciones (puedes usar el mapa para ubicaciones exactas)
5. Agrega productos con cantidad y precio
6. Guarda el pedido

#### Editar Pedido:
1. Haz clic en el ícono de **lápiz** (✏️) en la fila del pedido
2. Modifica los campos necesarios
3. Guarda los cambios

#### Cambiar Estado:
- **Desde la tabla**: Los botones de estado aparecen según el flujo
- **Flujo de estados**: Pendiente → Asignado → Recogido → En Tránsito → Entregado

### 2. 🚚 Asignación de Repartidores

#### Desde Página de Pedidos:
1. Haz clic en el ícono de **asignación** (📋) en el pedido
2. Selecciona un repartidor activo de la lista
3. Confirma la asignación

#### Desde el Mapa:
1. Ve al **Dashboard** y observa el mapa
2. Haz clic en cualquier **repartidor** (marcador verde/rojo)
3. Ve sus pedidos actuales y asigna nuevos
4. Los repartidores **verdes** están libres, los **rojos** ocupados

### 3. 🗺️ Monitoreo en Tiempo Real

#### Ubicación Automática:
- El mapa se centra automáticamente en tu ubicación
- Tu posición aparece como un **punto azul**
- Los repartidores se actualizan en tiempo real

#### Estados Visuales:
- 🟢 **Verde**: Repartidor libre (sin pedidos activos)
- 🔴 **Rojo**: Repartidor ocupado (con pedidos en proceso)
- 🔵 **Azul**: Tu ubicación actual

## 📊 Métricas del Dashboard

### Tarjetas de Estadísticas:
- **Total Pedidos**: Cantidad total de pedidos
- **Pendientes**: Pedidos sin asignar
- **En Proceso**: Pedidos asignados, recogidos o en tránsito
- **Entregados**: Pedidos completados exitosamente

### Mapa Interactivo:
- **Repartidores activos** con estado en tiempo real
- **Click para asignar** pedidos directamente
- **Leyenda visual** para entender los colores

## 🔧 Personalización

### Cambiar Estados de Pedidos:
Edita `src/types/order.ts`:
```typescript
status: 'pending' | 'assigned' | 'tu_nuevo_estado' | 'delivered'
```

### Agregar Campos a Pedidos:
1. Actualiza `src/types/order.ts`
2. Modifica `src/presentation/components/OrderForm.tsx`
3. Actualiza la tabla en `src/presentation/pages/OrdersPage.tsx`

### Personalizar Mapa:
Edita `src/presentation/components/GoogleMap.tsx`:
```typescript
// Cambiar zoom por defecto
zoom = 15

// Cambiar estilo de marcadores
fill="${delivery.isOccupied ? '#tu_color' : '#otro_color'}"
```

## 🐛 Troubleshooting

### Mapa No Carga:
1. Verifica tu **API Key** de Google Maps en `.env`
2. Asegúrate de tener habilitada la **Maps JavaScript API**
3. Revisa la consola del navegador para errores

### Ubicación No Detectada:
- El navegador pedirá permisos de ubicación
- Si se niega, usará Buenos Aires por defecto
- Puedes cambiar la ubicación por defecto en `GoogleMap.tsx`

### Repartidores No Aparecen:
1. Verifica que tu **backend** esté enviando eventos de socket
2. Revisa la conexión de sockets en el indicador del header
3. Asegúrate de que los repartidores estén **activos**

### Asignación No Funciona:
1. Verifica que el endpoint `/api/orders/:id/assign` exista
2. Revisa que el repartidor esté **activo**
3. Confirma que el pedido esté en estado **"pending"**

## 🎯 Flujo Completo de Trabajo

1. **Cliente hace pedido** → Se crea en estado "pending"
2. **Administrador asigna repartidor** → Cambia a "assigned"
3. **Repartidor recoge pedido** → Cambia a "picked_up"
4. **Repartidor sale a entregar** → Cambia a "in_transit"
5. **Pedido entregado** → Cambia a "delivered"

En cualquier momento se puede **cancelar** o **reasignar** el pedido.

## 🚀 Próximas Mejoras

- **Notificaciones push** para cambios de estado
- **Optimización de rutas** automática
- **Chat en tiempo real** entre admin y repartidores
- **Historial de entregas** por repartidor
- **Reportes y analytics** avanzados

¡El sistema está completamente funcional y listo para usar! 🎉