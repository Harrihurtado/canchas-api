import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogoPage from '../../pages/CatalogoPage';
import { listarCanchas } from '../../services/canchas.service';
import { canchaEjemplo, renderConRouter } from '../../test/utils';

// La API se reemplaza por un mock: la prueba no depende del backend
jest.mock('../../services/canchas.service', () => ({ listarCanchas: jest.fn() }));

const voley = { ...canchaEjemplo, _id: 'c2', nombre: 'Arena Voley', deporte: 'voleibol' };

describe('<CatalogoPage />', () => {
  test('muestra el indicador de carga y luego las canchas', async () => {
    listarCanchas.mockResolvedValue({ data: [canchaEjemplo, voley] });
    renderConRouter(<CatalogoPage />);

    expect(screen.getByLabelText('Cargando canchas')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'La Bombonera' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Arena Voley' })).toBeInTheDocument();
    expect(screen.getByText('2 canchas disponibles')).toBeInTheDocument();
    expect(listarCanchas).toHaveBeenCalledWith('');
  });

  test('al elegir un deporte vuelve a consultar con ese filtro y lo marca como activo', async () => {
    listarCanchas.mockResolvedValueOnce({ data: [canchaEjemplo, voley] }).mockResolvedValueOnce({ data: [voley] });
    renderConRouter(<CatalogoPage />);
    await screen.findByText('2 canchas disponibles');

    const filtro = screen.getByRole('button', { name: 'Voleibol' });
    await userEvent.click(filtro);

    expect(await screen.findByText('1 cancha disponible')).toBeInTheDocument();
    expect(listarCanchas).toHaveBeenLastCalledWith('voleibol');
    expect(filtro).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('heading', { name: 'La Bombonera' })).not.toBeInTheDocument();
  });

  test('si no hay canchas del deporte, lo explica y permite volver a ver todas', async () => {
    listarCanchas.mockResolvedValueOnce({ data: [canchaEjemplo] }).mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [canchaEjemplo] });
    renderConRouter(<CatalogoPage />);
    await screen.findByText('1 cancha disponible');

    await userEvent.click(screen.getByRole('button', { name: 'Tenis' }));
    expect(await screen.findByText('No hay canchas de tenis disponibles.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ver todas las canchas' }));
    expect(await screen.findByRole('heading', { name: 'La Bombonera' })).toBeInTheDocument();
  });

  test('si la API falla, muestra el error', async () => {
    listarCanchas.mockRejectedValue(new Error('No se pudo conectar con el servidor. Intenta de nuevo.'));
    renderConRouter(<CatalogoPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor');
  });
});
