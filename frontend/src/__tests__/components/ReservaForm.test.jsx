import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservaForm from '../../components/ReservaForm';
import { canchaEjemplo, diasEjemplo } from '../../test/utils';

const renderForm = (onSubmit = jest.fn().mockResolvedValue()) => {
  render(<ReservaForm cancha={canchaEjemplo} onSubmit={onSubmit} dias={diasEjemplo} />);
  return onSubmit;
};

const total = () => screen.getByText((_, el) => el?.id === 'total-estimado').textContent.replace(/\s/g, ' ');

describe('<ReservaForm />', () => {
  test('por defecto propone el primer día de 18:00 a 19:00 con su total', () => {
    renderForm();

    expect(screen.getByRole('radio', { name: 'martes, 1 de diciembre' })).toHaveAttribute('aria-checked', 'true');
    expect(total()).toBe('$ 80.000');
  });

  test('recalcula el total al cambiar el horario (1,5 h × 80.000 = 120.000)', async () => {
    renderForm();

    await userEvent.selectOptions(screen.getByLabelText('Hasta'), '19:30');

    expect(total()).toBe('$ 120.000');
    expect(screen.getByRole('button', { name: /Reservar por \$\s120\.000/ })).toBeInTheDocument();
  });

  test('envía la cancha, el día elegido y las horas', async () => {
    const onSubmit = renderForm();

    await userEvent.click(screen.getByRole('radio', { name: 'miércoles, 2 de diciembre' }));
    await userEvent.selectOptions(screen.getByLabelText('Desde'), '20:00');
    await userEvent.selectOptions(screen.getByLabelText('Hasta'), '21:00');
    await userEvent.click(screen.getByRole('button', { name: /Reservar por/ }));

    expect(onSubmit).toHaveBeenCalledWith({
      cancha: canchaEjemplo._id,
      fecha: '2026-12-02',
      horaInicio: '20:00',
      horaFin: '21:00',
    });
  });

  test('si la hora de fin no es posterior, avisa y no envía', async () => {
    const onSubmit = renderForm();

    await userEvent.selectOptions(screen.getByLabelText('Desde'), '20:00');
    await userEvent.selectOptions(screen.getByLabelText('Hasta'), '19:00');
    await userEvent.click(screen.getByRole('button', { name: /Reservar por/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('La hora de fin debe ser posterior a la hora de inicio');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('ante un cruce de horario muestra el mensaje de la API y conserva lo elegido', async () => {
    renderForm(jest.fn().mockRejectedValue(new Error('La cancha ya está reservada de 18:00 a 19:30 en esa fecha')));

    await userEvent.selectOptions(screen.getByLabelText('Hasta'), '19:30');
    await userEvent.click(screen.getByRole('button', { name: /Reservar por/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ya está reservada');
    expect(screen.getByLabelText('Hasta')).toHaveValue('19:30');
  });
});
