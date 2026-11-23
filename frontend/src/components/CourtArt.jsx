// Dibujo de la cancha según el deporte: líneas de cal sobre el color de cada superficie
const TRAZO = { fill: 'none', stroke: 'rgba(255,255,255,0.85)', strokeWidth: 1.6 };

const DIBUJOS = {
  futbol: (
    <>
      <rect x="8" y="8" width="184" height="94" {...TRAZO} />
      <line x1="100" y1="8" x2="100" y2="102" {...TRAZO} />
      <circle cx="100" cy="55" r="15" {...TRAZO} />
      <circle cx="100" cy="55" r="1.8" fill="#fff" />
      <rect x="8" y="30" width="26" height="50" {...TRAZO} />
      <rect x="166" y="30" width="26" height="50" {...TRAZO} />
      <rect x="8" y="43" width="10" height="24" {...TRAZO} />
      <rect x="182" y="43" width="10" height="24" {...TRAZO} />
    </>
  ),
  baloncesto: (
    <>
      <rect x="8" y="8" width="184" height="94" {...TRAZO} />
      <line x1="100" y1="8" x2="100" y2="102" {...TRAZO} />
      <circle cx="100" cy="55" r="12" {...TRAZO} />
      <rect x="8" y="38" width="34" height="34" {...TRAZO} />
      <rect x="158" y="38" width="34" height="34" {...TRAZO} />
      <path d="M8 16 H22 A42 42 0 0 1 22 94 H8" {...TRAZO} />
      <path d="M192 16 H178 A42 42 0 0 0 178 94 H192" {...TRAZO} />
    </>
  ),
  voleibol: (
    <>
      <rect x="22" y="14" width="156" height="82" {...TRAZO} />
      <line x1="100" y1="6" x2="100" y2="104" stroke="#fff" strokeWidth="3" />
      <line x1="74" y1="14" x2="74" y2="96" {...TRAZO} />
      <line x1="126" y1="14" x2="126" y2="96" {...TRAZO} />
    </>
  ),
  tenis: (
    <>
      <rect x="12" y="10" width="176" height="90" {...TRAZO} />
      <line x1="12" y1="22" x2="188" y2="22" {...TRAZO} />
      <line x1="12" y1="88" x2="188" y2="88" {...TRAZO} />
      <line x1="58" y1="22" x2="58" y2="88" {...TRAZO} />
      <line x1="142" y1="22" x2="142" y2="88" {...TRAZO} />
      <line x1="58" y1="55" x2="142" y2="55" {...TRAZO} />
      <line x1="100" y1="4" x2="100" y2="106" stroke="#fff" strokeWidth="3" />
    </>
  ),
};

export const tipoDeCancha = (deporte = '') => {
  if (deporte.startsWith('futbol')) return 'futbol';
  return DIBUJOS[deporte] ? deporte : 'futbol';
};

export default function CourtArt({ deporte, className = '', ajuste = 'meet' }) {
  const tipo = tipoDeCancha(deporte);
  return (
    <svg className={`court court-${tipo} ${className}`} viewBox="0 0 200 110" preserveAspectRatio={`xMidYMid ${ajuste}`} aria-hidden="true">
      {DIBUJOS[tipo]}
    </svg>
  );
}
