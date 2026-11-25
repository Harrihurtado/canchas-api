import { useState } from 'react';
import Alert from './Alert';
import { HORARIOS, calcularHoras, formatoPrecio, proximosDias } from '../utils/format';

export default function ReservaForm({ cancha, onSubmit, dias = proximosDias(14) }) {
  const [fecha, setFecha] = useState(dias[0]?.valor || '');
  const [horaInicio, setHoraInicio] = useState('18:00');
  const [horaFin, setHoraFin] = useState('19:00');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const horas = calcularHoras(horaInicio, horaFin);
  const total = horas * cancha.precioHora;
  const diaElegido = dias.find((d) => d.valor === fecha);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (horas <= 0) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    setEnviando(true);
    try {
      // Si la API rechaza (por ejemplo, un cruce de horario), los campos conservan lo elegido
      await onSubmit({ cancha: cancha._id, fecha, horaInicio, horaFin });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="formulario" id="form-reserva" noValidate>
      <fieldset className="campo">
        <legend>Día</legend>
        <div className="dias" id="fecha" role="radiogroup" aria-label="Día de la reserva">
          {dias.map((d) => (
            <button
              key={d.valor}
              type="button"
              role="radio"
              aria-checked={fecha === d.valor}
              aria-label={d.etiqueta}
              className="dia"
              data-fecha={d.valor}
              onClick={() => setFecha(d.valor)}
            >
              <span className="dia-semana">{d.diaSemana}</span>
              <span className="dia-numero">{d.numero}</span>
              <span className="dia-mes">{d.mes}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="fila">
        <div className="campo">
          <label htmlFor="hora-inicio">Desde</label>
          <select id="hora-inicio" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}>
            {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="hora-fin">Hasta</label>
          <select id="hora-fin" value={horaFin} onChange={(e) => setHoraFin(e.target.value)}>
            {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div className="resumen" id="resumen-reserva" aria-live="polite">
        <div>
          <p className="resumen-dia">{diaElegido?.etiqueta}</p>
          <p className="resumen-detalle">
            {horas > 0
              ? `${horaInicio} a ${horaFin} · ${horas.toLocaleString('es-CO')} ${horas === 1 ? 'hora' : 'horas'}`
              : 'Elige una hora de fin posterior al inicio'}
          </p>
        </div>
        <strong id="total-estimado">{formatoPrecio(total)}</strong>
      </div>

      <Alert id="reserva-error">{error}</Alert>

      <button type="submit" className="btn btn-primario btn-ancho" id="btn-confirmar" disabled={enviando}>
        {enviando ? 'Reservando…' : `Reservar por ${formatoPrecio(total)}`}
      </button>
    </form>
  );
}
