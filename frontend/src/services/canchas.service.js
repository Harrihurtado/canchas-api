import { request } from './api';

export const listarCanchas = (deporte) =>
  request(deporte ? `/canchas?deporte=${encodeURIComponent(deporte)}` : '/canchas');

export const obtenerCancha = (id) => request(`/canchas/${id}`);

// Solo administradores (la API responde 403 a un cliente)
export const crearCancha = (datos) => request('/canchas', { method: 'POST', body: datos, auth: true });

export const actualizarCancha = (id, datos) => request(`/canchas/${id}`, { method: 'PUT', body: datos, auth: true });

export const desactivarCancha = (id) => request(`/canchas/${id}`, { method: 'DELETE', auth: true });
