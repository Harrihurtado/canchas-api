import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCanchasPage from '../../pages/AdminCanchasPage';
import * as servicio from '../../services/canchas.service';
import { canchaEjemplo, renderConRouter } from '../../test/utils';

jest.mock('../../services/canchas.service', () => ({
  listarCanchas: jest.fn(),
  crearCancha: jest.fn(),
  actualizarCancha: jest.fn(),
  desactivarCancha: jest.fn(),
}));

const fila = async (nombre) => (await screen.findByText(nombre)).closest('li');

describe('<AdminCanchasPage />', () => {
  beforeEach(() => servicio.listarCanchas.mockResolvedValue({ data: [canchaEjemplo] }));

  test('lista las canchas con su precio', async () => {
    renderConRouter(<AdminCanchasPage />);
    expect(within(await fila('La Bombonera')).getByText(/80\.000/)).toBeInTheDocument();
  });

  test('crea una cancha nueva, informa y recarga la lista', async () => {
    servicio.crearCancha.mockResolvedValue({});
    renderConRouter(<AdminCanchasPage />);
    await fila('La Bombonera');

    await userEvent.click(screen.getByRole('button', { name: 'Nueva cancha' }));
    await userEvent.type(screen.getByLabelText('Nombre'), 'Tenis Club');
    await userEvent.type(screen.getByLabelText('Precio por hora (COP)'), '45000');
    await userEvent.type(screen.getByLabelText('Capacidad (jugadores)'), '4');
    await userEvent.type(screen.getByLabelText('Ubicación'), 'Sede Sur');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cancha' }));

    expect(servicio.crearCancha).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Tenis Club', precioHora: 45000 }));
    expect(await screen.findByText('Creaste la cancha Tenis Club')).toBeInTheDocument();
    expect(servicio.listarCanchas).toHaveBeenCalledTimes(2);
  });

  test('edita una cancha existente', async () => {
    servicio.actualizarCancha.mockResolvedValue({});
    renderConRouter(<AdminCanchasPage />);

    await userEvent.click(within(await fila('La Bombonera')).getByRole('button', { name: 'Editar' }));
    const precio = screen.getByLabelText('Precio por hora (COP)');
    await userEvent.clear(precio);
    await userEvent.type(precio, '90000');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(servicio.actualizarCancha).toHaveBeenCalledWith(canchaEjemplo._id, expect.objectContaining({ precioHora: 90000 }));
    expect(await screen.findByText('Guardaste los cambios de La Bombonera')).toBeInTheDocument();
  });

  test('desactiva una cancha solo después de confirmar', async () => {
    servicio.desactivarCancha.mockResolvedValue({});
    renderConRouter(<AdminCanchasPage />);

    const laFila = await fila('La Bombonera');
    await userEvent.click(within(laFila).getByRole('button', { name: 'Desactivar' }));
    expect(servicio.desactivarCancha).not.toHaveBeenCalled();

    await userEvent.click(within(laFila).getByRole('button', { name: 'Sí, desactivar' }));

    expect(servicio.desactivarCancha).toHaveBeenCalledWith(canchaEjemplo._id);
    expect(await screen.findByText(/Desactivaste La Bombonera/)).toBeInTheDocument();
  });

  test('Descartar cierra el formulario sin guardar', async () => {
    renderConRouter(<AdminCanchasPage />);
    await fila('La Bombonera');

    await userEvent.click(screen.getByRole('button', { name: 'Nueva cancha' }));
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));

    expect(screen.queryByRole('button', { name: 'Crear cancha' })).not.toBeInTheDocument();
    expect(servicio.crearCancha).not.toHaveBeenCalled();
  });

  test('sin canchas, invita a crear la primera', async () => {
    servicio.listarCanchas.mockResolvedValue({ data: [] });
    renderConRouter(<AdminCanchasPage />);
    expect(await screen.findByText('Todavía no hay canchas en el catálogo.')).toBeInTheDocument();
  });
});
