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
| Equipo | Computador personal con Windows (la API y JMeter en la misma máquina) |
| API | Node.js ejecutado con `node src/server.js` (sin nodemon), entorno de desarrollo |
| Base de datos | MongoDB Atlas M0 (plan gratuito, compartido) |
| Herramienta | Apache JMeter 5.6.3 en modo consola (sin GUI) |
| Fecha | 28/10/2026 |

## 4. Escenarios

| Escenario | Archivo | Usuarios | Ramp-up | Duración | Pausa entre peticiones | Umbral |
|---|---|---|---|---|---|---|
| Carga | `jmeter/carga.jmx` | 50 | 30 s | 120 s | 0,5 – 1,5 s | 1000 ms |
| Estrés | `jmeter/estres.jmx` | hasta 150 | 120 s | 150 s | 0,05 – 0,15 s | 2000 ms |

El plan de estrés admite hasta 300 usuarios (`-Jusuarios=300 -JrampUp=240 -Jduracion=300`); por tiempo
se ejecutó con 150, suficientes para superar el punto de saturación.

En **carga**, cada usuario inicia sesión una vez (como una sesión real) y luego consulta y reserva en bucle.
En **estrés**, cada iteración incluye login para presionar la operación más costosa.

## 5. Resultados

### 5.1 Carga — ANTES de la corrección (28/10/2026)

Datos reales de la tabla *Statistics* del reporte de JMeter:

| Petición | Muestras | % Error | Promedio (ms) | Mediana (ms) | P90 (ms) | P95 (ms) | Recibido (KB/s) |
|---|---|---|---|---|---|---|---|
| 1. POST /auth/login | 50 | 22,00 % | 945 | 519 | 2.676 | 3.422 | 1,94 |
| 2. GET /canchas | 197 | 47,72 % | 5.560 | 911 | 30.003 | 30.006 | 2,09 |
| 3. GET /canchas/:id | 168 | 36,31 % | 1.992 | 518 | 4.009 | 8.792 | 1,72 |
| 4. POST /reservas | 165 | 87,88 % | 8.499 | 4.049 | 27.139 | 30.008 | 1,51 |
| 5. GET /reservas | 160 | **98,75 %** | **16.592** | 18.939 | 30.013 | 30.015 | **147,83** |
| **Total** | 743 | **63,26 %** | 7.490 | 1.986 | 30.004 | 30.011 | 117,96 |

APDEX total: **0,307** (T = 500 ms, F = 1.500 ms). Con 50 usuarios **constantes**, el tiempo promedio
pasó de ~670 ms en los primeros 30 s a más de 17 s al final: la API empeoraba **sin que aumentara la carga**.

### 5.2 Carga — DESPUÉS de la corrección (28/10/2026, 3:36 p. m.)

Base de datos limpia (`npm run seed`) y API reiniciada con el código corregido.

| Petición | Muestras | % Error | Promedio (ms) | P90 (ms) | P95 (ms) |
|---|---|---|---|---|---|
| | 1. POST /auth/login | 50 | 4.00 % | 364 | 436 | 612 |
| 2. GET /canchas | 921 | 0.43 % | 177 | 254 | 306 |
| 3. GET /canchas/:id | 910 | 0.88 % | 183 | 257 | 320 |
| 4. POST /reservas | 897 | 8.03 % | 845 | 980 | 1034 |
| 5. GET /reservas | 883 | 1.47 % | 528 | 657 | 704 |
| **Total** | 3661 | 2.70 % | 430 | 860 | 946 | 

Evolución durante la prueba (resumen de JMeter cada 30 s):

| Tramo | Usuarios activos | Throughput | Promedio | Error |
|---|---|---|---|---|
| 0:00 – 0:16 | 24 | 6,8 req/s | 422 ms | 7,21 % |
| 0:16 – 0:46 | 50 | 28,9 req/s | 459 ms | 4,86 % |
| 0:46 – 1:16 | 50 | 35,3 req/s | 421 ms | 1,51 % |
| 1:16 – 1:46 | 50 | 35,1 req/s | 410 ms | 1,14 % |
| 1:46 – 2:03 | 50 → 0 | 33,6 req/s | 435 ms | 3,64 % |
| **Total** | | **29,7 req/s** | **429 ms** | **2,70 %** |

El primer tramo concentra más errores por el **calentamiento** (apertura de conexiones con Atlas).
Después, el sistema es **estable**: con la misma carga, el tiempo promedio se mantiene en ~420 ms.

### 5.3 Comparación antes / después (mismo plan de carga, 50 usuarios)

