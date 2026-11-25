/**
 * Ejecuta la suite de regresión por capas y guarda el registro en docs/regresion/.
 *
 *   node scripts/regresion.js            suite COMPLETA (cierre de sprint, antes de un release)
 *   node scripts/regresion.js --humo     suite de HUMO (antes de cada push, en ~1 minuto)
 *
 * Requisitos: la API (npm run dev) y el frontend (npm run dev en frontend/) corriendo, con npm run seed.
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const HUMO = process.argv.includes('--humo');
const API = process.env.API_URL || 'http://localhost:3000/api';
const FRONT = process.env.BASE_URL || 'http://localhost:5173';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'regresion-'));

const ejecutar = (comando, cwd = RAIZ) => {
  const inicio = Date.now();
  const r = spawnSync(comando, { cwd, shell: true, stdio: 'inherit', env: process.env });
  return { ok: r.status === 0, segundos: Math.round((Date.now() - inicio) / 1000) };
};

const leerJest = (archivo) => {
  const j = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  return {
    total: j.numTotalTests - j.numPendingTests,
    pasaron: j.numPassedTests,
    fallaron: j.numFailedTests,
    fallidas: j.testResults.flatMap((s) => s.assertionResults.filter((a) => a.status === 'failed').map((a) => a.fullName)),
  };
};

const leerNewman = (archivo) => {
  const n = JSON.parse(fs.readFileSync(archivo, 'utf8')).run;
  return {
    total: n.stats.assertions.total,
    pasaron: n.stats.assertions.total - n.stats.assertions.failed,
    fallaron: n.stats.assertions.failed,
    fallidas: n.failures.map((f) => `${f.source.name}: ${f.error.test}`),
    detalle: `${new Set(n.executions.map((e) => e.item.id)).size} peticiones`,
  };
};

async function disponible(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

(async () => {
  if (!(await disponible(`${API}/health`)) || !(await disponible(FRONT))) {
    console.error(`\nLa API (${API}) y el frontend (${FRONT}) deben estar corriendo. Ejecuta npm run seed, npm run dev y, en frontend/, npm run dev.\n`);
    process.exit(1);
  }

  const capas = [
    {
      capa: 'Backend',
      suite: HUMO ? 'Jest: pruebas unitarias' : 'Jest: unitarias + integración (top-down, bottom-up, big bang)',
      comando: `npx cross-env NODE_ENV=test jest ${HUMO ? 'tests/unit' : '--runInBand'} --json --outputFile="${TMP}/backend.json"`,
      leer: () => leerJest(`${TMP}/backend.json`),
    },
    {
      capa: 'Frontend',
      suite: 'Jest + React Testing Library: componentes',
      cwd: path.join(RAIZ, 'frontend'),
      comando: `npx jest --json --outputFile="${TMP}/frontend.json"`,
      leer: () => leerJest(`${TMP}/frontend.json`),
    },
    {
      capa: 'API REST',
      suite: 'Postman / Newman (aserciones)',
      comando: `npx -y -p newman@6 newman run postman/CanchaYa.postman_collection.json -e postman/CanchaYa-local.postman_environment.json --env-var "baseUrl=${API}" -r cli,json --reporter-json-export "${TMP}/newman.json"`,
      leer: () => leerNewman(`${TMP}/newman.json`),
    },
    {
      capa: 'Interfaz (E2E)',
      suite: HUMO ? 'Selenium + POM: casos @humo' : 'Selenium + POM: suite completa',
      cwd: path.join(RAIZ, 'e2e'),
      comando: `npx jest --runInBand ${HUMO ? '-t @humo' : ''} --json --outputFile="${TMP}/e2e.json"`,
      leer: () => leerJest(`${TMP}/e2e.json`),
    },
  ];

  const resultados = [];
  for (const c of capas) {
    console.log(`\n=== ${c.capa}: ${c.suite} ===\n`);
    const { segundos } = ejecutar(c.comando, c.cwd);
    let r;
    try {
      r = c.leer();
    } catch {
      r = { total: 0, pasaron: 0, fallaron: 1, fallidas: ['No se pudo ejecutar la suite (revisa la salida de arriba)'] };
    }
    resultados.push({ ...c, ...r, segundos });
  }

  // ---------- Registro en Markdown ----------
  const git = (cmd) => {
    try {
      return execSync(`git ${cmd}`, { cwd: RAIZ }).toString().trim();
    } catch {
      return '¿?';
    }
  };
  const ahora = new Date();
  const fecha = ahora.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' });
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000); // hora local del equipo
  const sello = local.toISOString().slice(0, 16).replace('T', '_').replace(':', '');
  const total = resultados.reduce((s, r) => s + r.total, 0);
  const fallaron = resultados.reduce((s, r) => s + r.fallaron, 0);
  const aprobada = fallaron === 0;

  const filas = resultados
    .map((r) => `| ${r.capa} | ${r.suite}${r.detalle ? ` (${r.detalle})` : ''} | ${r.total} | ${r.pasaron} | ${r.fallaron} | ${r.segundos} s |`)
    .join('\n');
  const fallidas = resultados.flatMap((r) => r.fallidas.map((f) => `- **${r.capa}:** ${f}`));

  const md = `# Ejecución de regresión — ${HUMO ? 'suite de humo' : 'suite completa'}

| Dato | Valor |
|---|---|
| Fecha | ${fecha} |
| Rama | \`${git('rev-parse --abbrev-ref HEAD')}\` |
| Commit | \`${git('rev-parse --short HEAD')}\` — ${git('log -1 --pretty=%s')} |
| Equipo | ${os.type()} ${os.release()}, Node.js ${process.version} |
| Navegador E2E | ${process.env.BROWSER || 'chrome'}${process.env.HEADLESS === 'true' ? ' (headless)' : ''} |

## Resultado: ${aprobada ? '✅ APROBADA' : '❌ CON FALLOS'}

| Capa | Suite | Pruebas | Pasaron | Fallaron | Duración |
|---|---|---|---|---|---|
${filas}
| **Total** | | **${total}** | **${total - fallaron}** | **${fallaron}** | **${resultados.reduce((s, r) => s + r.segundos, 0)} s** |

${fallidas.length ? `## Casos fallidos\n\n${fallidas.join('\n')}\n\nCada fallo se analiza y, si es un defecto, se registra como Bug en Jira.\n` : 'No hubo casos fallidos.\n'}`;

  const archivo = path.join(RAIZ, 'docs', 'regresion', `ejecucion-${HUMO ? 'humo' : 'completa'}-${sello}.md`);
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, md);

  console.log(`\n${md}\nRegistro guardado en ${path.relative(RAIZ, archivo)}\n`);
  process.exit(aprobada ? 0 : 1);
})();
