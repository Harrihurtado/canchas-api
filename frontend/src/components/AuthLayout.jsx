import CourtArt from './CourtArt';

// Pantallas de acceso: a la izquierda la cancha dibujada, a la derecha el formulario
export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <main className="auth">
      <aside className="auth-cancha">
        <CourtArt deporte="futbol5" className="auth-court" />
        <div className="auth-mensaje">
          <p className="auth-lema">Tu cancha, a la hora que quieras.</p>
          <p>Fútbol, voleibol y baloncesto en un solo lugar. Elige la franja, confirma y a jugar.</p>
        </div>
      </aside>
      <section className="auth-panel">
        <p className="auth-marca">CanchaYa</p>
        <h1>{titulo}</h1>
        <p className="subtitulo">{subtitulo}</p>
        {children}
      </section>
    </main>
  );
}
