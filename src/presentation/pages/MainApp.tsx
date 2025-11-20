// src/presentation/pages/MainApp.tsx
import React from "react";
import Layout from "../components/Layout";
import { useNavigation } from "../../app/NavigationContext";
import HomePage from "./HomePage";
import DeliveriesPage from "./DeliveriesPage";
import OrdersPage from "./OrdersPage";
import { Box, Typography, Paper } from "@mui/material";
import theme from "../../theme/theme";

const RoutesPage: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Typography
      variant="h4"
      fontWeight="bold"
      color={theme.palette.primary.main}
      sx={{ mb: 3 }}
    >
      Rutas
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        Página de rutas en desarrollo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Aquí podrás optimizar y gestionar las rutas de entrega
      </Typography>
    </Paper>
  </Box>
);

const MainApp: React.FC = () => {
  const { currentPage } = useNavigation();

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "deliveries":
        return "Repartidores";
      case "orders":
        return "Pedidos";
      case "routes":
        return "Rutas";
      default:
        return "Dashboard";
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <HomePage />;
      case "deliveries":
        return <DeliveriesPage />;
      case "orders":
        return <OrdersPage />;
      case "routes":
        return <RoutesPage />;
      default:
        return <HomePage />;
    }
  };

  return <Layout title={getPageTitle()}>{renderCurrentPage()}</Layout>;
};

export default MainApp;
