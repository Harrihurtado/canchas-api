import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';
import AdminRoute from '../../components/AdminRoute';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const renderRutas = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/canchas" element={<p>Catálogo</p>} />
        <Route element={<PrivateRoute />}>
          <Route path="/mis-reservas" element={<p>Mis reservas</p>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/canchas" element={<p>Panel admin</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('Rutas protegidas', () => {
  test('sin sesión, una página privada redirige al login', () => {
    useAuth.mockReturnValue({ usuario: null, cargando: false });
    renderRutas('/mis-reservas');
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  test('mientras valida el token guardado, muestra un indicador de carga', () => {
    useAuth.mockReturnValue({ usuario: null, cargando: true });
    renderRutas('/mis-reservas');
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  test('con sesión, muestra la página privada', () => {
    useAuth.mockReturnValue({ usuario: { rol: 'cliente' }, cargando: false });
    renderRutas('/mis-reservas');
    expect(screen.getByText('Mis reservas')).toBeInTheDocument();
  });

  test('un cliente que entra al panel de administración es enviado al catálogo', () => {
    useAuth.mockReturnValue({ usuario: { rol: 'cliente' }, cargando: false });
    renderRutas('/admin/canchas');
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  test('un administrador sí ve el panel', () => {
    useAuth.mockReturnValue({ usuario: { rol: 'admin' }, cargando: false });
    renderRutas('/admin/canchas');
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });
});
