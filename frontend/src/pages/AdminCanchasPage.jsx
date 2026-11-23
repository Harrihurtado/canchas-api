import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '../components/Alert';
import CanchaForm from '../components/CanchaForm';
import CourtArt from '../components/CourtArt';
import { actualizarCancha, crearCancha, desactivarCancha, listarCanchas } from '../services/canchas.service';
import { DEPORTES, SUPERFICIES, formatoPrecio } from '../utils/format';

export default function AdminCanchasPage() {
  const [canchas, setCanchas] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null); // null: cerrado | 'nueva' | objeto cancha
  const [confirmando, setConfirmando] = useState(null); // id de la cancha que pide confirmación
  const panelRef = useRef(null);

  // Al abrir el formulario, lo lleva a la vista (útil en celular, donde la lista es larga)
  useEffect(() => {
    if (editando) panelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [editando]);

  const cargar = useCallback(() => {
    listarCanchas()
      .then((res) => setCanchas(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(cargar, [cargar]);

  const abrir = (valor) => {
    setMensaje('');
    setConfirmando(null);
    setEditando(valor);
  };

  const guardar = async (datos) => {
    if (editando === 'nueva') {
      await crearCancha(datos);
      setMensaje(`Creaste la cancha ${datos.nombre}`);
    } else {
      await actualizarCancha(editando._id, datos);
      setMensaje(`Guardaste los cambios de ${datos.nombre}`);
    }
    setEditando(null);
    cargar();
  };

  const desactivar = async (cancha) => {
    setError('');
    try {
      await desactivarCancha(cancha._id);
      setMensaje(`Desactivaste ${cancha.nombre}. Ya no aparece en el catálogo.`);
      setConfirmando(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="admin">
      <header className="encabezado encabezado-accion">
        <div>
          <h1>Administrar canchas</h1>
          <p className="subtitulo">Crea canchas, ajusta precios o retíralas del catálogo.</p>
        </div>
        {!editando && (
          <button type="button" className="btn btn-primario" id="btn-nueva-cancha" onClick={() => abrir('nueva')}>
            Nueva cancha
          </button>
        )}
      </header>

      <Alert id="admin-error">{error}</Alert>
      <Alert tipo="exito" id="admin-mensaje">{mensaje}</Alert>

      {editando && (
        <div className="panel-edicion" id="panel-cancha" ref={panelRef}>
          <h2>{editando === 'nueva' ? 'Nueva cancha' : `Editar ${editando.nombre}`}</h2>
          <CanchaForm
            key={editando === 'nueva' ? 'nueva' : editando._id}
            cancha={editando === 'nueva' ? null : editando}
            onSubmit={guardar}
            onCancel={() => setEditando(null)}
          />
        </div>
      )}

      {!canchas && !error && <p className="cargando">Cargando canchas…</p>}

      {canchas?.length === 0 && (
        <div className="vacio" id="admin-vacio">
          <p><strong>Todavía no hay canchas en el catálogo.</strong></p>
          <p>Crea la primera para que los clientes puedan reservar.</p>
        </div>
      )}

      {canchas?.length > 0 && (
        <ul className="lista-admin" id="tabla-canchas">
          {canchas.map((c) => (
            <li key={c._id} className="admin-cancha-fila" data-testid={`admin-cancha-${c._id}`}>
              <div className="admin-miniatura"><CourtArt deporte={c.deporte} /></div>
              <div className="admin-info">
                <p className="admin-nombre">{c.nombre}</p>
                <p className="admin-detalle">
                  {DEPORTES[c.deporte]}, {SUPERFICIES[c.superficie]?.toLowerCase()}, {c.capacidad} jugadores, {c.ubicacion}
                </p>
              </div>
              <p className="admin-precio">{formatoPrecio(c.precioHora)}<span> por hora</span></p>
              <div className="admin-acciones">
                {confirmando === c._id ? (
                  <div className="confirmar" role="group" aria-label="Confirmar desactivación">
                    <span>¿Retirar del catálogo?</span>
                    <button type="button" className="btn btn-peligro btn-confirmar-desactivar" onClick={() => desactivar(c)}>
                      Sí, desactivar
                    </button>
                    <button type="button" className="btn btn-texto" onClick={() => setConfirmando(null)}>No</button>
                  </div>
                ) : (
                  <>
                    <button type="button" className="btn btn-secundario btn-editar" onClick={() => abrir(c)}>Editar</button>
                    <button type="button" className="btn btn-texto btn-desactivar" onClick={() => setConfirmando(c._id)}>Desactivar</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
