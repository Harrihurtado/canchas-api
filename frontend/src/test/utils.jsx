import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Renderiza un componente dentro de un router en memoria (sin navegador real)
export function renderConRouter(ui, { ruta = '/', patron = '*', otrasRutas = [] } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path={patron} element={ui} />
        {otrasRutas.map(([path, texto]) => (
          <Route key={path} path={path} element={<p>{texto}</p>} />
        ))}
      </Routes>
    </MemoryRouter>
  );
}

// Datos de ejemplo reutilizables
export const canchaEjemplo = {
  _id: '6ae0e26aee9bf8a81ab44e3f',
  nombre: 'La Bombonera',
  deporte: 'futbol5',
  superficie: 'sintetica',
  precioHora: 80000,
  capacidad: 10,
  ubicacion: 'Sede Norte',
  activa: true,
};

export const diasEjemplo = [
  { valor: '2026-12-01', diaSemana: 'mar', numero: 1, mes: 'dic', etiqueta: 'martes, 1 de diciembre' },
  { valor: '2026-12-02', diaSemana: 'mié', numero: 2, mes: 'dic', etiqueta: 'miércoles, 2 de diciembre' },
];
