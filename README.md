# Orders System

Sistema de orquestación de pedidos con microservicios (Customer API, Orders API) y Lambda Orchestrator desplegable en AWS.

## Arquitectura

```
┌─────────────────┐
│ Lambda          │ ──┐
│ Orchestrator    │   │
└─────────────────┘   │
                      ├──► ┌──────────────┐
┌─────────────────┐   │    │   MySQL      │
│ Customers API   │ ──┤    │   Database   │
└─────────────────┘   │    └──────────────┘
                      │
┌─────────────────┐   │
│ Orders API      │ ──┘
└─────────────────┘
```

## Setup Local (Docker)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Generar token seguro:
```bash
openssl rand -hex 32
```

Editar `.env` y reemplazar `SERVICE_TOKEN` con el token generado.

### 2. Levantar servicios

```bash
docker-compose up -d --build  mysql customers-api orders-api adminer
```

### 3. health checks

```bash
curl http://localhost:3001/health  # Customers API
curl http://localhost:3002/health  # Orders API
```

## Configuración EC2

### 1. Preparar EC2 (prevenir OOM en npm install, si se usa t3.micro)

Crear swap de 2GB:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Instalar Node.js:

```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs
node --version  # Verificar v22.x
```

### 2. Levantar APIs en EC2

Clonar repo y configurar:

```bash
git clone https://github.com/andresao1123/Backoffice-pedidos-B2B.git
cd Backoffice-pedidos-B2B

# Configurar .env con IP pública del EC2
cp .env.example .env
nano .env  # Editar SERVICE_TOKEN y passwords,recomendable usar las passwords de las APIs para la base de datos
```

Levantar con Docker:

```bash
docker-compose up -d --build
```

### 3. Configurar Lambda para deployment

En tu máquina local (dentro de `lambda-orchestrator/`):

```bash
cd lambda-orchestrator
cp .env.aws.example .env

# Editar .env con datos reales
nano .env
```

Ejemplo `.env`:
```bash
CUSTOMERS_API_BASE=http://54.123.45.67:3001
ORDERS_API_BASE=http://54.123.45.67:3002
SERVICE_TOKEN=8f3e9a2b7c6d5e4f3a2b1c9d8e7f6a5b4c3d2e1f9a8b7c6d5e4f3a2b1c0d9e8f
AWS_REGION=us-east-2
```

Instalar Serverless Framework:

```bash
npm install serverless@3.40.0
```

Configurar AWS credentials:

```bash
aws configure
# Ingresar: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region
```

Deploy a AWS:

```bash
cd lambda-orchestrator
npm run deploy
```

Guardar la URL del endpoint que aparece al final del deploy.

## Testing Local

### Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-service-token-change-in-production" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+593999999999"
  }'
```

### Crear orden (orquestador local)

```bash
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"productName": "Laptop", "quantity": 1, "price": 1200}
    ]
  }'
```

## Testing AWS Lambda

Usando la URL del deploy:

```bash
curl -X POST https://abc123.execute-api.us-east-2.amazonaws.com/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"productName": "Mouse", "quantity": 2, "price": 25}
    ]
  }'
```

## Invocar Lambda Localmente

Dentro de `lambda-orchestrator/`:

```bash
# Configurar .env.example con URLs locales
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar serverless-offline
docker-compose up -d --build lambda-orchestrator
```

Testear:

```bash
curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"productName": "Teclado", "quantity": 1, "price": 80}
    ]
  }'
```

## URLs y Puertos

| Servicio | Local | EC2 | AWS Lambda |
|----------|-------|-----|------------|
| Customers API | `http://localhost:3001` | `http://<EC2-IP>:3001` | N/A |
| Orders API | `http://localhost:3002` | `http://<EC2-IP>:3002` | N/A |
| Orchestrator | `http://localhost:3000` | N/A | `https://<api-id>.execute-api.<region>.amazonaws.com` |
| Adminer (DB UI) | `http://localhost:8080` | `http://<EC2-IP>:8080` | N/A |

## Variables de Entorno Clave

**APIs (Customers/Orders):**
- `SERVICE_TOKEN`: Token de autenticación entre servicios
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Conexión MySQL

**Lambda Orchestrator:**
- `CUSTOMERS_API_BASE`: URL base de Customers API
- `ORDERS_API_BASE`: URL base de Orders API
- `SERVICE_TOKEN`: Mismo token que las APIs
- `AWS_REGION`: Región de AWS para deployment

## Troubleshooting

**Error en npm install en EC2:**
```bash
# Verificar swap
free -h
# Si no hay swap, ejecutar los comandos de la sección "Configuración EC2"
```

**Lambda no puede conectarse a APIs:**
- Verificar Security Groups del EC2 (puertos 3001, 3002 abiertos)
- Verificar que las URLs en `.env` del Lambda usen IP pública
- Confirmar que `SERVICE_TOKEN` coincida en todos los servicios

**Error de autenticación:**
```bash
# Regenerar token
openssl rand -hex 32
# Actualizar en TODOS los .env (raíz, APIs, Lambda)
```

**Si el deploy no agarra las variables de entorno del archivo .env**

```bash
#dentro de la carpeta lambda-orchestrator
export $(cat .env | xargs)
#volver a deployar con npm run deploy
```