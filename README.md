# CanchaYa API

![CI](https://github.com/Harrihurtado/canchas-api/actions/workflows/ci.yml/badge.svg)

API REST para la reserva de canchas deportivas. Node.js + Express + MongoDB Atlas, con arquitectura en capas,
autenticación JWT y una estrategia de pruebas automatizadas (Jest, Postman/Newman, JMeter y GitHub Actions).

## Instalación

```bash
npm install
cp .env.example .env.development   # poner el MONGODB_URI y JWT_SECRET reales
npm run seed                        # datos de ejemplo (admin, cliente y canchas)
npm run dev                         # http://localhost:3000/api
```

Usuarios del seed: `admin@canchaya.com` / `Admin123!` y `cliente@canchaya.com` / `Cliente123!`.

## Arquitectura

```
src/
  config/        Variables de entorno por ambiente y conexión a MongoDB
  routes/        Endpoints y verbos HTTP
  controllers/   Reciben req y devuelven res (sin lógica de negocio)
  services/      Lógica de negocio (total, cruces de horario, permisos, paginación)
  models/        Esquemas de Mongoose (User, Cancha, Reserva) e índices
  middlewares/   Autenticación JWT, autorización por rol, validaciones, 404 y errores
  utils/         AppError, JWT, constantes y funciones de tiempo
scripts/seed.js  Carga de datos de ejemplo
tests/           unit/ e integration/ (top-down, bottom-up, big-bang)
postman/         Colección y environment de Postman
jmeter/          Planes de carga y estrés
docs/            Informe de pruebas de rendimiento
```

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | /api/health | Público | Estado de la API |
| POST | /api/auth/register | Público | Registro (siempre con rol cliente) |
| POST | /api/auth/login | Público | Login, devuelve un JWT |
| GET | /api/users/me | Autenticado | Mi perfil |
| PUT | /api/users/me | Autenticado | Actualizar nombre y teléfono |
| GET | /api/users | Admin | Listar usuarios |
| GET | /api/canchas?deporte= | Público | Listar canchas activas |
| GET | /api/canchas/:id | Público | Detalle de una cancha |
| POST | /api/canchas | Admin | Crear cancha |
| PUT | /api/canchas/:id | Admin | Actualizar cancha |
| DELETE | /api/canchas/:id | Admin | Desactivar cancha (borrado lógico) |
| GET | /api/reservas?pagina=&limite=&estado=&cancha= | Autenticado | Listar reservas paginadas (cliente: solo las suyas) |
| POST | /api/reservas | Autenticado | Crear reserva (valida cruces de horario) |
| PATCH | /api/reservas/:id/cancelar | Dueño o admin | Cancelar reserva |

## Pruebas

| Comando | Qué ejecuta |
|---|---|
| `npm run test:unit` | Pruebas unitarias (services, utils y middlewares con mocks) |
| `npm run test:integration` | Integración Top-down (stubs), Bottom-up (drivers) y Big Bang (requiere BD de pruebas) |
| `npm run test:coverage` | Todas las pruebas de Jest con reporte de cobertura |
| `npm run test:api` | Colección de Postman con Newman (requiere la API corriendo y `npm run seed`) |

Las pruebas de rendimiento se ejecutan con JMeter en modo consola (ver `docs/pruebas-rendimiento.md`).

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada push a `main`/`develop` y en cada Pull Request:

1. **Jest**: auditoría de dependencias de producción, pruebas unitarias e integración con cobertura
   (contenedor efímero de MongoDB).
2. **Newman**: carga datos de prueba, levanta la API y ejecuta la colección de Postman.

Los reportes de cobertura y de Newman quedan como artefactos de cada ejecución.

## Flujo de trabajo

- `main`: versiones entregadas, con un tag por sprint (`v1.0.0-sprint1`, `v2.0.0-sprint2`).
- `develop`: integración.
- `feature/CY-XX-...` y `bugfix/CY-XX-...`: una rama por historia o defecto de Jira, fusionada con Pull Request.

## Entornos

`.env.development`, `.env.test` y `.env.production` (no se suben al repositorio). Ver `.env.example`.
En CI las variables se inyectan desde el workflow y desde GitHub Secrets.
