import { screen } from '@testing-library/react';
import CanchaCard from '../../components/CanchaCard';
import { canchaEjemplo, renderConRouter } from '../../test/utils';

describe('<CanchaCard />', () => {
  test('muestra nombre, deporte, ubicación, superficie, capacidad y precio', () => {
    renderConRouter(<CanchaCard cancha={canchaEjemplo} />);

    expect(screen.getByRole('heading', { name: 'La Bombonera' })).toBeInTheDocument();
    expect(screen.getByText('Fútbol 5')).toBeInTheDocument();
    expect(screen.getByText('Sede Norte')).toBeInTheDocument();
    expect(screen.getByText('Sintética')).toBeInTheDocument();
    expect(screen.getByText('10 jugadores')).toBeInTheDocument();
    expect(screen.getByText(/80\.000/)).toBeInTheDocument();
  });

  test('el botón Reservar lleva a la página de reserva de esa cancha', () => {
    renderConRouter(<CanchaCard cancha={canchaEjemplo} />);

    expect(screen.getByRole('link', { name: 'Reservar' })).toHaveAttribute(
      'href',
      `/canchas/${canchaEjemplo._id}/reservar`
    );
  });

  test('dibuja la superficie según el deporte', () => {
    const { container } = renderConRouter(<CanchaCard cancha={{ ...canchaEjemplo, deporte: 'baloncesto' }} />);
    expect(container.querySelector('svg.court')).toHaveClass('court-baloncesto');
  });
});
