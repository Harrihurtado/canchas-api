const { horaAMinutos, calcularHoras } = require('../../../src/utils/time');

describe('utils/time', () => {
  describe('horaAMinutos', () => {
    test.each([
      ['00:00', 0],
      ['08:15', 495],
      ['18:30', 1110],
      ['23:59', 1439],
    ])('convierte %s en %i minutos', (hora, esperado) => {
      expect(horaAMinutos(hora)).toBe(esperado);
    });
  });

  describe('calcularHoras', () => {
    test('una hora exacta', () => {
      expect(calcularHoras('18:00', '19:00')).toBe(1);
    });

    test('hora y media', () => {
      expect(calcularHoras('18:00', '19:30')).toBe(1.5);
    });

    test('devuelve negativo si el fin es antes del inicio (lo valida el service)', () => {
      expect(calcularHoras('20:00', '19:00')).toBe(-1);
    });
  });
});
