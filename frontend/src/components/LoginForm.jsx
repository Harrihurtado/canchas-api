import { useState } from 'react';
import Alert from './Alert';

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña');
      return;
    }
    setEnviando(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="formulario" id="form-login" noValidate>
      <div className="campo">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="campo">
        <label htmlFor="password">Contraseña</label>
        <div className="con-accion">
          <input id="password" name="password" type={verPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="ver-password" onClick={() => setVerPassword(!verPassword)} aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {verPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      <Alert id="login-error">{error}</Alert>

      <button type="submit" className="btn btn-primario btn-ancho" id="btn-login" disabled={enviando}>
        {enviando ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
