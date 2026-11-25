# Estrategia de pruebas de regresión — CanchaYa

## 1. Objetivo

Garantizar que cada módulo nuevo o cada corrección no dañe lo que ya funcionaba. Por ejemplo, que el
panel de administración (Sprint 3) no rompa la autenticación (Sprint 2) ni la regla de cruces de horario
de las reservas (Sprint 1).

## 2. Niveles de regresión

La regresión se organiza en tres niveles, de más rápido a más completo, según el momento del desarrollo.

| Nivel | Cuándo se ejecuta | Qué incluye | Duración | Cómo |
|---|---|---|---|---|
| **1. Humo** | Antes de cada `git push` | Backend unitarias, componentes del frontend, colección de Postman y los 6 casos E2E `@humo` | ~1 min | `npm run regresion:humo` |
| **2. Completa automática** | En cada Pull Request a `develop` o `main` | Las cuatro capas completas. **Bloquea el merge si algo falla** (regla del repositorio) | ~4 min en CI | GitHub Actions |
| **3. Completa con registro** | Al cerrar cada sprint y antes de un release a `main` | Las cuatro capas completas y un registro de resultados versionado en `docs/regresion/` | ~2 min | `npm run regresion` |

Se ejecuta la suite completa en cada PR, en lugar de solo un subconjunto, porque tarda pocos minutos y
la automatización elimina el costo de repetirla. La selección de casos (sección 3) define la suite de humo
y el orden de análisis cuando algo falla.

## 3. Criterios de selección de casos

Los casos de la suite de humo y las prioridades de análisis se eligieron con cuatro criterios:

| Criterio | Aplicación en el proyecto |
|---|---|
| **Criticidad para el negocio** | Autenticación (sin ella nadie entra) y creación y cancelación de reservas (el valor del producto, incluido el cálculo del total) |
| **Defectos previos** | Cada defecto corregido deja pruebas que lo reproducen y se ejecutan siempre (tabla 4.2) |
| **Frecuencia de uso** | Login, consulta del catálogo y reserva son el recorrido diario de un cliente |
| **Complejidad e integración** | La regla de cruces de horario y los permisos por rol atraviesan varias capas (UI, API, servicio y base de datos) |

### Suite de humo (casos E2E marcados `@humo`)

| Caso | Por qué está en humo |
|---|---|
| Registro, inicio de sesión y nombre en pantalla | Puerta de entrada del sistema |
| Contraseña incorrecta con mensaje genérico | Seguridad de la autenticación |
| Catálogo con información y precio | Primera pantalla después del login |
| Reserva con total calculado (1,5 h × $80.000) | Flujo de mayor valor y cálculo de dinero |
| Cancelación con confirmación | Cambia el estado de una transacción |
| Administrador crea una cancha visible en el catálogo | Permisos por rol y relación entre módulos |

## 4. Trazabilidad

### 4.1 Historias de usuario y pruebas que las protegen

| Historia | Backend (Jest) | API (Postman) | Frontend (Jest) | Interfaz (Selenium) |
|---|---|---|---|---|
| HU-04/05 Catálogo de canchas | Unitarias `cancha.service`, top-down `canchas-auth` | Carpeta *3. Canchas* | `CanchaCard`, `CatalogoPage` | `catalogo.e2e` |
| HU-06/07/08 Reservas y cruces | Unitarias `reserva.service`, bottom-up nivel 2, big bang | Carpeta *4. Reservas* | `ReservaForm`, `MisReservasPage`, `ReservarPage` | `reservas.e2e` |
| HU-09/10 Registro y login | Unitarias `auth.service`, bottom-up nivel 1 y 2 | Carpeta *1. Auth* | `LoginForm`, `RegisterForm`, `AuthContext`, `AuthPages` | `autenticacion.e2e` |
| HU-11 Protección por token y rol | Unitarias `auth.middleware`, top-down | Casos sin token, token falso y rol insuficiente | `rutas`, `Navbar` | Cliente sin acceso al panel |
| HU-12 Perfil | Unitarias `user.service` | Carpeta *2. Usuarios* | — | — |
| HU-18 Login y registro en la UI | — | — | `LoginForm`, `RegisterForm`, `AuthPages` | `autenticacion.e2e` |
| HU-19 Catálogo en la UI | — | — | `CatalogoPage`, `CanchaCard` | `catalogo.e2e` |
| HU-20 Reservas en la UI | — | — | `ReservaForm`, `MisReservasPage` | `reservas.e2e` |
| HU-30 Panel de administración | Top-down `canchas-auth` | Casos de admin en *3. Canchas* | `CanchaForm`, `AdminCanchasPage`, `rutas` | `administracion.e2e` |

