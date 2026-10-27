# CanchaYa API

API REST para la reserva de canchas deportivas. Node.js + Express + MongoDB Atlas, con arquitectura en capas.

## Instalación

```bash
npm install
cp .env.example .env.development   # y poner el MONGODB_URI real
npm run seed                        # datos de ejemplo
npm run dev                         # http://localhost:3000/api
```

## Arquitectura

```
src/
  config/        Variables de entorno y conexión a MongoDB
  routes/        Endpoints y verbos HTTP
  controllers/   Reciben req y devuelven res (sin lógica de negocio)
  services/      Lógica de negocio (cálculo de total, cruces de horario)
  models/        Esquemas de Mongoose (User, Cancha, Reserva)
  middlewares/   Validaciones, 404 y manejo global de errores
  utils/         AppError, constantes y funciones de tiempo
scripts/seed.js  Carga de datos de ejemplo
```

## Endpoints (Sprint 1)

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/health | Estado de la API |
| GET | /api/canchas?deporte= | Listar canchas activas (filtro opcional) |
| GET | /api/canchas/:id | Detalle de una cancha |
| POST | /api/canchas | Crear cancha |
| PUT | /api/canchas/:id | Actualizar cancha |
| DELETE | /api/canchas/:id | Desactivar cancha (borrado lógico) |
| GET | /api/reservas?usuario=&cancha=&estado= | Listar reservas |
| POST | /api/reservas | Crear reserva (valida cruces de horario) |
| PATCH | /api/reservas/:id/cancelar | Cancelar reserva |

## Entornos

`.env.development`, `.env.test` y `.env.production` (no se suben al repositorio). Ver `.env.example`.
