import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Las páginas privadas redirigen al login si no hay sesión
export default function PrivateRoute() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <p className="cargando">Cargando…</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}
