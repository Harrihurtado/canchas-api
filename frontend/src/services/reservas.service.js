import { request } from './api';

export const crearReserva = (datos) => request('/reservas', { method: 'POST', body: datos, auth: true });

export const listarMisReservas = (pagina = 1, limite = 10) =>
  request(`/reservas?pagina=${pagina}&limite=${limite}`, { auth: true });

export const cancelarReserva = (id) => request(`/reservas/${id}/cancelar`, { method: 'PATCH', auth: true });
