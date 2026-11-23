export const DEPORTES = {
  futbol5: 'Fútbol 5',
  futbol8: 'Fútbol 8',
  futbol11: 'Fútbol 11',
  voleibol: 'Voleibol',
  baloncesto: 'Baloncesto',
  tenis: 'Tenis',
};

export const SUPERFICIES = {
  sintetica: 'Sintética',
  natural: 'Natural',
  cemento: 'Cemento',
  madera: 'Madera',
};

export const ESTADOS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

export const formatoPrecio = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Horas entre "18:00" y "19:30" -> 1.5 (0 si el rango no es válido)
export const calcularHoras = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  const minutos = aMinutos(fin) - aMinutos(inicio);
  return minutos > 0 ? minutos / 60 : 0;
};

// Franjas de 30 minutos entre las 06:00 y las 23:00
export const HORARIOS = Array.from({ length: 35 }, (_, i) => {
  const total = 6 * 60 + i * 30;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});

const aISO = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

// Próximos N días a partir de mañana: [{ valor: "2026-11-24", diaSemana: "mar", numero: 24, mes: "nov", etiqueta }]
export const proximosDias = (cantidad = 14, desde = new Date()) =>
  Array.from({ length: cantidad }, (_, i) => {
    const dia = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i + 1);
    return {
      valor: aISO(dia),
      diaSemana: dia.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
      numero: dia.getDate(),
      mes: dia.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
      etiqueta: dia.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }),
    };
  });

// "2026-11-24T00:00:00.000Z" -> "24/11/2026" (la API guarda la fecha a medianoche UTC)
export const formatoFecha = (iso) => {
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

// "2026-11-24T00:00:00.000Z" -> { numero: 24, mes: "nov", diaSemana: "mar" } (sin desfase de zona horaria)
export const partesFecha = (iso) => {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return {
    numero: dia,
    mes: fecha.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
    diaSemana: fecha.toLocaleDateString('es-CO', { weekday: 'long' }),
  };
};
