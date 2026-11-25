import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth.service';
import { tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(tokenStorage.get()));

  // Si hay un token guardado, se valida pidiendo el perfil; si ya no sirve, se descarta
  useEffect(() => {
    if (!tokenStorage.get()) return;
    authService
      .perfil()
      .then((res) => setUsuario(res.data))
      .catch(() => tokenStorage.clear())
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    tokenStorage.set(res.token);
    setUsuario(res.data);
    return res.data;
  }, []);

  const cerrarSesion = useCallback(() => {
    tokenStorage.clear();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return contexto;
}
