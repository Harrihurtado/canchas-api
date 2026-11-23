import { useState } from 'react';
import Alert from './Alert';
import { validarRegistro } from '../utils/validaciones';

const VACIO = { nombre: '', email: '', password: '', telefono: '' };

export default function RegisterForm({ onSubmit }) {
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const errores = validarRegistro(datos);
    if (errores.length) {
      setError({ mensaje: 'Revisa los datos del formulario', detalles: errores });
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const payload = { nombre: datos.nombre.trim(), email: datos.email.trim(), password: datos.password };
      if (datos.telefono) payload.telefono = datos.telefono;
      await onSubmit(payload);
    } catch (err) {
      setError({ mensaje: err.message, detalles: err.details });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="formulario" id="form-registro" noValidate>
      <div className="campo">
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" name="nombre" autoComplete="name" placeholder="Como aparecerá en tus reservas" value={datos.nombre} onChange={cambiar} />
      </div>

      <div className="campo">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={datos.email} onChange={cambiar} />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={datos.password} onChange={cambiar} aria-describedby="ayuda-password" />
          <small id="ayuda-password">Mínimo 8 caracteres</small>
        </div>
        <div className="campo">
          <label htmlFor="telefono">Teléfono <span className="opcional">(opcional)</span></label>
          <input id="telefono" name="telefono" inputMode="numeric" placeholder="3001234567" value={datos.telefono} onChange={cambiar} />
        </div>
      </div>

      <Alert id="registro-error" detalles={error?.detalles}>{error?.mensaje}</Alert>

      <button type="submit" className="btn btn-primario btn-ancho" id="btn-registrar" disabled={enviando}>
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}
