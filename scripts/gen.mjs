// Gera os SVGs do README de perfil (banner, terminal, recibo do PDV e cards), em tema claro e escuro.
// Uso: node scripts/gen.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const THEMES = {
  dark: {
    bg1: '#0d1117', bg2: '#141a24', border: '#243040', grid: '#18212d',
    title: '#e6edf3', text: '#9aa7b6', muted: '#667385', accent: '#2fd4e8', accent2: '#7c83ff', chip: '#18212e', ok: '#6fe3a4',
  },
  light: {
    bg1: '#ffffff', bg2: '#f3f7fa', border: '#d6dee7', grid: '#e7edf3',
    title: '#0f1a26', text: '#475667', muted: '#8594a5', accent: '#0a97ad', accent2: '#4f56d6', chip: '#eaf1f5', ok: '#12935a',
  },
};

const FONT = `font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"`;
const MONO = `font-family="'JetBrains Mono', Consolas, 'SFMono-Regular', Menlo, monospace"`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function banner(t) {
  const W = 1200, H = 300;
  let grid = '';
  for (let x = 0; x <= W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.84" cy="0.35" r="0.55">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="0.15"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
    <clipPath id="r"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  </defs>
  <style>
    .cursor { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    .scan { animation: scan 6s ease-in-out infinite; }
    @keyframes scan { 0% { transform: translateX(-420px); } 100% { transform: translateX(${W}px); } }
    @media (prefers-reduced-motion: reduce) { .cursor, .scan { animation: none; } }
  </style>
  <g clip-path="url(#r)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g stroke="${t.grid}" stroke-width="1" mask="url(#m)">${grid}</g>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect class="scan" x="0" y="${H - 2}" width="420" height="2" fill="${t.accent}" opacity="0.6"/>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.border}"/>
  </g>
  <text x="72" y="92" ${MONO} font-size="18" fill="${t.accent}">~/guilherme-lourenco<tspan fill="${t.muted}"> $ whoami</tspan><tspan class="cursor" fill="${t.accent}"> ▍</tspan></text>
  <text x="70" y="160" ${FONT} font-size="58" font-weight="700" fill="${t.title}" letter-spacing="-1">Guilherme Lourenço</text>
  <text x="72" y="200" ${FONT} font-size="22" fill="${t.text}">Engenheiro de Software <tspan fill="${t.muted}">·</tspan> Criador do Ordik <tspan fill="${t.muted}">·</tspan> Goiânia, GO</text>
  <text x="72" y="242" ${FONT} font-size="17" fill="${t.muted}">Sistema de gestão, PDV e site para quem vende todos os dias.</text>
  <g transform="translate(900 70)" ${MONO} font-size="14" fill="${t.muted}">
    <text x="0" y="0"><tspan fill="${t.accent}">const</tspan> <tspan fill="${t.title}">stack</tspan> = [</text>
    <text x="20" y="26">'Java', 'Spring Boot',</text>
    <text x="20" y="50">'Angular', 'Next.js',</text>
    <text x="20" y="74">'Electron', 'PostgreSQL',</text>
    <text x="0" y="98">];</text>
  </g>
</svg>
`;
}

function chips(t, tags, x0, y) {
  let x = x0, out = '';
  for (const c of tags) {
    const w = c.length * 7.2 + 20;
    out += `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" fill="${t.chip}" stroke="${t.border}"/><text x="${x + w / 2}" y="${y + 16}" text-anchor="middle" ${FONT} font-size="12" fill="${t.text}">${esc(c)}</text>`;
    x += w + 8;
  }
  return out;
}

function card(t, p) {
  const W = 420, H = 150;
  const lines = p.desc.map((l, i) => `<text x="24" y="${72 + i * 20}" ${FONT} font-size="14" fill="${t.text}">${esc(l)}</text>`).join('');
  const right = p.owner ? `<text x="${W - 24}" y="40" text-anchor="end" ${FONT} font-size="12" fill="${t.muted}">${esc(p.owner)}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.bg2}" stroke="${t.border}"/>
  <rect x="24" y="26" width="4" height="18" rx="2" fill="${t.accent}"/>
  <text x="38" y="41" ${FONT} font-size="17" font-weight="600" fill="${t.title}">${esc(p.name)}</text>
  ${right}
  ${lines}
  ${chips(t, p.tags, 24, 106)}
</svg>
`;
}

// Card largo do projeto principal, com os três módulos do Ordik.
function ordik(t) {
  const W = 860, H = 250;
  const mods = [
    ['Sistema de Gestão', ['Cadastros, estoque, financeiro', 'e relatórios em um só painel.']],
    ['PDV', ['Frente de caixa rápida: vender,', 'receber e fechar o caixa.']],
    ['Site', ['Página do produto para apresentar', 'o Ordik e captar novos clientes.']],
  ];
  const mw = 256, gap = 18, x0 = 24;
  const boxes = mods.map(([name, desc], i) => {
    const x = x0 + i * (mw + gap);
    return `<g class="m m${i}">
    <rect x="${x}" y="98" width="${mw}" height="126" rx="10" fill="${t.bg1}" stroke="${t.border}"/>
    <rect x="${x + 18}" y="118" width="8" height="8" rx="2" fill="${i === 1 ? t.accent2 : t.accent}"/>
    <text x="${x + 34}" y="127" ${FONT} font-size="15" font-weight="600" fill="${t.title}">${esc(name)}</text>
    ${desc.map((l, j) => `<text x="${x + 18}" y="${158 + j * 20}" ${FONT} font-size="13" fill="${t.text}">${esc(l)}</text>`).join('')}
  </g>`;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    .m { animation: up 5s ease-in-out infinite; }
    .m1 { animation-delay: .4s; } .m2 { animation-delay: .8s; }
    @keyframes up { 0%, 60%, 100% { transform: translateY(0); } 15% { transform: translateY(-4px); } }
    .dot { animation: pulse 1.8s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .3; } }
    @media (prefers-reduced-motion: reduce) { .m, .dot { animation: none; } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${t.bg2}" stroke="${t.border}"/>
  <text x="24" y="44" ${MONO} font-size="13" fill="${t.accent}">projeto principal</text>
  <text x="24" y="78" ${FONT} font-size="30" font-weight="700" fill="${t.title}" letter-spacing="2">ORDIK</text>
  <text x="138" y="77" ${FONT} font-size="15" fill="${t.text}">Sistema · PDV · Site</text>
  <circle class="dot" cx="${W - 150}" cy="40" r="5" fill="${t.ok}"/>
  <text x="${W - 138}" y="45" ${FONT} font-size="13" fill="${t.muted}">em desenvolvimento</text>
  <text x="${W - 24}" y="78" text-anchor="end" ${FONT} font-size="12" fill="${t.muted}">código privado</text>
  ${boxes}
</svg>
`;
}

const PROJECTS = [
  { file: 'sebras', name: 'sebras',
    desc: ['Aplicação web Java com JSP e Servlets,', 'banco Oracle e ambiente em Docker.'],
    tags: ['Java', 'JSP', 'Oracle', 'Docker'] },
  { file: 'produtosapi', name: 'produtosApi',
    desc: ['API REST de produtos com camadas', 'bem separadas e banco em memória.'],
    tags: ['Spring Boot', 'JPA', 'H2', 'Lombok'] },
  { file: 'electron-intranet', name: 'electron-intranet', owner: 'desenvolvimento-biglar',
    desc: ['App desktop de intranet que conversa', 'com impressoras, câmeras e USB.'],
    tags: ['Electron', 'TypeScript', 'Socket.io'] },
  { file: 'radar-goias', name: 'Radar-Goias', owner: 'Gabrieldiog',
    desc: ['Cruza dados públicos de Goiás e calcula', 'indicadores que não existem prontos.'],
    tags: ['Python', 'Next.js', 'React'] },
];

// Terminal animado ao lado do "Sobre mim".
function terminal() {
  const t = THEMES.dark;
  const lines = [
    ['$ ', 'whoami', t.title],
    ['> ', 'guilherme-lourenco', t.text],
    ['$ ', 'cat foco.txt', t.title],
    ['> ', 'ordik: sistema + pdv + site', t.text],
    ['> ', 'back-end em java/spring', t.text],
    ['> ', 'front em angular e next', t.text],
    ['$ ', 'mvn package && deploy', t.title],
    ['✓ ', 'no ar', t.ok],
  ];
  const step = 0.7, total = lines.length * step + 2.5;
  const rows = lines.map(([p, s, c], i) => {
    const on = ((i * step) / total * 100).toFixed(1);
    return `<text class="l" style="animation-name:l${i}" x="20" y="${72 + i * 26}" ${MONO} font-size="14"><tspan fill="${t.accent}">${esc(p)}</tspan><tspan fill="${c}">${esc(s)}</tspan></text>
    <style>@keyframes l${i} { 0%, ${on}% { opacity: 0; } ${(+on + 1).toFixed(1)}%, 96% { opacity: 1; } 100% { opacity: 0; } }</style>`;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <style>
    .l { opacity: 0; animation-duration: ${total}s; animation-iteration-count: infinite; animation-timing-function: steps(1); }
    @media (prefers-reduced-motion: reduce) { .l { animation: none; opacity: 1; } }
  </style>
  <rect x="0.5" y="0.5" width="299" height="299" rx="14" fill="${t.bg1}" stroke="${t.border}"/>
  <path d="M0.5 14.5a14 14 0 0 1 14-14h271a14 14 0 0 1 14 14V40H0.5z" fill="${t.bg2}"/>
  <line x1="0" y1="40" x2="300" y2="40" stroke="${t.border}"/>
  <circle cx="22" cy="20" r="5.5" fill="#ff5f57"/><circle cx="40" cy="20" r="5.5" fill="#febc2e"/><circle cx="58" cy="20" r="5.5" fill="#28c840"/>
  <text x="150" y="25" text-anchor="middle" ${MONO} font-size="12" fill="${t.muted}">~/guilherme-lourenco</text>
  ${rows}
</svg>
`;
}

// Cupom do PDV sendo impresso, ao lado do "Além do código".
function receipt() {
  const t = THEMES.dark;
  const items = [['Café', '4,50'], ['Pão de queijo', '6,00'], ['Suco', '7,90']];
  const rows = items.map(([n, v], i) => `<text x="62" y="${96 + i * 18}" ${MONO} font-size="11" fill="#3b4655">${esc(n)}</text><text x="138" y="${96 + i * 18}" text-anchor="end" ${MONO} font-size="11" fill="#3b4655">${v}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <style>
    .paper { animation: print 4s ease-out infinite; }
    @keyframes print { 0% { transform: translateY(-110px); } 55%, 90% { transform: translateY(0); } 100% { transform: translateY(0); opacity: 0; } }
    .led { animation: led 1s steps(1) infinite; }
    @keyframes led { 50% { opacity: .25; } }
    @media (prefers-reduced-motion: reduce) { .paper, .led { animation: none; } }
  </style>
  <rect x="0.5" y="0.5" width="199" height="199" rx="14" fill="${t.bg1}" stroke="${t.border}"/>
  <clipPath id="c"><rect x="0" y="52" width="200" height="140"/></clipPath>
  <g clip-path="url(#c)"><g class="paper">
    <path d="M54 52h92v108l-7.7 6-7.6-6-7.7 6-7.7-6-7.6 6-7.7-6-7.7 6-7.7-6-7.6 6-7.7-6z" fill="#e8edf2"/>
    <text x="100" y="72" text-anchor="middle" ${MONO} font-size="11" font-weight="700" fill="#1a2330">ORDIK PDV</text>
    <line x1="62" y1="80" x2="138" y2="80" stroke="#9aa7b6" stroke-dasharray="3 2"/>
    ${rows}
    <line x1="62" y1="140" x2="138" y2="140" stroke="#9aa7b6" stroke-dasharray="3 2"/>
    <text x="62" y="154" ${MONO} font-size="11" font-weight="700" fill="#1a2330">TOTAL</text>
    <text x="138" y="154" text-anchor="end" ${MONO} font-size="11" font-weight="700" fill="#1a2330">18,40</text>
  </g></g>
  <rect x="36" y="36" width="128" height="20" rx="6" fill="${t.bg2}" stroke="${t.border}" stroke-width="2"/>
  <rect x="48" y="44" width="104" height="4" rx="2" fill="#05080c"/>
  <circle class="led" cx="156" cy="46" r="2.5" fill="${t.ok}"/>
</svg>
`;
}

writeFileSync(new URL('terminal.svg', OUT), terminal());
writeFileSync(new URL('receipt.svg', OUT), receipt());

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(new URL(`banner-${name}.svg`, OUT), banner(t));
  writeFileSync(new URL(`card-ordik-${name}.svg`, OUT), ordik(t));
  for (const p of PROJECTS) writeFileSync(new URL(`card-${p.file}-${name}.svg`, OUT), card(t, p));
}
console.log('ok');
