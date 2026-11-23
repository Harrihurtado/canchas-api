import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth.service';
import { tokenStorage } from '../../services/api';

jest.mock('../../services/auth.service', () => ({ login: jest.fn(), perfil: jest.fn() }));

// Componente auxiliar que expone el contexto en pantalla
let contexto;
function Espia() {
  contexto = useAuth();
  return <p>{contexto.usuario ? `Hola ${contexto.usuario.nombre}` : 'Sin sesión'}</p>;
}

describe('AuthContext', () => {
  test('iniciarSesion guarda el token y deja al usuario disponible', async () => {
    authService.login.mockResolvedValue({ token: 'jwt-1', data: { nombre: 'Ana', rol: 'cliente' } });
    render(<AuthProvider><Espia /></AuthProvider>);

    await act(() => contexto.iniciarSesion('ana@test.com', 'Segura123'));

    expect(tokenStorage.get()).toBe('jwt-1');
    expect(screen.getByText('Hola Ana')).toBeInTheDocument();
  });

  test('cerrarSesion borra el token y al usuario', async () => {
    authService.login.mockResolvedValue({ token: 'jwt-1', data: { nombre: 'Ana' } });
    render(<AuthProvider><Espia /></AuthProvider>);
    await act(() => contexto.iniciarSesion('ana@test.com', 'Segura123'));

    act(() => contexto.cerrarSesion());

    expect(tokenStorage.get()).toBeNull();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
  });

  test('al recargar la página recupera la sesión con el token guardado', async () => {
    tokenStorage.set('jwt-guardado');
    authService.perfil.mockResolvedValue({ data: { nombre: 'Ana' } });
    render(<AuthProvider><Espia /></AuthProvider>);

    expect(await screen.findByText('Hola Ana')).toBeInTheDocument();
  });

  test('si el token guardado ya no sirve, lo descarta', async () => {
    tokenStorage.set('jwt-vencido');
    authService.perfil.mockRejectedValue(new Error('Token inválido o expirado'));
    render(<AuthProvider><Espia /></AuthProvider>);

    await waitFor(() => expect(contexto.cargando).toBe(false));
    expect(tokenStorage.get()).toBeNull();
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
  });

  test('useAuth fuera del proveedor lanza un error claro', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Espia />)).toThrow('useAuth debe usarse dentro de AuthProvider');
  });
});
