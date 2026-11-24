import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import Alert from '../components/Alert';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si llegó aquí desde una página privada, vuelve a ella al iniciar sesión
  const destino = location.state?.desde || '/canchas';

  // Con sesión iniciada se redirige al destino. Antes iba siempre a /canchas y, como esta página
  // se vuelve a dibujar al iniciar sesión, le ganaba a la redirección correcta (defecto hallado con Selenium).
  if (usuario) return <Navigate to={destino} replace />;

  const entrar = async (email, password) => {
    await iniciarSesion(email, password);
    navigate(destino, { replace: true });
  };

  return (
    <AuthLayout titulo="Inicia sesión" subtitulo="Entra para reservar y ver tus turnos.">
      <Alert tipo="exito" id="registro-exito">
        {location.state?.registrado && 'Tu cuenta está lista. Inicia sesión para reservar.'}
      </Alert>
      <LoginForm onSubmit={entrar} />
      <p className="pie">
        ¿Aún no tienes cuenta? <Link to="/registro" id="link-registro">Crea una gratis</Link>
      </p>
    </AuthLayout>
  );
}
