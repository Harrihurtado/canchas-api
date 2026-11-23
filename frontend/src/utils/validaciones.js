// Validaciones del lado del cliente: dan respuesta inmediata; la API vuelve a validar todo
export const validarRegistro = ({ nombre, email, password, telefono }) => {
  const errores = [];
  if (!nombre.trim()) errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errores.push({ campo: 'email', mensaje: 'El correo no es válido' });
  if (password.length < 8) errores.push({ campo: 'password', mensaje: 'La contraseña debe tener al menos 8 caracteres' });
  if (telefono && !/^\d{7,10}$/.test(telefono)) errores.push({ campo: 'telefono', mensaje: 'El teléfono debe tener entre 7 y 10 dígitos' });
  return errores;
};
