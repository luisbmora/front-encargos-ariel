#!/bin/bash

# Script de despliegue automatizado para Oracle Cloud Compute Instance

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Despliegue a Oracle Cloud ===${NC}"

# Variables - CONFIGURA ESTAS VARIABLES
SERVER_IP="TU_IP_PUBLICA"
SSH_KEY="ruta/a/tu/clave.key"
REMOTE_USER="ubuntu"

# Verificar que las variables estén configuradas
if [ "$SERVER_IP" = "TU_IP_PUBLICA" ]; then
    echo -e "${RED}Error: Configura SERVER_IP en el script${NC}"
    exit 1
fi

if [ "$SSH_KEY" = "ruta/a/tu/clave.key" ]; then
    echo -e "${RED}Error: Configura SSH_KEY en el script${NC}"
    exit 1
fi

# 1. Construir la aplicación
echo -e "${BLUE}1. Construyendo la aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al construir la aplicación${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completado${NC}"

# 2. Comprimir archivos
echo -e "${BLUE}2. Comprimiendo archivos...${NC}"
tar -czf build.tar.gz build/
echo -e "${GREEN}✓ Archivos comprimidos${NC}"

# 3. Subir a servidor
echo -e "${BLUE}3. Subiendo archivos al servidor...${NC}"
scp -i "$SSH_KEY" build.tar.gz "$REMOTE_USER@$SERVER_IP":~

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al subir archivos${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Archivos subidos${NC}"

# 4. Desplegar en servidor
echo -e "${BLUE}4. Desplegando en servidor...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_USER@$SERVER_IP" << 'ENDSSH'
    # Descomprimir
    tar -xzf build.tar.gz
    
    # Backup del anterior (opcional)
    sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    
    # Desplegar nueva versión
    sudo rm -rf /var/www/html/*
    sudo cp -r build/* /var/www/html/
    
    # Limpiar
    rm -rf build build.tar.gz
    
    # Reiniciar Nginx
    sudo systemctl restart nginx
    
    echo "Despliegue completado en el servidor"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al desplegar en servidor${NC}"
    exit 1
fi

# 5. Limpiar archivos locales
rm build.tar.gz

echo -e "${GREEN}=== Despliegue completado exitosamente ===${NC}"
echo -e "${BLUE}Tu aplicación está disponible en: http://$SERVER_IP${NC}"
