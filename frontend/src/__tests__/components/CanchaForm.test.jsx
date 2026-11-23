import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CanchaForm from '../../components/CanchaForm';
import { ApiError } from '../../services/api';
import { canchaEjemplo } from '../../test/utils';

const llenar = async () => {
  await userEvent.type(screen.getByLabelText('Nombre'), 'Tenis Club');
  await userEvent.selectOptions(screen.getByLabelText('Deporte'), 'tenis');
  await userEvent.selectOptions(screen.getByLabelText('Superficie'), 'cemento');
  await userEvent.type(screen.getByLabelText('Precio por hora (COP)'), '45000');
  await userEvent.type(screen.getByLabelText('Capacidad (jugadores)'), '4');
  await userEvent.type(screen.getByLabelText('Ubicación'), 'Sede Sur');
};

describe('<CanchaForm />', () => {
  test('en modo creación envía los números convertidos', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    render(<CanchaForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await llenar();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cancha' }));

    expect(onSubmit).toHaveBeenCalledWith({
      nombre: 'Tenis Club', deporte: 'tenis', superficie: 'cemento', precioHora: 45000, capacidad: 4, ubicacion: 'Sede Sur',
    });
  });

  test('valida antes de enviar', async () => {
    const onSubmit = jest.fn();
    render(<CanchaForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Crear cancha' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos de la cancha');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('en modo edición carga los datos de la cancha', () => {
    render(<CanchaForm cancha={canchaEjemplo} onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('La Bombonera');
    expect(screen.getByLabelText('Precio por hora (COP)')).toHaveValue(80000);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  test('traduce el 409 de la API a un mensaje claro sobre el nombre', async () => {
    render(<CanchaForm onSubmit={jest.fn().mockRejectedValue(new ApiError('Ya existe un registro', 409))} onCancel={jest.fn()} />);

    await llenar();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cancha' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cancha llamada "Tenis Club"');
  });

  test('Descartar llama a onCancel', async () => {
    const onCancel = jest.fn();
    render(<CanchaForm onSubmit={jest.fn()} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
