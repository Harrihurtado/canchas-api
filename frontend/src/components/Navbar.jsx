import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate('/login');
  };

  if (!usuario) return null;

  const iniciales = usuario.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <header className="navbar">
      <div className="navbar-interior">
        <Link to="/canchas" className="logo" aria-label="CanchaYa, ir al catálogo">
          <svg viewBox="0 0 28 20" aria-hidden="true">
            <rect x="1" y="1" width="26" height="18" rx="2" />
            <line x1="14" y1="1" x2="14" y2="19" />
            <circle cx="14" cy="10" r="4" />
          </svg>
          CanchaYa
        </Link>
        <nav className="navbar-menu">
            <NavLink to="/canchas" end id="nav-canchas">Canchas</NavLink>
            <NavLink to="/mis-reservas" id="nav-reservas">{usuario.rol === 'admin' ? 'Reservas' : 'Mis reservas'}</NavLink>
            {usuario.rol === 'admin' && (
              <NavLink to="/admin/canchas" id="nav-admin">Administrar</NavLink>
            )}
            <span className="usuario">
              <span className="avatar" aria-hidden="true">{iniciales}</span>
              <span id="usuario-nombre">{usuario.nombre}</span>
              {usuario.rol === 'admin' && <span className="rol" id="usuario-rol">Admin</span>}
            </span>
            <button type="button" className="btn-salir" id="btn-logout" onClick={salir}>
              Cerrar sesión
            </button>
          </nav>
      </div>
    </header>
  );
}
