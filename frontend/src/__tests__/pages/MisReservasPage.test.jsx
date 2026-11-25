import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MisReservasPage from '../../pages/MisReservasPage';
import { cancelarReserva, listarMisReservas } from '../../services/reservas.service';
import { useAuth } from '../../context/AuthContext';
import { renderConRouter } from '../../test/utils';

jest.mock('../../services/reservas.service', () => ({ listarMisReservas: jest.fn(), cancelarReserva: jest.fn() }));
jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const reserva = (id, estado = 'pendiente') => ({
  _id: id,
  cancha: { nombre: 'La Bombonera' },
  usuario: { nombre: 'Ana Pérez' },
  fecha: '2026-12-01T00:00:00.000Z',
  horaInicio: '18:00',
  horaFin: '19:30',
  total: 120000,
  estado,
});
const pagina = (data, extra = {}) => ({ data, total: data.length, pagina: 1, limite: 10, paginas: 1, ...extra });

describe('<MisReservasPage />', () => {
  beforeEach(() => useAuth.mockReturnValue({ usuario: { rol: 'cliente' } }));

  test('lista las reservas con fecha, horario, total y estado', async () => {
    listarMisReservas.mockResolvedValue(pagina([reserva('r1'), reserva('r2', 'cancelada')]));
    renderConRouter(<MisReservasPage />);

    const filas = await screen.findAllByRole('listitem');
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('La Bombonera')).toBeInTheDocument();
    expect(within(filas[0]).getByText(/18:00 a 19:30/)).toBeInTheDocument();
    expect(within(filas[0]).getByText('Pendiente')).toBeInTheDocument();
    expect(within(filas[1]).getByText('Cancelada')).toBeInTheDocument();
  });

  test('solo las reservas pendientes se pueden cancelar', async () => {
    listarMisReservas.mockResolvedValue(pagina([reserva('r1'), reserva('r2', 'cancelada')]));
    renderConRouter(<MisReservasPage />);

    const filas = await screen.findAllByRole('listitem');
    expect(within(filas[0]).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(within(filas[1]).queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  test('pide confirmación y, si se responde No, no cancela', async () => {
    listarMisReservas.mockResolvedValue(pagina([reserva('r1')]));
    renderConRouter(<MisReservasPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('¿Cancelar esta reserva?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(cancelarReserva).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  test('al confirmar, cancela, informa y recarga la lista', async () => {
    listarMisReservas.mockResolvedValueOnce(pagina([reserva('r1')])).mockResolvedValueOnce(pagina([reserva('r1', 'cancelada')]));
    cancelarReserva.mockResolvedValue({});
    renderConRouter(<MisReservasPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }));

    expect(cancelarReserva).toHaveBeenCalledWith('r1');
    expect(await screen.findByText('Cancelaste la reserva de La Bombonera')).toBeInTheDocument();
    expect(await screen.findByText('Cancelada')).toBeInTheDocument();
    expect(listarMisReservas).toHaveBeenCalledTimes(2);
  });

  test('sin reservas, invita a buscar una cancha', async () => {
    listarMisReservas.mockResolvedValue(pagina([]));
    renderConRouter(<MisReservasPage />);

    expect(await screen.findByText('Todavía no tienes reservas.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver canchas' })).toHaveAttribute('href', '/canchas');
  });

  test('pagina los resultados pidiendo la página siguiente a la API', async () => {
    listarMisReservas
      .mockResolvedValueOnce(pagina([reserva('r1')], { total: 15, paginas: 2 }))
      .mockResolvedValueOnce(pagina([reserva('r11')], { total: 15, pagina: 2, paginas: 2 }));
    renderConRouter(<MisReservasPage />);

    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
    expect(listarMisReservas).toHaveBeenLastCalledWith(2);
  });

  test('el administrador ve todas las reservas con el nombre del cliente', async () => {
    useAuth.mockReturnValue({ usuario: { rol: 'admin' } });
    listarMisReservas.mockResolvedValue(pagina([reserva('r1')]));
    renderConRouter(<MisReservasPage />);

    expect(await screen.findByRole('heading', { name: 'Todas las reservas' })).toBeInTheDocument();
    expect(screen.getByText('Reservó Ana Pérez')).toBeInTheDocument();
  });
});
