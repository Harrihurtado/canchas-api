import { useEffect, useState } from 'react';
import CanchaCard from '../components/CanchaCard';
import Alert from '../components/Alert';
import { listarCanchas } from '../services/canchas.service';
import { DEPORTES } from '../utils/format';

const FILTROS = [['', 'Todas'], ...Object.entries(DEPORTES)];

export default function CatalogoPage() {
  const [deporte, setDeporte] = useState('');
  const [canchas, setCanchas] = useState([]);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true; // evita actualizar el estado si el filtro cambió antes de que llegara la respuesta
    listarCanchas(deporte)
      .then((res) => {
        if (!activo) return;
        setCanchas(res.data);
        setEstado('listo');
      })
      .catch((err) => {
        if (!activo) return;
        setError(err.message);
        setEstado('error');
      });
    return () => {
      activo = false;
    };
  }, [deporte]);

  const filtrar = (valor) => {
    if (valor === deporte) return;
    setEstado('cargando');
    setDeporte(valor);
  };

  return (
    <section>
      <header className="encabezado">
        <h1>Reserva tu cancha</h1>
        <p className="subtitulo">Elige el deporte, mira el precio por hora y aparta tu turno.</p>
      </header>

      <div className="filtros" id="filtro-deporte" role="group" aria-label="Filtrar por deporte">
        {FILTROS.map(([valor, nombre]) => (
          <button
            key={valor || 'todas'}
            type="button"
            id={`filtro-${valor || 'todas'}`}
            className="chip"
            aria-pressed={deporte === valor}
            onClick={() => filtrar(valor)}
          >
            {nombre}
          </button>
        ))}
      </div>

      {estado === 'cargando' && (
        <div className="grilla" id="catalogo-cargando" aria-busy="true" aria-label="Cargando canchas">
          {[1, 2, 3].map((n) => <div key={n} className="cancha-card esqueleto" />)}
        </div>
      )}
      {estado === 'error' && <Alert id="catalogo-error">{error}</Alert>}
      {estado === 'listo' && canchas.length === 0 && (
        <div className="vacio" id="catalogo-vacio">
          <p><strong>No hay canchas de {DEPORTES[deporte]?.toLowerCase()} disponibles.</strong></p>
          <p>Prueba con otro deporte.</p>
          <button type="button" className="btn btn-secundario" onClick={() => filtrar('')}>Ver todas las canchas</button>
        </div>
      )}
      {estado === 'listo' && canchas.length > 0 && (
        <>
          <p className="conteo" id="conteo-canchas">
            {canchas.length} {canchas.length === 1 ? 'cancha disponible' : 'canchas disponibles'}
          </p>
          <div className="grilla" id="lista-canchas">
            {canchas.map((c) => <CanchaCard key={c._id} cancha={c} />)}
          </div>
        </>
      )}
    </section>
  );
}
