import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';

describe('<LoginForm />', () => {
  test('si faltan datos, avisa y no llama a onSubmit', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa tu correo y tu contraseña');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('envía el correo sin espacios y la contraseña', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), '  ana@test.com ');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(onSubmit).toHaveBeenCalledWith('ana@test.com', 'Segura123');
  });

  test('muestra el mensaje de la API cuando las credenciales son incorrectas', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Credenciales inválidas'));
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala1234');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });

  test('desactiva el botón mientras espera la respuesta', async () => {
    let resolver;
    const onSubmit = jest.fn(() => new Promise((r) => { resolver = r; }));
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Segura123');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('button', { name: 'Ingresando…' })).toBeDisabled();
    resolver();
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
  });

  test('el botón Mostrar alterna la visibilidad de la contraseña', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    const campo = screen.getByLabelText('Contraseña');

    expect(campo).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(campo).toHaveAttribute('type', 'text');
  });
});
