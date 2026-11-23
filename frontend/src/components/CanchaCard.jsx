import { Link } from 'react-router-dom';
import CourtArt from './CourtArt';
import { DEPORTES, SUPERFICIES, formatoPrecio } from '../utils/format';

export default function CanchaCard({ cancha }) {
  return (
    <article className="cancha-card" data-testid={`cancha-${cancha._id}`} data-deporte={cancha.deporte}>
      <div className="cancha-portada">
        <CourtArt deporte={cancha.deporte} />
        <span className="etiqueta">{DEPORTES[cancha.deporte] || cancha.deporte}</span>
      </div>
      <div className="cancha-cuerpo">
        <h3 className="cancha-nombre">{cancha.nombre}</h3>
        <p className="cancha-ubicacion">{cancha.ubicacion}</p>
        <dl className="cancha-datos">
          <div><dt>Superficie</dt><dd>{SUPERFICIES[cancha.superficie] || cancha.superficie}</dd></div>
          <div><dt>Capacidad</dt><dd>{cancha.capacidad} jugadores</dd></div>
        </dl>
        <div className="cancha-pie">
          <p className="cancha-precio">
            {formatoPrecio(cancha.precioHora)}<span> por hora</span>
          </p>
          <Link to={`/canchas/${cancha._id}/reservar`} className="btn btn-primario btn-reservar">
            Reservar
          </Link>
        </div>
      </div>
    </article>
  );
}
