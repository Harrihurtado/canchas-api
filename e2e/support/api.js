// Preparación de datos por la API (patrón "arrange por API, act por UI"):
// la interfaz solo se usa para lo que se está probando, lo demás se crea rápido y sin depender de otras pruebas.
const config = require('../config');

async function llamar(ruta, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${config.apiUrl}${ruta}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${ruta} respondió ${res.status}: ${data.message}`);
  return data;
}

const unico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

async function tokenAdmin() {
  const res = await llamar('/auth/login', { method: 'POST', body: config.admin });
  return res.token;
}

// Crea un cliente nuevo y devuelve sus credenciales
async function crearCliente(nombre = 'Cliente E2E') {
  const datos = { nombre, email: `e2e${unico()}@test.com`, password: 'Segura123' };
  await llamar('/auth/register', { method: 'POST', body: datos });
  return datos;
}

// Crea una cancha exclusiva para la prueba, así sus horarios nunca chocan con otras ejecuciones
async function crearCancha(datos = {}) {
  const token = await tokenAdmin();
  const res = await llamar('/canchas', {
    method: 'POST',
    token,
    body: {
      nombre: `E2E ${unico()}`,
      deporte: 'futbol5',
      superficie: 'sintetica',
      precioHora: 80000,
      capacidad: 10,
      ubicacion: 'Sede Pruebas',
      ...datos,
    },
  });
  return res.data;
}

async function desactivarCancha(id) {
  const token = await tokenAdmin();
  await llamar(`/canchas/${id}`, { method: 'DELETE', token }).catch(() => {});
}

module.exports = { crearCliente, crearCancha, desactivarCancha, unico };
