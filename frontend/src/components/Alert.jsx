// Mensaje de error, éxito o información. role="alert" lo anuncia a lectores de pantalla.
export default function Alert({ tipo = 'error', id, children, detalles }) {
  if (!children) return null;
  return (
    <div id={id} className={`alerta alerta-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <p>{children}</p>
      {detalles?.length > 0 && (
        <ul>
          {detalles.map((d) => (
            <li key={`${d.campo}-${d.mensaje}`}>{d.mensaje}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
