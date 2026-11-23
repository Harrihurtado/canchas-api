import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservarPage from '../../pages/ReservarPage';
import { obtenerCancha } from '../../services/canchas.service';
import { crearReserva } from '../../services/reservas.service';
import { canchaEjemplo, renderConRouter } from '../../test/utils';

jest.mock('../../services/canchas.service', () => ({ obtenerCancha: jest.fn() }));
jest.mock('../../services/reservas.service', () => ({ crearReserva: jest.fn() }));

const renderPagina = () =>
  renderConRouter(<ReservarPage />, { ruta: `/canchas/${canchaEjemplo._id}/reservar`, patron: '/canchas/:id/reservar' });

describe('<ReservarPage />', () => {
  test('carga la cancha indicada en la URL', async () => {
    obtenerCancha.mockResolvedValue({ data: canchaEjemplo });
    renderPagina();

    expect(await screen.findByRole('heading', { name: 'La Bombonera' })).toBeInTheDocument();
    expect(obtenerCancha).toHaveBeenCalledWith(canchaEjemplo._id);
  });

  test('al reservar muestra la confirmación con el total que calculó la API', async () => {
    obtenerCancha.mockResolvedValue({ data: canchaEjemplo });
    crearReserva.mockResolvedValue({
      data: { fecha: '2026-12-01T00:00:00.000Z', horaInicio: '18:00', horaFin: '19:00', total: 80000 },
    });
    renderPagina();

    await userEvent.click(await screen.findByRole('button', { name: /Reservar por/ }));

    const confirmacion = await screen.findByRole('status');
    expect(confirmacion).toHaveTextContent('Reserva creada');
    expect(confirmacion).toHaveTextContent('01/12/2026, de 18:00 a 19:00');
    expect(crearReserva).toHaveBeenCalledWith(expect.objectContaining({ cancha: canchaEjemplo._id }));
  });

  test('si la cancha no existe, muestra el error y un enlace de regreso', async () => {
    obtenerCancha.mockRejectedValue(new Error('Cancha no encontrada'));
    renderPagina();

    expect(await screen.findByRole('alert')).toHaveTextContent('Cancha no encontrada');
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();
  });
});
