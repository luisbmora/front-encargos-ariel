# Guía de Despliegue en Oracle Cloud

Esta guía te ayudará a desplegar tu aplicación React en Oracle Cloud Infrastructure (OCI).

## Opción 1: Object Storage (Hosting Estático) - RECOMENDADO

Esta es la opción más simple y económica para aplicaciones React.

### Requisitos Previos
1. Cuenta de Oracle Cloud (puedes usar el tier gratuito)
2. Acceso a la consola de OCI
3. Node.js instalado localmente

### Pasos para Desplegar

#### 1. Construir la Aplicación
```bash
npm install
npm run build
```

Esto creará una carpeta `build/` con tu aplicación optimizada.

#### 2. Configurar Object Storage en OCI

1. **Accede a la Consola de OCI**: https://cloud.oracle.com/
2. **Navega a Object Storage**:
   - Menú hamburguesa → Storage → Buckets
3. **Crea un Bucket**:
   - Click en "Create Bucket"
   - Nombre: `mi-app-react` (o el nombre que prefieras)
   - Tier: Standard
   - **Importante**: Desmarca "Emit Object Events"
   - Click "Create"

#### 3. Configurar el Bucket para Hosting Estático

1. **Haz el bucket público**:
   - Entra al bucket que creaste
   - Click en "Edit Visibility"
   - Selecciona "Public"
   - Confirma

2. **Subir archivos**:
   - Click en "Upload"
   - Arrastra todos los archivos de la carpeta `build/`
   - **Importante**: Mantén la estructura de carpetas (static/, etc.)
   - Click "Upload"

3. **Configurar index.html**:
   - En la lista de objetos, encuentra `index.html`
   - Click en los tres puntos → "View Object Details"
   - Copia la URL del objeto
   - Esta será tu URL base

#### 4. Configurar Rutas (Para React Router)

Si usas React Router, necesitas configurar redirecciones:

1. En el bucket, ve a "Settings"
2. Busca "Static Website Configuration"
3. Habilita "Static Website"
4. Index Document: `index.html`
5. Error Document: `index.html` (esto permite que React Router maneje las rutas)

#### 5. Acceder a tu Aplicación

Tu aplicación estará disponible en:
```
https://objectstorage.[region].oraclecloud.com/n/[namespace]/b/[bucket-name]/o/index.html
```

### Ventajas de Object Storage
- ✅ Muy económico (tier gratuito incluye 10GB)
- ✅ Fácil de configurar
- ✅ Escalable automáticamente
- ✅ No requiere gestión de servidores

---

## Opción 2: Compute Instance (VM con Nginx)

Si necesitas más control o un servidor backend, usa una instancia de Compute.

### Requisitos Previos
- Cuenta de Oracle Cloud
- Conocimientos básicos de Linux

### Pasos para Desplegar

#### 1. Crear una Compute Instance

1. **Navega a Compute**:
   - Menú → Compute → Instances
2. **Create Instance**:
   - Name: `react-app-server`
   - Image: Ubuntu 22.04 (Always Free eligible)
   - Shape: VM.Standard.E2.1.Micro (Always Free)
   - Networking: Usa la VCN por defecto
   - **Importante**: Guarda la clave SSH privada

#### 2. Configurar Firewall

1. En la instancia, ve a "Subnet" → "Security List"
2. Agrega Ingress Rules:
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `80` (HTTP)
   - Destination Port: `443` (HTTPS)

#### 3. Conectar a la Instancia

```bash
ssh -i /ruta/a/tu/clave.key ubuntu@[IP_PUBLICA]
```

#### 4. Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 5. Subir y Configurar la Aplicación

En tu máquina local:
```bash
# Construir la app
npm run build

# Comprimir los archivos
tar -czf build.tar.gz build/

# Subir a la instancia
scp -i /ruta/a/tu/clave.key build.tar.gz ubuntu@[IP_PUBLICA]:~
```

En la instancia:
```bash
# Descomprimir
tar -xzf build.tar.gz

# Mover a la carpeta de Nginx
sudo rm -rf /var/www/html/*
sudo cp -r build/* /var/www/html/

# Configurar Nginx para React Router
sudo nano /etc/nginx/sites-available/default
```

Reemplaza el contenido con:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Reinicia Nginx:
```bash
sudo systemctl restart nginx
```

#### 6. Acceder a tu Aplicación

Tu app estará disponible en: `http://[IP_PUBLICA]`

### Ventajas de Compute Instance
- ✅ Control total del servidor
- ✅ Puedes agregar backend en el mismo servidor
- ✅ Configuración personalizada
- ✅ Tier gratuito disponible

---

## Opción 3: Container Instances (Docker)

Para aplicaciones más complejas o que requieren contenedores.

### Requisitos Previos
- Docker instalado localmente
- Oracle Container Registry configurado

### Pasos Rápidos

1. **Crear Dockerfile** (ver archivo `Dockerfile` en el proyecto)
2. **Construir imagen**:
   ```bash
   docker build -t mi-app-react .
   ```
3. **Subir a Oracle Container Registry**
4. **Crear Container Instance en OCI**

---

## Variables de Entorno

Si tu app usa variables de entorno (API URLs, etc.), necesitas configurarlas:

### Para Object Storage:
Las variables deben estar en tiempo de build:
```bash
# Crear archivo .env.production
REACT_APP_API_URL=https://tu-api.com
REACT_APP_SOCKET_URL=wss://tu-socket.com

# Construir con las variables
npm run build
```

### Para Compute Instance:
Puedes usar un script de inicio o configurar Nginx para inyectar variables.

---

## Recomendación

Para tu aplicación React:
1. **Desarrollo/Testing**: Usa Object Storage (más rápido y simple)
2. **Producción con Backend**: Usa Compute Instance con Nginx
3. **Aplicación Compleja**: Usa Container Instances

---

## Costos Estimados

- **Object Storage**: ~$0.0255 por GB/mes (10GB gratis en tier gratuito)
- **Compute Instance**: Gratis con VM.Standard.E2.1.Micro (Always Free)
- **Container Instances**: Desde $0.00001 por OCPU-segundo

---

## Troubleshooting

### Problema: Las rutas de React Router no funcionan
**Solución**: Configura el error document como `index.html` en Object Storage, o usa `try_files` en Nginx.

### Problema: Los archivos estáticos no cargan
**Solución**: Verifica que la estructura de carpetas se mantuvo al subir (especialmente la carpeta `static/`).

### Problema: CORS errors
**Solución**: Configura CORS en tu backend o usa un proxy en Nginx.

---

## Próximos Pasos

1. Configura un dominio personalizado
2. Agrega HTTPS con Let's Encrypt (para Compute Instance)
3. Configura CI/CD con GitHub Actions
4. Implementa monitoreo con OCI Monitoring

