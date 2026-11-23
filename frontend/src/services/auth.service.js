import { request } from './api';

export const registrar = (datos) => request('/auth/register', { method: 'POST', body: datos });

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const perfil = () => request('/users/me', { auth: true });
