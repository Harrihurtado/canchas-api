// Validaciones del lado del cliente: dan respuesta inmediata; la API vuelve a validar todo
export const validarRegistro = ({ nombre, email, password, telefono }) => {
  const errores = [];
  if (!nombre.trim()) errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errores.push({ campo: 'email', mensaje: 'El correo no es válido' });
  if (password.length < 8) errores.push({ campo: 'password', mensaje: 'La contraseña debe tener al menos 8 caracteres' });
  if (telefono && !/^\d{7,10}$/.test(telefono)) errores.push({ campo: 'telefono', mensaje: 'El teléfono debe tener entre 7 y 10 dígitos' });
  return errores;
};

// Mismas reglas que la API (cancha.validator.js), para avisar antes de enviar
export const validarCancha = ({ nombre, deporte, precioHora, capacidad, ubicacion }) => {
  const errores = [];
  if (!nombre.trim()) errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio' });
  if (!deporte) errores.push({ campo: 'deporte', mensaje: 'Elige un deporte' });
  if (precioHora === '' || Number(precioHora) < 0) errores.push({ campo: 'precioHora', mensaje: 'El precio por hora debe ser 0 o mayor' });
  if (!Number.isInteger(Number(capacidad)) || Number(capacidad) < 2) errores.push({ campo: 'capacidad', mensaje: 'La capacidad debe ser un número entero de 2 o más' });
  if (!ubicacion.trim()) errores.push({ campo: 'ubicacion', mensaje: 'La ubicación es obligatoria' });
  return errores;
};
