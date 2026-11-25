import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { cancelarReserva, listarMisReservas } from '../services/reservas.service';
import { ESTADOS, formatoPrecio, partesFecha } from '../utils/format';

export default function MisReservasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';
  const [respuesta, setRespuesta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [confirmando, setConfirmando] = useState(null); // id de la reserva que pide confirmación

  const cargar = useCallback(() => {
    listarMisReservas(pagina)
      .then(setRespuesta)
      .catch((err) => setError(err.message));
  }, [pagina]);

  useEffect(cargar, [cargar]);

  const cancelar = async (reserva) => {
    setError('');
    setMensaje('');
    try {
      await cancelarReserva(reserva._id);
      setMensaje(`Cancelaste la reserva de ${reserva.cancha.nombre}`);
      setConfirmando(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!respuesta && !error) return <p className="cargando">Cargando reservas…</p>;

  return (
    <section className="mis-reservas">
      <header className="encabezado">
        <h1>{esAdmin ? 'Todas las reservas' : 'Mis reservas'}</h1>
        {respuesta?.total > 0 && (
          <p className="subtitulo">
            {respuesta.total} {respuesta.total === 1 ? 'reserva' : 'reservas'} en total
          </p>
        )}
      </header>

      <Alert id="reservas-error">{error}</Alert>
      <Alert tipo="exito" id="reservas-mensaje">{mensaje}</Alert>

      {respuesta?.total === 0 && (
        <div className="vacio" id="reservas-vacio">
          <p><strong>{esAdmin ? 'Todavía no hay reservas.' : 'Todavía no tienes reservas.'}</strong></p>
          {esAdmin ? (
            <p>Las reservas de los clientes aparecerán aquí.</p>
          ) : (
            <>
              <p>Busca una cancha y aparta tu primer turno.</p>
              <Link to="/canchas" className="btn btn-primario">Ver canchas</Link>
            </>
          )}
        </div>
      )}

      {respuesta?.total > 0 && (
        <>
          <ul className="lista-reservas" id="lista-reservas">
            {respuesta.data.map((r) => {
              const f = partesFecha(r.fecha);
              return (
                <li key={r._id} className={`reserva-fila reserva-${r.estado}`} data-testid={`reserva-${r._id}`}>
                  <div className="reserva-fecha" aria-label={`${f.diaSemana} ${f.numero} de ${f.mes}`}>
                    <span className="reserva-dia">{f.numero}</span>
                    <span className="reserva-mes">{f.mes}</span>
                  </div>
                  <div className="reserva-info">
                    <p className="reserva-cancha">{r.cancha?.nombre}</p>
                    <p className="reserva-detalle">
                      <span className="capitalizar">{f.diaSemana}</span>, {r.horaInicio} a {r.horaFin}
                    </p>
                    {esAdmin && <p className="reserva-cliente">Reservó {r.usuario?.nombre}</p>}
                  </div>
                  <p className="reserva-total">{formatoPrecio(r.total)}</p>
                  <span className={`estado estado-${r.estado}`}>{ESTADOS[r.estado]}</span>
                  <div className="reserva-acciones">
                    {r.estado === 'pendiente' && confirmando !== r._id && (
                      <button type="button" className="btn btn-texto btn-cancelar" onClick={() => setConfirmando(r._id)}>
                        Cancelar
                      </button>
                    )}
                    {confirmando === r._id && (
                      <div className="confirmar" role="group" aria-label="Confirmar cancelación">
                        <span>¿Cancelar esta reserva?</span>
                        <button type="button" className="btn btn-peligro btn-confirmar-cancelacion" onClick={() => cancelar(r)}>
                          Sí, cancelar
                        </button>
                        <button type="button" className="btn btn-texto btn-mantener" onClick={() => setConfirmando(null)}>
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {respuesta.paginas > 1 && (
            <nav className="paginacion" aria-label="Paginación de reservas">
              <button type="button" className="btn btn-secundario" id="pagina-anterior" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                Anterior
              </button>
              <span id="pagina-actual">Página {respuesta.pagina} de {respuesta.paginas}</span>
              <button type="button" className="btn btn-secundario" id="pagina-siguiente" disabled={pagina >= respuesta.paginas} onClick={() => setPagina(pagina + 1)}>
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
