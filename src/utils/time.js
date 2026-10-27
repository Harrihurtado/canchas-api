// Convierte "18:30" en minutos desde medianoche (1110)
const horaAMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Horas entre dos horas "HH:mm" (ej. 18:00 a 19:30 = 1.5)
const calcularHoras = (horaInicio, horaFin) =>
  (horaAMinutos(horaFin) - horaAMinutos(horaInicio)) / 60;

module.exports = { horaAMinutos, calcularHoras };
