# Sistema de Pedidos - API & Orquestador

Este proyecto consiste en un sistema de microservicios para la gestión de pedidos, clientes y productos, orquestado por una función Lambda.

## 🚀 Comandos para Levantar

Para iniciar todo el entorno (Base de datos, APIs y Orquestador) usando Docker Compose:

```bash
docker-compose up -d --build
```

Esto levantará los siguientes servicios:
- **MySQL**: Base de datos compartida.
- **Customers API**: Gestión de clientes.
- **Orders API**: Gestión de pedidos y productos.
- **Lambda Orchestrator**: Orquestador de creación y confirmación de pedidos.
- **Adminer**: Interfaz web para gestionar la base de datos.

Para detener el entorno:
```bash
docker-compose down
```

## 🌐 URLs Base

Si estás ejecutando en Docker (puertos expuestos en localhost):

| Servicio | URL Base | Puerto |
|----------|----------|--------|
| **Customers API** | `http://localhost:3001` | 3001 |
| **Orders API** | `http://localhost:3002` | 3002 |
| **Lambda Orchestrator** | `http://localhost:3000` | 3000 |
| **Adminer (DB UI)** | `http://localhost:8080` | 8080 |

## 🔑 Variables de Entorno

Las variables principales están configuradas en `docker-compose.yml`.

**Comunes:**
- `SERVICE_TOKEN`: Token compartido para autenticación entre servicios.
- `DB_HOST`, `DB_USER`, `DB_PASS`: Credenciales de base de datos.

**Orders API:**
- `CUSTOMERS_API_BASE`: URL de la API de clientes.

**Lambda Orchestrator:**
- `CUSTOMERS_API_BASE`: URL de la API de clientes.
- `ORDERS_API_BASE`: URL de la API de pedidos.

## 📡 Ejemplos cURL

### 1. Crear un Producto (Orders API)
```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Producto Ejemplo",
    "price_cents": 1500,
    "stock": 100
  }'
```

### 2. Crear un Cliente (Customers API)
```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Perez",
    "email": "juan@example.com",
    "phone": "+5555555555"
  }'
```

### 3. Crear una Orden Directamente (Orders API)
```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      { "product_id": 1, "qty": 2 }
    ]
  }'
```

## ⚡ Cómo Invocar el Lambda

El Orquestador (`createAndConfirmOrder`) recibe un pedido, lo crea en Orders API y luego lo confirma, todo en una sola transacción distribuida (simulada).

### En Local (con Docker / Serverless Offline)
El servicio corre en el puerto 3000.

**Endpoint:** `POST /dev/orders`

```bash
curl -X POST http://localhost:3000/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
        { "product_id": 1, "qty": 1 }
    ]
  }'
```

### En AWS (Despliegue Real)
*Nota: Asegúrate de tener configurado AWS CLI y Serverless Framework.*

1. **Configurar Credenciales AWS:**
   ```bash
   aws configure
   ```

2. **Desplegar:**
   Desde la carpeta `lambda-orchestrator`:
   ```bash
   npm install
   serverless deploy
   ```

3. **Invocar:**
   Una vez desplegado, obtendrás una URL (ej. `https://xyz.execute-api.us-east-1.amazonaws.com/dev/orders`).

   ```bash
   curl -X POST https://xyz.execute-api.us-east-1.amazonaws.com/dev/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customer_id": 1,
       "items": [{ "product_id": 1, "qty": 1 }]
     }'
   ```
