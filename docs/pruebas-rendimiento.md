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

### 5.2 Carga — DESPUÉS de la corrección


Total	3018	760	25.18%	754.59	128	8540	521.00	1579.20	2105.00	4558.62	23.97	1005.56	7.20
1. POST /auth/login	50	6	12.00%	426.60	207	1775	237.00	1132.40	1332.70	1775.00	1.67	2.16	0.40
2. GET /canchas	756	14	1.85%	262.32	128	3066	183.50	429.90	498.00	2164.48	6.36	9.09	1.11
3. GET /canchas/:id	746	13	1.74%	281.43	128	6697	181.50	473.30	581.90	2923.49	6.33	7.39	1.16
4. POST /reservas	737	325	44.10%	1152.52	648	8540	939.00	1880.80	2175.20	4846.60	6.24	7.51	3.03
5. GET /reservas	726	402	55.37%	1373.52	406	7243	1071.50	2252.00	3117.70	6808.63	6.14	1046.24	2.27
Limpieza - DELETE /canchas/:id	1	0	0.00%	325.00	325	325	325.00	325.00	325.00	325.00	3.08	3.69	1.27
Preparación - POST /auth/login (admin)	1	0	0.00%	526.00	526	526	526.00	526.00	526.00	526.00	1.90	2.43	0.44
Preparación - POST /canchas (cancha de prueba)	1	0	0.00%	331.00	331	331	331.00	331.00	331.00	331.00	3.02	3.55	1.51


### 5.3 Estrés

Total	7136	5361	75.13%	7940.10	130	30028	4721.50	24349.40	30001.00	30010.00	21.84	935.73	5.74
1. POST /auth/login	1522	1124	73.85%	4823.26	203	19787	3824.00	9981.70	11897.25	15661.40	4.81	6.19	1.14
2. GET /canchas	1444	875	60.60%	3530.50	131	30028	2658.50	7497.50	8655.25	11504.40	4.63	6.62	0.80
3. GET /canchas/:id	1422	885	62.24%	3450.22	130	12499	2684.50	7287.50	8464.30	9934.70	4.56	5.33	0.83
4. POST /reservas	1419	1286	90.63%	14533.71	664	30017	10420.00	30001.00	30003.00	30013.00	4.44	6.12	1.86
5. GET /reservas	1326	1191	89.82%	14095.83	403	30018	11346.00	30002.00	30007.00	30014.00	4.11	924.10	1.26
Limpieza - DELETE /canchas/:id	1	0	0.00%	296.00	296	296	296.00	296.00	296.00	296.00	3.38	4.05	1.39
Preparación - POST /auth/login (admin)	1	0	0.00%	276.00	276	276	276.00	276.00	276.00	276.00	3.62	4.64	0.85
Preparación - POST /canchas (cancha de prueba)	1	0	0.00%	289.00	289	289	289.00	289.00	289.00	289.00	3.46	4.06	1.73


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

### 6.3 Otros factores

- Latencia de red hacia MongoDB Atlas desde Colombia (mínimo ~130 ms por petición).
- Atlas M0 (gratuito) tiene límites de operaciones por segundo.
- `GET /api/users` (solo admin) tampoco está paginado: mismo riesgo a futuro.

## 7. Recomendaciones

| Hallazgo | Recomendación |
|---|---|
| Listados sin límite | **Aplicada:** paginación obligatoria en `GET /reservas`. Pendiente: aplicarla en `GET /users` |
| Login bloquea el hilo principal | Usar la librería nativa `bcrypt` (calcula en hilos aparte) y/o ejecutar varias instancias de Node (cluster / PM2) |
| Login expuesto a ráfagas de peticiones | Limitar intentos por IP con `express-rate-limit` (también protege contra fuerza bruta) |
| Consultas frecuentes del catálogo | Cache de corta duración para `GET /canchas` |
| Latencia de red con Atlas | Desplegar la API en la misma región que el cluster |

## 8. Conclusión
(Completar: ¿la API cumple el umbral con la carga esperada? ¿cuál es su límite?)
