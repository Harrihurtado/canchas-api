const jsonwebtoken = require('jsonwebtoken');
const { generarToken, verificarToken } = require('../../../src/utils/jwt');

describe('utils/jwt', () => {
  const usuario = { _id: '6ae0e27deef6ec15268e9a21', rol: 'cliente' };

  test('genera un token que contiene el id y el rol del usuario', () => {
    const token = generarToken(usuario);
    const payload = verificarToken(token);

    expect(payload.id).toBe(usuario._id);
    expect(payload.rol).toBe('cliente');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test('el token no incluye datos sensibles como la contraseña', () => {
    const token = generarToken({ ...usuario, password: 'Secreta123' });
    const payload = verificarToken(token);

    expect(payload).not.toHaveProperty('password');
  });

  test('rechaza un token firmado con otro secreto', () => {
    const falso = jsonwebtoken.sign({ id: usuario._id, rol: 'admin' }, 'otro_secreto');
    expect(() => verificarToken(falso)).toThrow();
  });

  test('rechaza un token expirado', () => {
    const expirado = jsonwebtoken.sign({ id: usuario._id, rol: 'cliente' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    expect(() => verificarToken(expirado)).toThrow(/expired/);
  });
});
