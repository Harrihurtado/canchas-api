import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReservaForm from '../components/ReservaForm';
import Alert from '../components/Alert';
import CourtArt from '../components/CourtArt';
import { obtenerCancha } from '../services/canchas.service';
import { crearReserva } from '../services/reservas.service';
import { DEPORTES, SUPERFICIES, formatoFecha, formatoPrecio } from '../utils/format';

export default function ReservarPage() {
  const { id } = useParams();
  const [cancha, setCancha] = useState(null);
  const [error, setError] = useState('');
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    obtenerCancha(id)
      .then((res) => setCancha(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  const reservar = async (datos) => {
    setReserva(null);
    const res = await crearReserva(datos);
    setReserva(res.data);
  };

  if (error) {
    return (
      <section>
        <Alert id="cancha-error">{error}</Alert>
        <Link to="/canchas">Volver al catálogo</Link>
      </section>
    );
  }
  if (!cancha) return <p className="cargando">Cargando cancha…</p>;

  return (
    <section className="reservar">
      <Link to="/canchas" className="volver">Volver al catálogo</Link>

      <div className="reservar-grid">
        <aside className="ficha">
          <div className="ficha-portada">
            <CourtArt deporte={cancha.deporte} />
          </div>
          <div className="ficha-cuerpo">
            <span className="etiqueta">{DEPORTES[cancha.deporte]}</span>
            <h1 id="cancha-titulo">{cancha.nombre}</h1>
            <p className="cancha-ubicacion">{cancha.ubicacion}</p>
            <dl className="cancha-datos">
              <div><dt>Superficie</dt><dd>{SUPERFICIES[cancha.superficie]}</dd></div>
              <div><dt>Capacidad</dt><dd>{cancha.capacidad} jugadores</dd></div>
              <div><dt>Precio</dt><dd>{formatoPrecio(cancha.precioHora)} por hora</dd></div>
            </dl>
          </div>
        </aside>

        <div className="reservar-form">
          <h2>Elige día y horario</h2>
          {reserva && (
            <div className="confirmacion" id="reserva-exito" role="status">
              <p className="confirmacion-titulo">Reserva creada</p>
              <p>
                {formatoFecha(reserva.fecha)}, de {reserva.horaInicio} a {reserva.horaFin}. Total: <strong>{formatoPrecio(reserva.total)}</strong>
              </p>
              <Link to="/mis-reservas">Ver mis reservas</Link>
            </div>
          )}
          <ReservaForm cancha={cancha} onSubmit={reservar} />
        </div>
      </div>
    </section>
  );
}
