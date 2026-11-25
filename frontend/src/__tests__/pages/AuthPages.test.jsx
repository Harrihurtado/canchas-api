import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import { useAuth } from '../../context/AuthContext';
import { registrar } from '../../services/auth.service';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/auth.service', () => ({ registrar: jest.fn() }));

const renderApp = (ruta, estado) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: ruta, state: estado }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/canchas" element={<p>Catálogo</p>} />
        <Route path="/mis-reservas" element={<p>Mis reservas</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('Páginas de acceso', () => {
  test('al iniciar sesión lleva al catálogo', async () => {
    const iniciarSesion = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ usuario: null, iniciarSesion });
    renderApp('/login');

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(iniciarSesion).toHaveBeenCalledWith('ana@test.com', 'Segura123');
    expect(await screen.findByText('Catálogo')).toBeInTheDocument();
  });

  test('si venía de una página privada, vuelve a ella tras iniciar sesión', async () => {
    useAuth.mockReturnValue({ usuario: null, iniciarSesion: jest.fn().mockResolvedValue({}) });
    renderApp('/login', { desde: '/mis-reservas' });

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Mis reservas')).toBeInTheDocument();
  });

  test('regresión: si la sesión se inicia mientras está en el login, respeta la página de origen', () => {
    // Simula el re-render que ocurre al iniciar sesión: el login se dibuja con un usuario ya conectado
    useAuth.mockReturnValue({ usuario: { nombre: 'Ana' } });
    renderApp('/login', { desde: '/mis-reservas' });
    expect(screen.getByText('Mis reservas')).toBeInTheDocument();
  });

  test('con la sesión ya iniciada, el login redirige al catálogo', () => {
    useAuth.mockReturnValue({ usuario: { nombre: 'Ana' } });
    renderApp('/login');
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  test('al registrarse vuelve al login con un mensaje de éxito', async () => {
    useAuth.mockReturnValue({ usuario: null });
    registrar.mockResolvedValue({});
    renderApp('/registro');

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(registrar).toHaveBeenCalled();
    expect(await screen.findByText('Tu cuenta está lista. Inicia sesión para reservar.')).toBeInTheDocument();
  });
});
