import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import AuthLayout from '../components/AuthLayout';
import { registrar } from '../services/auth.service';

export default function RegisterPage() {
  const navigate = useNavigate();

  const crearCuenta = async (datos) => {
    await registrar(datos);
    navigate('/login', { state: { registrado: true } });
  };

  return (
    <AuthLayout titulo="Crea tu cuenta" subtitulo="Solo necesitas tu nombre, tu correo y una contraseña.">
      <RegisterForm onSubmit={crearCuenta} />
      <p className="pie">
        ¿Ya tienes cuenta? <Link to="/login" id="link-login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
