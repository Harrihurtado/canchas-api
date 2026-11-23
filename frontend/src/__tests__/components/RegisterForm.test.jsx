import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../components/RegisterForm';

const llenar = async ({ nombre = 'Ana', email = 'ana@test.com', password = 'Segura123', telefono = '' } = {}) => {
  if (nombre) await userEvent.type(screen.getByLabelText('Nombre completo'), nombre);
  if (email) await userEvent.type(screen.getByLabelText('Correo electrónico'), email);
  if (password) await userEvent.type(screen.getByLabelText('Contraseña'), password);
  if (telefono) await userEvent.type(screen.getByLabelText(/Teléfono/), telefono);
};

describe('<RegisterForm />', () => {
  test('valida en el cliente y lista cada error sin llamar a la API', async () => {
    const onSubmit = jest.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await llenar({ nombre: '', email: 'no-es-correo', password: '123' });
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Revisa los datos del formulario');
    expect(within(alerta).getAllByRole('listitem')).toHaveLength(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('no envía el teléfono si se deja vacío', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    render(<RegisterForm onSubmit={onSubmit} />);

    await llenar();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledWith({ nombre: 'Ana', email: 'ana@test.com', password: 'Segura123' });
  });

  test('incluye el teléfono cuando se escribe', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    render(<RegisterForm onSubmit={onSubmit} />);

    await llenar({ telefono: '3001234567' });
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ telefono: '3001234567' }));
  });

  test('muestra el error de la API, por ejemplo un correo ya registrado', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('El correo ya está registrado'));
    render(<RegisterForm onSubmit={onSubmit} />);

    await llenar();
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El correo ya está registrado');
  });
});
