import { useState } from 'react';
import Alert from './Alert';
import { DEPORTES, SUPERFICIES } from '../utils/format';
import { validarCancha } from '../utils/validaciones';

const VACIA = { nombre: '', deporte: 'futbol5', superficie: 'sintetica', precioHora: '', capacidad: '', ubicacion: '' };

// Formulario para crear o editar una cancha. Si recibe "cancha", funciona en modo edición.
export default function CanchaForm({ cancha, onSubmit, onCancel }) {
  const [datos, setDatos] = useState(() =>
    cancha
      ? {
          nombre: cancha.nombre,
          deporte: cancha.deporte,
          superficie: cancha.superficie,
          precioHora: String(cancha.precioHora),
          capacidad: String(cancha.capacidad),
          ubicacion: cancha.ubicacion,
        }
      : VACIA
  );
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const errores = validarCancha(datos);
    if (errores.length) {
      setError({ mensaje: 'Revisa los datos de la cancha', detalles: errores });
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await onSubmit({
        nombre: datos.nombre.trim(),
        deporte: datos.deporte,
        superficie: datos.superficie,
        precioHora: Number(datos.precioHora),
        capacidad: Number(datos.capacidad),
        ubicacion: datos.ubicacion.trim(),
      });
    } catch (err) {
      const mensaje = err.status === 409 ? `Ya existe una cancha llamada "${datos.nombre.trim()}". Usa otro nombre.` : err.message;
      setError({ mensaje, detalles: err.status === 409 ? undefined : err.details });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="formulario" id="form-cancha" noValidate>
      <div className="campo">
        <label htmlFor="cancha-nombre">Nombre</label>
        <input id="cancha-nombre" name="nombre" placeholder="Ej. La Bombonera" value={datos.nombre} onChange={cambiar} />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="cancha-deporte">Deporte</label>
          <select id="cancha-deporte" name="deporte" value={datos.deporte} onChange={cambiar}>
            {Object.entries(DEPORTES).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="cancha-superficie">Superficie</label>
          <select id="cancha-superficie" name="superficie" value={datos.superficie} onChange={cambiar}>
            {Object.entries(SUPERFICIES).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="cancha-precio">Precio por hora (COP)</label>
          <input id="cancha-precio" name="precioHora" type="number" min="0" step="1000" inputMode="numeric" placeholder="80000" value={datos.precioHora} onChange={cambiar} />
        </div>
        <div className="campo">
          <label htmlFor="cancha-capacidad">Capacidad (jugadores)</label>
          <input id="cancha-capacidad" name="capacidad" type="number" min="2" inputMode="numeric" placeholder="10" value={datos.capacidad} onChange={cambiar} />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="cancha-ubicacion">Ubicación</label>
        <input id="cancha-ubicacion" name="ubicacion" placeholder="Ej. Sede Norte" value={datos.ubicacion} onChange={cambiar} />
      </div>

      <Alert id="cancha-form-error" detalles={error?.detalles}>{error?.mensaje}</Alert>

      <div className="acciones">
        <button type="button" className="btn btn-secundario" id="btn-cancelar-cancha" onClick={onCancel}>
          Descartar
        </button>
        <button type="submit" className="btn btn-primario" id="btn-guardar-cancha" disabled={enviando}>
          {enviando ? 'Guardando…' : cancha ? 'Guardar cambios' : 'Crear cancha'}
        </button>
      </div>
    </form>
  );
}
