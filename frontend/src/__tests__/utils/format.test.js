import { HORARIOS, calcularHoras, formatoFecha, formatoPrecio, partesFecha, proximosDias } from '../../utils/format';

describe('utils/format', () => {
  test.each([
    ['18:00', '19:00', 1],
    ['18:00', '19:30', 1.5],
    ['06:00', '23:00', 17],
  ])('calcularHoras(%s, %s) = %d', (inicio, fin, esperado) => {
    expect(calcularHoras(inicio, fin)).toBe(esperado);
  });

  test.each([
    ['fin anterior al inicio', '20:00', '19:00'],
    ['horas iguales', '18:00', '18:00'],
    ['hora vacía', '', '19:00'],
  ])('calcularHoras devuelve 0 si hay %s', (_caso, inicio, fin) => {
    expect(calcularHoras(inicio, fin)).toBe(0);
  });

  test('formatoPrecio usa pesos colombianos sin decimales', () => {
    expect(formatoPrecio(120000).replace(/\s/g, ' ')).toBe('$ 120.000');
  });

  test('HORARIOS va de 06:00 a 23:00 en franjas de 30 minutos', () => {
    expect(HORARIOS[0]).toBe('06:00');
    expect(HORARIOS[1]).toBe('06:30');
    expect(HORARIOS.at(-1)).toBe('23:00');
    expect(HORARIOS).toHaveLength(35);
  });

  test('proximosDias empieza mañana y devuelve fechas consecutivas', () => {
    const dias = proximosDias(3, new Date(2026, 11, 30)); // 30 de diciembre
    expect(dias.map((d) => d.valor)).toEqual(['2026-12-31', '2027-01-01', '2027-01-02']);
    expect(dias[1]).toMatchObject({ numero: 1 });
  });

  test('formatoFecha y partesFecha no se corren un día por la zona horaria', () => {
    expect(formatoFecha('2026-11-24T00:00:00.000Z')).toBe('24/11/2026');
    expect(partesFecha('2026-11-24T00:00:00.000Z')).toMatchObject({ numero: 24, diaSemana: 'martes' });
  });
});
