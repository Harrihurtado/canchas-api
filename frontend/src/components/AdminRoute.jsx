import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Solo deja pasar a administradores. La API también lo valida: esto solo evita mostrar pantallas inútiles.
export default function AdminRoute() {
  const { usuario } = useAuth();
  if (usuario?.rol !== 'admin') return <Navigate to="/canchas" replace />;
  return <Outlet />;
}
