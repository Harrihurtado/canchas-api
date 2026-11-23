import { request } from './api';

export const listarCanchas = (deporte) =>
  request(deporte ? `/canchas?deporte=${encodeURIComponent(deporte)}` : '/canchas');

export const obtenerCancha = (id) => request(`/canchas/${id}`);
