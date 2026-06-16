# LoGan Store 🧴

Plataforma de e-commerce para una perfumería, desarrollada como proyecto full-stack con **Laravel** en el backend y **React** en el frontend.

> 🔗 **Demo en producción:** [logan-store-site-production.up.railway.app](https://logan-store-site-production.up.railway.app/)
> *(El demo puede no estar disponible si el hosting gratuito ha expirado. Consulta la sección de instalación local para correrlo en tu máquina.)*
>
> **Credenciales de prueba (admin):**
> - Email: `admin@loganstore.com`
> - Password: `admin123456`

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Base de datos | MySQL |
| Autenticación | Laravel Sanctum (tokens) |
| Gráficas | Recharts |
| Deploy | Railway |

---

## Funcionalidades

### Cliente
- Registro e inicio de sesión con autenticación por tokens
- Catálogo de productos con filtros por categoría, marca y búsqueda
- Detalle de producto con reseñas y calificaciones
- Carrito de compras persistente (localStorage) con validación de stock en tiempo real
- Checkout con selección de dirección, método de pago (efectivo o tarjeta) y cupones de descuento
- Historial de pedidos con estado de envío
- Solicitud de devoluciones

### Administrador
- Panel de administración para gestión de productos, cupones y envíos
- Dashboard de ventas con gráficas de barras filtrables por período (hoy, semana, mes, año)
- Auto-refresh cada 30 segundos
- Alertas de stock bajo
- Gestión de envíos por paquetería con número de rastreo
- Aprobación o rechazo de devoluciones

---

## Estructura de la base de datos

```
users           → clientes y administradores (roles: customer, admin)
categories      → categorías de productos
brands          → marcas de perfumes
products        → catálogo con inventario (stock, min_stock, reorder_point)
orders          → pedidos con dirección y total con descuento aplicado
order_items     → productos individuales de cada pedido
reviews         → reseñas y calificaciones de productos
addresses       → direcciones de envío de los clientes
coupons         → cupones de descuento (porcentaje o monto fijo)
shipments       → información de envío por paquetería
order_returns   → solicitudes de devolución
```

---

## Instalación local

### Requisitos
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/JoelZzc/logan-store-site.git
cd logan-store-site/backend

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias Node
npm install

# 4. Configurar entorno
cp .env.example .env
php artisan key:generate

# 5. Configurar base de datos en .env
# DB_DATABASE=logan_store_db
# DB_USERNAME=root
# DB_PASSWORD=tu_password

# 6. Correr migraciones y seeders
php artisan migrate --seed

# 7. Iniciar servidores (en terminales separadas)
php artisan serve
npm run dev
```

Abre [http://localhost:8000](http://localhost:8000)

El seeder crea automáticamente:
- Un usuario admin (`admin@loganstore.com` / `admin123456`)
- Categorías, marcas y productos de ejemplo

---

## Variables de entorno necesarias

```env
APP_NAME="Logan Store"
APP_ENV=production
APP_KEY=
APP_URL=https://tu-dominio.com

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=file
CACHE_STORE=file
```

---

## Arquitectura

```
Browser (React SPA)
      ↕ HTTP/JSON
Laravel API (routes/api.php)
      ↕ Eloquent ORM
MySQL
```

El frontend es un SPA servido por Laravel con Vite. React Router maneja las rutas del cliente y Axios consume la API REST.

---

## Autor

Desarrollado por **Joel Zazueta Carrillo** como proyecto de portafolio.
