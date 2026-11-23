import { request } from '../../services/api';
import * as auth from '../../services/auth.service';
import * as canchas from '../../services/canchas.service';
import * as reservas from '../../services/reservas.service';

// Verifica que cada servicio llame al endpoint, verbo y autenticación correctos
jest.mock('../../services/api', () => ({ request: jest.fn().mockResolvedValue({}) }));

test.each([
  ['registrar', () => auth.registrar({ nombre: 'Ana' }), '/auth/register', { method: 'POST', body: { nombre: 'Ana' } }],
  ['login', () => auth.login('a@a.com', 'x'), '/auth/login', { method: 'POST', body: { email: 'a@a.com', password: 'x' } }],
  ['perfil', () => auth.perfil(), '/users/me', { auth: true }],
  ['listarCanchas sin filtro', () => canchas.listarCanchas(''), '/canchas', undefined],
  ['listarCanchas con filtro', () => canchas.listarCanchas('futbol5'), '/canchas?deporte=futbol5', undefined],
  ['obtenerCancha', () => canchas.obtenerCancha('c1'), '/canchas/c1', undefined],
  ['crearCancha', () => canchas.crearCancha({ nombre: 'X' }), '/canchas', { method: 'POST', body: { nombre: 'X' }, auth: true }],
  ['actualizarCancha', () => canchas.actualizarCancha('c1', { precioHora: 1 }), '/canchas/c1', { method: 'PUT', body: { precioHora: 1 }, auth: true }],
  ['desactivarCancha', () => canchas.desactivarCancha('c1'), '/canchas/c1', { method: 'DELETE', auth: true }],
  ['crearReserva', () => reservas.crearReserva({ cancha: 'c1' }), '/reservas', { method: 'POST', body: { cancha: 'c1' }, auth: true }],
  ['listarMisReservas', () => reservas.listarMisReservas(2), '/reservas?pagina=2&limite=10', { auth: true }],
  ['cancelarReserva', () => reservas.cancelarReserva('r1'), '/reservas/r1/cancelar', { method: 'PATCH', auth: true }],
])('%s', async (_nombre, llamar, ruta, opciones) => {
  await llamar();
  if (opciones === undefined) expect(request).toHaveBeenCalledWith(ruta);
  else expect(request).toHaveBeenCalledWith(ruta, opciones);
});
