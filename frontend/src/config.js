/* global __API_URL__ */
// __API_URL__ lo define Vite al compilar (vite.config.js). En Jest no existe y se usa "/api".
export const API_URL = typeof __API_URL__ !== 'undefined' ? __API_URL__ : '/api';
