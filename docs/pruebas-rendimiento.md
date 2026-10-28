# Pruebas de rendimiento con JMeter — CanchaYa API

## 1. Objetivo
Medir el comportamiento de los endpoints críticos de la API bajo carga normal y bajo estrés,
e identificar cuellos de botella.

## 2. Endpoints evaluados

| # | Endpoint | Por qué es crítico |
|---|---|---|
| 1 | `POST /api/auth/login` | Puerta de entrada; usa bcrypt (operación costosa a propósito) |
| 2 | `GET /api/canchas` | Endpoint público más consultado |
| 3 | `GET /api/canchas/:id` | Consulta por id |
| 4 | `POST /api/reservas` | Escritura con validación de cruces de horario |
| 5 | `GET /api/reservas` | Consulta con `populate` entre colecciones |

## 3. Entorno de la prueba

| Elemento | Valor |
|---|---|
| Equipo | (procesador, RAM) |
| API | Node.js `npm start` (modo producción), local |
| Base de datos | MongoDB Atlas M0 (`canchas_dev`) |
| Herramienta | Apache JMeter 5.6.x en modo consola (sin GUI) |
| Fecha | |

## 4. Escenarios

| Escenario | Archivo | Usuarios | Ramp-up | Duración | Pausa entre peticiones | Umbral |
|---|---|---|---|---|---|---|
| Carga | `jmeter/carga.jmx` | 50 | 30 s | 120 s | 0,5 – 1,5 s | 1000 ms |
| Estrés | `jmeter/estres.jmx` | hasta 300 | 240 s | 300 s | 0,05 – 0,15 s | 2000 ms |

En **carga**, cada usuario inicia sesión una vez (como una sesión real) y luego consulta y reserva en bucle.
En **estrés**, cada iteración incluye login para presionar la operación más costosa.

## 5. Resultados

### 5.1 Carga (copiar de la tabla "Statistics" del reporte HTML)

| Petición | Muestras | % Error | Promedio (ms) | P90 (ms) | P95 (ms) | Throughput (req/s) |
|---|---|---|---|---|---|---|
| 1. POST /auth/login | | | | | | |
| 2. GET /canchas | | | | | | |
| 3. GET /canchas/:id | | | | | | |
| 4. POST /reservas | | | | | | |
| 5. GET /reservas | | | | | | |
| **Total** | | | | | | |

### 5.2 Estrés

| Métrica | Valor |
|---|---|
| Usuarios activos cuando el P95 superó 2000 ms | |
| Usuarios activos cuando aparecieron los primeros errores | |
| Throughput máximo alcanzado (req/s) | |
| Endpoint que se degradó primero | |

(Ver las gráficas "Active Threads Over Time" y "Response Times Over Time" del reporte.)

## 6. Hallazgos y cuellos de botella

1. **Login (bcrypt) es el endpoint más lento.** bcrypt es costoso a propósito para frenar ataques de
   fuerza bruta, y `bcryptjs` está escrito en JavaScript puro: el cálculo ocupa el hilo principal de
   Node.js y las demás peticiones esperan. En una medición previa con 50 conexiones simultáneas, el
   login atendió ~10 peticiones por segundo frente a ~500 del catálogo.
2. (Completar con lo observado: latencia de Atlas, `populate` en reservas, etc.)

## 7. Recomendaciones

| Hallazgo | Recomendación |
|---|---|
| Login bloquea el hilo principal | Usar la librería nativa `bcrypt` (calcula en hilos aparte) y/o ejecutar varias instancias de Node (cluster / PM2) |
| Login expuesto a ráfagas de peticiones | Limitar intentos por IP con `express-rate-limit` (también protege contra fuerza bruta) |
| Consultas frecuentes del catálogo | Cache de corta duración para `GET /canchas` |
| Latencia de red con Atlas | Desplegar la API en la misma región que el cluster |

## 8. Conclusión
(Completar: ¿la API cumple el umbral con la carga esperada? ¿cuál es su límite?)
