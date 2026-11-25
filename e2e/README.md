# Pruebas de UI con Selenium WebDriver (CanchaYa)

Pruebas de extremo a extremo (E2E) sobre la interfaz en React, en un navegador real, siguiendo el
patrón **Page Object Model (POM)**.

## Estructura

```
e2e/
  config.js            URL del frontend y de la API, navegador, modo headless, tiempo de espera
  pages/               Page Objects: una clase por pantalla
    BasePage.js        Acciones comunes con esperas explícitas (buscar, clic, escribir, seleccionar…)
    NavBar.js          Barra superior (componente compartido)
    LoginPage.js  RegistroPage.js  CatalogoPage.js  ReservaPage.js  MisReservasPage.js  AdminCanchasPage.js
  support/
    driver.js          Crea el navegador (Chrome, Firefox o Edge); Selenium Manager descarga el driver
    api.js             Preparación de datos por la API (clientes y canchas exclusivas de cada prueba)
    entorno.js         Entorno de Jest que detecta la prueba que falla
    capturas.js        Guarda una captura de pantalla en capturas/ cuando una prueba falla
  tests/               Pruebas: solo hablan con los Page Objects, nunca con localizadores
```

## Reglas del Page Object Model

1. Cada pantalla es una clase que **encapsula sus localizadores** (`static loc`) y expone **acciones de negocio**
   (`iniciarSesion`, `filtrarPor`, `elegirHorario`, `cancelar`…).
2. Las pruebas **no usan `By` ni el driver**: si cambia el HTML, solo se actualiza el Page Object.
3. Todas las esperas son **explícitas** (`until.elementLocated`, `elementIsVisible`, `urlIs`…), sin pausas fijas.

## Localizadores usados

| Tipo | Ejemplo | Dónde |
|---|---|---|
| ID | `By.id('btn-login')` | Campos y botones con id estable (la opción más rápida y robusta) |
| CSS | `By.css('#fecha .dia:nth-child(2)')`, `By.css('.cancha-card')` | Grupos de elementos y posiciones |
| XPath | `//h3[normalize-space()='La Bombonera']/ancestor::article//a[normalize-space()='Reservar']` | Elementos sin id, ubicados por su texto o por su relación con otros |

## Ejecutar

Requisitos: la API (`npm run dev` en la raíz, con `npm run seed`) y el frontend (`npm run dev` en `frontend/`) corriendo.

```bash
cd e2e
npm install
npm test                 # navegador visible (Chrome)
npm run test:headless    # sin ventana
npm run test:humo        # solo la suite de humo (@humo)
```

Variables opcionales: `BROWSER=firefox|edge`, `BASE_URL`, `API_URL`, `HEADLESS=true`.

## Datos de prueba

Las pruebas crean por la API sus propios clientes y canchas, con nombres únicos, y desactivan las canchas al
terminar. Así se pueden ejecutar muchas veces seguidas sin que los horarios choquen. Solo dependen del
administrador que crea `npm run seed`.
