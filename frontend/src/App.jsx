import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogoPage from './pages/CatalogoPage';
import ReservarPage from './pages/ReservarPage';
import MisReservasPage from './pages/MisReservasPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/canchas" element={<main className="contenedor"><CatalogoPage /></main>} />
          <Route path="/canchas/:id/reservar" element={<main className="contenedor"><ReservarPage /></main>} />
          <Route path="/mis-reservas" element={<main className="contenedor"><MisReservasPage /></main>} />
        </Route>
        <Route path="*" element={<Navigate to="/canchas" replace />} />
      </Routes>
    </>
  );
}
