import { validarCancha, validarRegistro } from '../../utils/validaciones';

const campos = (errores) => errores.map((e) => e.campo);

describe('validarRegistro', () => {
  const valido = { nombre: 'Ana', email: 'ana@test.com', password: 'Segura123', telefono: '' };

  test('acepta datos válidos con teléfono opcional vacío', () => {
    expect(validarRegistro(valido)).toEqual([]);
  });

  test('detecta nombre vacío, correo inválido, contraseña corta y teléfono inválido', () => {
    const errores = validarRegistro({ nombre: '  ', email: 'no-es-correo', password: '123', telefono: '12ab' });
    expect(campos(errores)).toEqual(['nombre', 'email', 'password', 'telefono']);
  });
});

describe('validarCancha', () => {
  const valida = { nombre: 'Tenis 1', deporte: 'tenis', precioHora: '40000', capacidad: '4', ubicacion: 'Sur' };

  test('acepta una cancha válida', () => {
    expect(validarCancha(valida)).toEqual([]);
  });

  test('rechaza precio negativo, capacidad menor a 2 o decimal y ubicación vacía', () => {
    expect(campos(validarCancha({ ...valida, precioHora: '-1' }))).toEqual(['precioHora']);
    expect(campos(validarCancha({ ...valida, capacidad: '1' }))).toEqual(['capacidad']);
    expect(campos(validarCancha({ ...valida, capacidad: '2.5' }))).toEqual(['capacidad']);
    expect(campos(validarCancha({ ...valida, ubicacion: ' ' }))).toEqual(['ubicacion']);
  });
});
