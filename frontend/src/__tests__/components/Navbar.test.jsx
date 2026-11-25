import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { renderConRouter } from '../../test/utils';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

describe('<Navbar />', () => {
  test('sin sesión no se muestra', () => {
    useAuth.mockReturnValue({ usuario: null });
    const { container } = renderConRouter(<Navbar />);
    expect(container).toBeEmptyDOMElement();
  });

  test('un cliente ve sus iniciales y su menú, pero no "Administrar"', () => {
    useAuth.mockReturnValue({ usuario: { nombre: 'Ana María Pérez', rol: 'cliente' } });
    renderConRouter(<Navbar />);

    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mis reservas' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Administrar' })).not.toBeInTheDocument();
  });

  test('un administrador ve "Administrar", "Reservas" y su insignia', () => {
    useAuth.mockReturnValue({ usuario: { nombre: 'Admin Demo', rol: 'admin' } });
    renderConRouter(<Navbar />);

    expect(screen.getByRole('link', { name: 'Administrar' })).toHaveAttribute('href', '/admin/canchas');
    expect(screen.getByRole('link', { name: 'Reservas' })).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('Cerrar sesión limpia la sesión y lleva al login', async () => {
    const cerrarSesion = jest.fn();
    useAuth.mockReturnValue({ usuario: { nombre: 'Ana', rol: 'cliente' }, cerrarSesion });
    renderConRouter(<Navbar />, { otrasRutas: [['/login', 'Página de login']] });

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(cerrarSesion).toHaveBeenCalled();
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });
});