| Métrica | Antes | Después | Cambio |
|---|---|---|---|
| Peticiones atendidas | 743 | 3.664 | **4,9 veces más** |
| Throughput | 4,0 req/s | 29,7 req/s | **7,4 veces más** |
| Tiempo promedio | 7.490 ms | 429 ms | **17 veces menor** |
| Error total | 63,26 % | 2,70 % | **de 63 % a 3 %** |
| Tiempo máximo | 30.028 ms (timeouts) | 2.334 ms | sin timeouts |
| Comportamiento en el tiempo | Empeora con carga constante | Estable | Defecto corregido |

### 5.4 Estrés (28/10/2026, 3:38 p. m.)

Los usuarios aumentan de forma continua y cada iteración incluye login (bcrypt).

| Tramo | Usuarios activos | Throughput | Promedio | Máximo | Error |
|---|---|---|---|---|---|
| 0:00 – 0:30 | hasta 35 | 22,5 req/s | 621 ms | 3.329 ms | 1,67 % |
| 0:30 – 1:00 | hasta 73 | **34,3 req/s** | 1.357 ms | 6.124 ms | 23,06 % |
| 1:00 – 1:30 | hasta 110 | 33,3 req/s | 2.559 ms | 10.653 ms | 52,01 % |
| 1:30 – 2:00 | hasta 148 | 30,1 req/s | 3.623 ms | 13.328 ms | 69,17 % |
| 2:00 – 2:30 | 150 | 33,8 req/s | 4.656 ms | 20.442 ms | 75,49 % |
| **Total** | | **31,1 req/s** | **2.754 ms** | 20.442 ms | **48,79 %** |

| Métrica | Valor |
|---|---|
| Capacidad máxima (throughput) | **~34 req/s**, alcanzada con unos 70 usuarios |
| Punto de saturación | **Entre 35 y 73 usuarios**: desde ahí el throughput deja de crecer y solo aumenta la espera |
| Usuarios cuando el promedio superó 2.000 ms | Entre 73 y 110 |
| Usuarios cuando aparecieron errores significativos | ~73 (23 % de error) |
| Colapso práctico | Desde ~110 usuarios, más de la mitad de las peticiones supera 2 s |

| 1. POST /auth/login | 1016 | 49.02 % | 2020 | 3516 | 4156 |
| 2. GET /canchas | 994 | 18.61 % | 1391 | 2454 | 3061 |
| 3. GET /canchas/:id | 976 | 22.85 % | 1433 | 2455 | 2887 |
| 4. POST /reservas | 958 | 84.76 % | 5508 | 8655 | 13954 |
| 5. GET /reservas | 906 | 71.74 % | 3595 | 5650 | 7971 |
| **Total** | 4850 | 48.82 % | 2756 | 6087 | 7827 |

## 6. Hallazgos y cuellos de botella

### 6.1 DEFECTO: `GET /api/reservas` devolvía todas las reservas sin paginar (Bug CY-XX)

**Evidencia.** Degradación progresiva con carga constante; `GET /reservas` fue la petición más lenta
(98,75 % de error) y la que más datos transfirió (147,83 KB/s, unas 70 veces más que las demás).

**Causa raíz.** Todos los usuarios virtuales comparten la cuenta del cliente de prueba y cada iteración crea
una reserva. `GET /reservas` devolvía **todas** sus reservas, con `populate` de cancha y usuario y **sin límite**:
cada respuesta era más grande que la anterior. Además, no existía un índice por `usuario`.

**Impacto en toda la API.** Node.js atiende las peticiones en un solo hilo. Serializar cientos de documentos
por respuesta lo mantenía ocupado, y las demás peticiones (incluso `GET /canchas`, que no tiene relación)
quedaban esperando: un solo endpoint mal diseñado degradaba toda la API.

**Corrección.**
1. Paginación obligatoria: `?pagina=` y `?limite=` (20 por defecto, máximo 100). La respuesta incluye
   `total`, `pagina`, `limite` y `paginas`.
2. Índice compuesto `{ usuario: 1, fecha: 1, horaInicio: 1 }`, que sirve para filtrar y ordenar a la vez.
3. `.lean()` en la consulta: objetos planos, menos memoria y serialización más rápida.

**Verificación con JMeter** (mismo plan de carga): el error total bajó de 63,26 % a 2,70 %, el throughput
subió de 4,0 a 29,7 req/s y el tiempo promedio bajó de 7.490 ms a 429 ms (sección 5.3). La API dejó de
degradarse con el tiempo.

**Verificación en entorno controlado** (cliente con 1.500 reservas, 20 conexiones simultáneas, 8 s, autocannon):

