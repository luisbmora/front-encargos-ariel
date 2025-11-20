# 🔐 Configuración del Token JWT - Backend

## ⏰ Token de 30 Minutos

Para que el token dure **30 minutos**, necesitas configurar esto en tu **backend**:

### 📝 Configuración en Node.js/Express

```javascript
// En tu archivo de configuración JWT (ej: auth.js)
const jwt = require('jsonwebtoken');

// Al generar el token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      rol: user.rol 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '30m' // 30 minutos
      // Otras opciones:
      // expiresIn: '1800s' // 1800 segundos = 30 minutos
      // expiresIn: '0.5h'  // 0.5 horas = 30 minutos
    }
  );
};

// Ejemplo de login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    // ... validación de usuario ...
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});
```

### 🔧 Variables de Entorno

```bash
# .env
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=30m
```

### 🛡️ Middleware de Verificación

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = verifyToken;
```

## ✅ Frontend Ya Configurado

El **frontend** ya está preparado para:

### 🔄 Persistencia de Sesión
- ✅ Mantiene la sesión al recargar la página
- ✅ Verifica automáticamente si el token está expirado
- ✅ Limpia la sesión cuando el token expira

### ⚠️ Advertencias de Expiración
- ✅ Muestra advertencia cuando quedan 5 minutos
- ✅ Permite al usuario extender la sesión
- ✅ Cierra sesión automáticamente cuando expira

### 🛠️ Utilidades de Token
- ✅ `TokenUtils.isTokenExpired()` - Verificar expiración
- ✅ `TokenUtils.getTokenInfo()` - Información del token
- ✅ `TokenUtils.formatTimeUntilExpiry()` - Tiempo restante

### 📱 Componentes
- ✅ `TokenExpiryWarning` - Advertencia de expiración
- ✅ `AuthContext` mejorado - Manejo automático
- ✅ `PrivateRoute` - Protección de rutas

## 🚀 Cómo Probar

1. **Configura el backend** con token de 30 minutos
2. **Inicia sesión** en el frontend
3. **Recarga la página** - debería mantenerte logueado
4. **Espera 25 minutos** - debería mostrar advertencia
5. **Espera 30 minutos** - debería cerrar sesión automáticamente

## 🔧 Personalización

### Cambiar Tiempo de Advertencia
```typescript
// En TokenExpiryWarning.tsx, línea 18
if (TokenUtils.isTokenExpiringSoon(token, 10)) { // 10 minutos en lugar de 5
```

### Cambiar Frecuencia de Verificación
```typescript
// En AuthContext.tsx, línea 45
const interval = setInterval(() => {
  // ...
}, 30000); // 30 segundos (puedes cambiar a 60000 para 1 minuto)
```

¡El sistema está listo para tokens de 30 minutos! 🎉