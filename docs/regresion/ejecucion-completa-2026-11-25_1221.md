# Ejecución de regresión — suite completa

| Dato | Valor |
|---|---|
| Fecha | 25 de noviembre de 2026, 12:21 p. m. |
| Rama | `feature/CY-111-regresion` |
| Commit | `1e21810` — Merge pull request #19 from Harrihurtado/feature/CY-105-selenium-pom |
| Equipo | Windows_NT 10.0.26200, Node.js v22.17.0 |
| Navegador E2E | chrome |

## Resultado: ❌ CON FALLOS

| Capa | Suite | Pruebas | Pasaron | Fallaron | Duración |
|---|---|---|---|---|---|
| Backend | Jest: unitarias + integración (top-down, bottom-up, big bang) | 137 | 125 | 12 | 188 s |
| Frontend | Jest + React Testing Library: componentes | 93 | 93 | 0 | 20 s |
| API REST | Postman / Newman (aserciones) (40 peticiones) | 260 | 257 | 3 | 82 s |
| Interfaz (E2E) | Selenium + POM: suite completa | 29 | 6 | 23 | 469 s |
| **Total** | | **519** | **481** | **38** | **759 s** |

## Casos fallidos

- **Backend:** Big Bang: flujo completo de una reserva 1. Un administrador inicia sesión
- **Backend:** Big Bang: flujo completo de una reserva 2. El administrador crea una cancha en el catálogo
- **Backend:** Big Bang: flujo completo de una reserva 3. Un visitante se registra y luego inicia sesión
- **Backend:** Big Bang: flujo completo de una reserva 4. Ana consulta el catálogo y encuentra la cancha
- **Backend:** Big Bang: flujo completo de una reserva 5. Ana reserva de 18:00 a 19:30 y el total se calcula solo
- **Backend:** Big Bang: flujo completo de una reserva 6. Otro usuario intenta reservar la misma franja y recibe 409
- **Backend:** Big Bang: flujo completo de una reserva 7. Luis no puede ver ni cancelar la reserva de Ana
- **Backend:** Big Bang: flujo completo de una reserva 8. Ana ve su reserva con los datos de la cancha
- **Backend:** Big Bang: flujo completo de una reserva 9. Ana cancela su reserva
- **Backend:** Big Bang: flujo completo de una reserva 10. Con la franja liberada, Luis ya puede reservar
- **Backend:** Big Bang: flujo completo de una reserva 11. El administrador ve todas las reservas del sistema
- **Backend:** Big Bang: flujo completo de una reserva 12. Ana actualiza su perfil, pero no puede volverse administradora
- **API REST:** Registro de cliente: Tiempo de respuesta menor a 2000 ms
- **API REST:** Listar mis reservas (cliente): Tiempo de respuesta menor a 2000 ms
- **API REST:** Listar mis reservas con límite de 1: Tiempo de respuesta menor a 2000 ms
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) no permite reservar una franja que se cruza y conserva lo elegido
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) sí permite una franja contigua (19:30 a 20:30)
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) avisa si la hora de fin no es posterior a la de inicio
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) "Mis reservas" muestra las dos reservas pendientes
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) responder "No" a la confirmación no cancela la reserva
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) @humo cancela una reserva tras confirmar
- **Interfaz (E2E):** Reservas desde la interfaz (HU-20) la franja cancelada vuelve a quedar disponible
- **Interfaz (E2E):** Panel de administración (HU-30) como cliente no ve el menú "Administrar"
- **Interfaz (E2E):** Panel de administración (HU-30) como cliente si escribe la dirección del panel, vuelve al catálogo
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador ve su insignia y entra al panel desde el menú
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador un formulario vacío muestra qué falta
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador @humo crea una cancha y aparece en el catálogo para reservar
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador no permite dos canchas con el mismo nombre
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador edita el precio por hora
- **Interfaz (E2E):** Panel de administración (HU-30) como administrador desactiva la cancha y deja de aparecer en el catálogo
- **Interfaz (E2E):** Autenticación (HU-18) @humo un visitante se registra, inicia sesión y ve su nombre
- **Interfaz (E2E):** Autenticación (HU-18) el registro con un correo ya usado muestra el mensaje de la API
- **Interfaz (E2E):** Autenticación (HU-18) la sesión se mantiene al recargar la página
- **Interfaz (E2E):** Catálogo de canchas (HU-19) @humo muestra las canchas activas con su información y precio
- **Interfaz (E2E):** Catálogo de canchas (HU-19) el filtro por deporte deja solo canchas de ese deporte
- **Interfaz (E2E):** Catálogo de canchas (HU-19) un deporte sin canchas muestra el aviso y permite volver a ver todas
- **Interfaz (E2E):** Catálogo de canchas (HU-19) el contador coincide con las tarjetas mostradas
- **Interfaz (E2E):** Catálogo de canchas (HU-19) una cancha desactivada no aparece en el catálogo

Cada fallo se analiza y, si es un defecto, se registra como Bug en Jira.