| Medición | Antes | Después | Mejora |
|---|---|---|---|
| `GET /reservas` — latencia promedio | 2.019 ms | 156 ms | ~13 veces más rápido |
| `GET /reservas` — peticiones por segundo | 8,4 | 126,8 | ~15 veces más |
| Tamaño de cada respuesta | ~525 KB | ~10 KB | ~50 veces menor |
| `GET /canchas` en paralelo — latencia promedio | 1.178 ms | 85 ms | ~14 veces más rápido |
| `GET /canchas` en paralelo — latencia máxima | 5.213 ms | 416 ms | |

**Pruebas de regresión agregadas.** Unitarias (cálculo de `skip`/`limit` y metadatos de paginación),
Bottom-up con BD real (25 reservas → páginas de 20 + 5, orden por fecha, sin repetidos y uso del índice
verificado con `explain()`), Top-down (validación de `pagina` y `limite`) y Postman (respuesta paginada,
límite respetado y límite excesivo → 400).

### 6.2 Login (bcrypt) es la operación más costosa

bcrypt es lento a propósito para frenar ataques de fuerza bruta, y `bcryptjs` está escrito en JavaScript puro:
el cálculo ocupa el hilo principal de Node.js. En una medición con 50 conexiones simultáneas, el login atendió
~10 peticiones por segundo frente a ~500 del catálogo. En la prueba de carga se mitiga porque cada usuario inicia
sesión una sola vez; en la de estrés (login en cada iteración) debería ser lo primero en degradarse.

### 6.3 Capacidad del sistema: saturación cerca de 34 req/s

En la prueba de estrés el throughput sube hasta ~34 req/s con unos 70 usuarios y luego **se aplana**: llegan
más usuarios, pero la API no atiende más peticiones por segundo; solo crece la fila. Ese es el punto de
saturación. Factores que lo explican:

- **bcrypt en cada iteración** (ver 6.2), que ocupa el hilo principal de Node.js.
- **Viajes secuenciales a la base de datos.** Crear una reserva hace 5 consultas en serie (verificar que el
  usuario del token existe, buscar usuario, buscar cancha, buscar cruces e insertar). Con ~140 ms por viaje
  a Atlas (tiempo mínimo observado en todas las peticiones), solo la red suma ~0,7 s.
- **Atlas M0** es un cluster compartido y gratuito, con límites de operaciones y conexiones.

### 6.4 Otros factores

- Latencia de red hacia MongoDB Atlas desde Colombia (mínimo ~140 ms por petición).
- Atlas M0 (gratuito) tiene límites de operaciones por segundo.
- `GET /api/users` (solo admin) tampoco está paginado: mismo riesgo a futuro.

## 7. Recomendaciones

| Hallazgo | Recomendación |
|---|---|
| Listados sin límite | **Aplicada:** paginación obligatoria en `GET /reservas`. Pendiente: aplicarla en `GET /users` |
| Login bloquea el hilo principal | Usar la librería nativa `bcrypt` (calcula en hilos aparte) y/o ejecutar varias instancias de Node (cluster / PM2) |
| Login expuesto a ráfagas de peticiones | Limitar intentos por IP con `express-rate-limit` (también protege contra fuerza bruta) |
| Consultas frecuentes del catálogo | Cache de corta duración para `GET /canchas` |
| Latencia de red con Atlas | Desplegar la API en la misma región que el cluster (Sprint 4) |
| Consultas secuenciales al crear reservas | Eliminar la consulta redundante del usuario (el middleware ya verificó que existe) y buscar usuario y cancha en paralelo (`Promise.all`) |
| Saturación cerca de 34 req/s | Escalar horizontalmente (varias instancias detrás de un balanceador) y usar un plan de Atlas dedicado en producción |

## 8. Conclusión

1. **Las pruebas de rendimiento encontraron un defecto real** que las pruebas funcionales no detectaban:
   el listado de reservas sin paginar degradaba **toda** la API con carga constante (63 % de error).
   Se registró como Bug en Jira, se corrigió (paginación, índice y `lean`), se agregaron pruebas de
   regresión y se verificó con el mismo plan de carga: **2,70 % de error, 429 ms promedio y 7 veces más
   throughput**.
2. **Con la carga esperada (50 usuarios concurrentes) la API cumple**: el sistema es estable y la gran
   mayoría de las respuestas está por debajo de 1 s.
3. **El límite actual es ~34 req/s**, con saturación entre 35 y 73 usuarios sin pausas. Los cuellos de
   botella identificados son bcrypt en el hilo principal, las consultas secuenciales a la base de datos y
   las limitaciones de Atlas M0. Las mejoras quedan priorizadas en la sección 7.