### 4.2 Defectos corregidos y sus pruebas de regresión

| Defecto | Detectado por | Pruebas de regresión agregadas |
|---|---|---|
| Listado de reservas sin paginar degradaba toda la API | JMeter (prueba de carga) | Unitarias de paginación, bottom-up con 25 reservas y uso del índice, top-down de `pagina`/`limite`, casos de Postman y repetición de la prueba de carga |
| Tras iniciar sesión no se volvía a la página solicitada | Selenium (`autenticacion.e2e`) | Prueba de Jest que reproduce el re-render del login y el caso E2E que lo detectó |

### 4.3 Análisis de impacto: qué priorizar según lo que cambie

| Si se modifica… | Priorizar en el análisis |
|---|---|
| `services/reserva.service.js` o el modelo de reservas | Bottom-up nivel 2 (cruces con datos reales), big bang, *4. Reservas*, `reservas.e2e` y prueba de carga de JMeter |
| Middlewares de autenticación o `utils/jwt` | Unitarias `auth.middleware`, casos de token de Postman, `autenticacion.e2e` y `administracion.e2e` |
| `frontend/src/services/api.js` o `AuthContext` | Todas las pruebas de páginas del frontend y la suite E2E completa (todo pasa por ahí) |
| Estilos o textos de la UI | Suite E2E completa: los localizadores por texto (XPath) dependen de ellos |

## 5. Pruebas inestables (flaky)

Una prueba que a veces pasa y a veces falla no se ignora ni se desactiva: se reproduce, se busca la causa y
se corrige. Casos registrados en el Sprint 3:

| Síntoma | Causa | Corrección |
|---|---|---|
| En el equipo de desarrollo, la lista seguía en "Pendiente" tras cancelar; en el entorno local de pruebas pasaba | Condición de carrera: el Page Object esperaba el mensaje, pero la lista se recarga después desde la API, más lenta con Atlas | Esperar el efecto real (estado de la fila, precio nuevo, `until.stalenessOf`). Se verificó simulando 400 ms de latencia por petición |
| Al editar el precio, Chrome guardaba "4500050000" en vez de "50000"; en Firefox pasaba | `clear()` de Chrome borra el campo sin avisarle a React, que repinta el valor anterior | `BasePage.escribir()` borra con el teclado (Ctrl+A y Retroceso) y verifica el valor final |

Lecciones: ejecutar la suite en más de un navegador y en más de un entorno (equipo local y CI) es parte de la
validación, y una espera debe apuntar exactamente a la condición que se va a comprobar.

## 6. Registro de ejecuciones

Cada ejecución de `npm run regresion` genera un archivo en `docs/regresion/` con la fecha, la rama, el commit,
el equipo, el navegador y los resultados por capa. Ese archivo se versiona con el cierre del sprint.

### Cómo ejecutarla

```bash
npm run seed
npm run dev                    # terminal A: API
cd frontend && npm run dev     # terminal B: frontend
npm run regresion              # terminal C, en la raíz: suite completa con registro
npm run regresion:humo         # o la suite de humo
```

El script verifica primero que la API y el frontend respondan. Si alguna suite falla, el registro lista los
casos fallidos y el comando termina con error. Cada fallo se analiza y, si es un defecto, se registra como Bug
en Jira.
