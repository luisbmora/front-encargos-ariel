// src/presentation/pages/HomePage.tsx
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import theme from "../../theme/theme";
import { useOrders } from "../../hooks/useOrders";
import { useDeliveries } from "../../hooks/useDeliveries";
import { useAllActiveLocations } from "../../hooks/useRealTimeLocations";
import BasicMap from "../components/BasicMap";
import OrdersList from "../components/OrdersList";

export default function HomePage() {
  const { orders } = useOrders(); // obtener órdenes reales
  const { deliveries } = useDeliveries(); // obtener repartidores reales
  const { locations: realTimeLocations } = useAllActiveLocations(30000); // ubicaciones en tiempo real

  // Filtrar repartidores activos (usar ubicaciones reales si están disponibles)
  const activeDeliveries = realTimeLocations.length > 0 
    ? realTimeLocations.filter(d => d.isActive)
    : deliveries.filter(d => d.activo);

  // Filtrar pedidos pendientes
  const pendingOrders = orders.filter(o => ['pendiente', 'asignado', 'en_camino'].includes(o.estado));

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
          Panel de Control
        </Typography>
      </Box>

      {/* Tarjetas métricas */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        {/* <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Pedidos Hoy</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.length}
          </Typography>
        </Paper> */}
        {/* <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Repartidores Activos</Typography>
          <Typography variant="h4" fontWeight="bold">
            {activeDeliveries.length}
          </Typography>
        </Paper> */}
        {/* <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Pendientes</Typography>
          <Typography variant="h4" fontWeight="bold">
            {pendingOrders.length}
          </Typography>
        </Paper> */}
      </Stack>

      {/* Últimos pedidos */}
      {/* <Paper sx={{ p: 3, mb: 3 }}>
        <OrdersList />
      </Paper> */}

      {/* Mapa de todos los repartidores */}
      <Paper sx={{ p: 3 }}>
        <BasicMap />
      </Paper>
    </Box>
  );
}
