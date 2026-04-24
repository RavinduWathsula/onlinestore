function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function heroArt(theme = 'cyan') {
  const accent = theme === 'violet' ? '#8b5cf6' : '#22d3ee';
  const glow = theme === 'violet' ? 'rgba(139,92,246,0.35)' : 'rgba(34,211,238,0.35)';

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#06111b" />
          <stop offset="55%" stop-color="#0f2233" />
          <stop offset="100%" stop-color="#04070c" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${glow}" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#39d5ee" />
          <stop offset="100%" stop-color="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="530" cy="420" r="360" fill="url(#glow)"/>
      <g opacity="0.6">
        <circle cx="520" cy="420" r="265" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="2"/>
        <circle cx="520" cy="420" r="215" fill="none" stroke="${accent}" stroke-opacity="0.16" stroke-width="4"/>
        <circle cx="520" cy="420" r="150" fill="none" stroke="${accent}" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="12 16"/>
        <path d="M170 480H780" stroke="${accent}" stroke-opacity="0.12" stroke-width="2"/>
        <path d="M220 360H760" stroke="${accent}" stroke-opacity="0.12" stroke-width="2"/>
        <path d="M260 555H720" stroke="${accent}" stroke-opacity="0.12" stroke-width="2"/>
      </g>
      <g transform="translate(240 175)">
        <path d="M210 115c-56 0-102 43-109 98l-23 162c-8 58 36 111 94 111h106c58 0 102-53 94-111l-23-162c-7-55-53-98-109-98h-30z" fill="#0b1726" stroke="#79e6ff" stroke-opacity="0.16"/>
        <path d="M115 245c52 1 83-28 95-68 10 38 39 66 88 68" fill="none" stroke="#79e6ff" stroke-opacity="0.22" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="210" cy="198" rx="66" ry="72" fill="#ddb38c"/>
        <path d="M153 183c18-37 43-56 57-56 13 0 39 14 59 54" fill="none" stroke="#6b3f22" stroke-width="40" stroke-linecap="round"/>
        <path d="M145 191c18-40 54-71 92-71 40 0 75 23 93 68" fill="none" stroke="#8b5a2b" stroke-width="18" stroke-linecap="round" opacity="0.8"/>
        <circle cx="180" cy="198" r="11" fill="#0b1726"/>
        <circle cx="240" cy="198" r="11" fill="#0b1726"/>
        <path d="M181 233c18 14 39 14 59 0" fill="none" stroke="#7a4b31" stroke-width="8" stroke-linecap="round"/>
        <path d="M145 404c8-88 26-135 65-155 13-6 26-9 42-9 15 0 29 3 41 9 40 20 58 66 66 155" fill="#133646"/>
        <path d="M112 570c8-72 36-121 87-147 6-3 14-5 22-7l-16 164z" fill="#0f3346"/>
        <path d="M308 416c47 20 73 68 81 154l-87 10z" fill="#0f3346"/>
        <path d="M108 438l21 144 81 108 58-42-42-133z" fill="#0d2535"/>
        <path d="M321 435l-24 148-79 107-59-39 42-135z" fill="#0d2535"/>
        <path d="M110 347c38-56 86-83 145-83 63 0 115 27 154 86" fill="none" stroke="#0ea5e9" stroke-opacity="0.15" stroke-width="18" stroke-linecap="round"/>
      </g>
      <g opacity="0.8">
        <circle cx="1210" cy="180" r="10" fill="#79e6ff"/>
        <circle cx="1300" cy="590" r="8" fill="#7c3aed"/>
        <circle cx="1430" cy="250" r="5" fill="#22d3ee"/>
        <circle cx="1360" cy="750" r="4" fill="#f472b6"/>
      </g>
      <path d="M960 750c118-120 194-160 356-172" stroke="#79e6ff" stroke-opacity="0.18" stroke-width="3" fill="none" stroke-dasharray="8 14"/>
      <path d="M980 280c146 18 256 86 360 176" stroke="#8b5cf6" stroke-opacity="0.16" stroke-width="3" fill="none" stroke-dasharray="8 14"/>
      <rect x="0" y="0" width="1600" height="900" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>
    </svg>
  `);
}

export function circuitArt() {
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(34,211,238,0.35)"/>
          <stop offset="100%" stop-color="rgba(8,10,18,0.95)"/>
        </radialGradient>
      </defs>
      <rect width="900" height="900" fill="#071018"/>
      <rect width="900" height="900" fill="url(#g)"/>
      <g stroke="#36d6ff" stroke-opacity="0.22" stroke-width="6" fill="none">
        <path d="M120 130h260v100h150v-70h150v180h-90"/>
        <path d="M90 390h210v-80h120v160h180v110h90"/>
        <path d="M130 690h180v-120h140v70h110v-140h150"/>
      </g>
      <g fill="#36d6ff" fill-opacity="0.9">
        <circle cx="120" cy="130" r="12"/>
        <circle cx="380" cy="230" r="12"/>
        <circle cx="650" cy="160" r="12"/>
        <circle cx="720" cy="390" r="12"/>
        <circle cx="300" cy="390" r="12"/>
        <circle cx="90" cy="390" r="12"/>
        <circle cx="680" cy="580" r="12"/>
        <circle cx="130" cy="690" r="12"/>
      </g>
    </svg>
  `);
}

export function orbArt() {
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="rgba(255,140,0,0.15)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
        <radialGradient id="orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="55%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </radialGradient>
      </defs>
      <rect width="900" height="900" fill="#06070d"/>
      <circle cx="450" cy="450" r="340" fill="url(#bg)"/>
      <circle cx="450" cy="450" r="210" fill="none" stroke="#f59e0b" stroke-opacity="0.22" stroke-width="8"/>
      <circle cx="450" cy="450" r="150" fill="none" stroke="#fb7185" stroke-opacity="0.18" stroke-width="6"/>
      <circle cx="450" cy="450" r="120" fill="url(#orb)" opacity="0.95"/>
      <path d="M220 520c100-160 360-240 480-80" fill="none" stroke="#22d3ee" stroke-opacity="0.18" stroke-width="10"/>
      <path d="M260 350c80 40 310 40 400-50" fill="none" stroke="#fb7185" stroke-opacity="0.16" stroke-width="8"/>
    </svg>
  `);
}

export function productArt(seed = '') {
  const input = String(seed);
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 3;
  }

  if (hash === 0) return heroArt('cyan');
  if (hash === 1) return circuitArt();
  return orbArt();
}
