// src/presentation/pages/HomePage.tsx
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import theme from "../../theme/theme";
import { useSocket, useOrderUpdates } from "../../hooks/useSocket";
import DeliveryMap from "../components/DeliveryMap";
import OrdersList from "../components/OrdersList";

export default function HomePage() {
  const { isConnected } = useSocket();
  const orders = useOrderUpdates();

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
        <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Pedidos Hoy</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.length || 24}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Repartidores Activos</Typography>
          <Typography variant="h4" fontWeight="bold">
            5
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, bgcolor: theme.palette.secondary.light }}>
          <Typography variant="h6">Pendientes</Typography>
          <Typography variant="h4" fontWeight="bold">
            {orders.filter((o) => o.status === "pending").length || 8}
          </Typography>
        </Paper>
      </Stack>

      {/* Últimos pedidos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <OrdersList />
      </Paper>

      {/* Monitoreo repartidores */}
      <Paper sx={{ p: 3 }}>
        <DeliveryMap />
      </Paper>
    </Box>
  );
}
