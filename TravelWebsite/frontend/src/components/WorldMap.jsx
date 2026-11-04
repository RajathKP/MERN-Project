const SHAPES = {
  'North America': 'M28 44 L62 22 L118 18 L168 34 L176 62 L150 92 L136 112 L118 134 L98 118 L70 94 L40 74Z M190 14 L226 10 L234 34 L206 46Z',
  'South America': 'M122 142 L162 136 L188 160 L178 204 L152 238 L136 216 L124 176Z',
  Europe: 'M214 42 L258 30 L288 46 L276 72 L250 82 L224 76Z',
  Africa: 'M218 92 L272 86 L298 116 L288 162 L268 204 L246 198 L236 152 L214 122Z',
  Asia: 'M290 38 L352 26 L424 40 L434 82 L402 112 L372 132 L342 112 L312 106 L296 86 L292 62Z',
  Oceania: 'M372 172 L422 166 L438 196 L402 212 L372 202Z',
}
const FILL = {
  'North America': ['#8a6f5d', '#d5c3a8'], 'South America': ['#2f6b45', '#8ab05a'], Europe: ['#c79a3c', '#6b7f3a'],
  Africa: ['#e0a040', '#8a5a1f'], Asia: ['#b7843a', '#5c7a3a'], Oceania: ['#d9b26a', '#3f8a55'],
}
export default function WorldMap({ active, onActive, dark }) {
  return (
    <svg className="worldmap" viewBox="0 0 460 250" role="img" aria-label="World map of destinations">
      <defs>
        {Object.entries(FILL).map(([k, [a, b]]) => (
          <linearGradient key={k} id={`m-${k.replace(/ /g, '')}${dark ? 'd' : ''}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        ))}
      </defs>
      {Object.entries(SHAPES).map(([k, d]) => (
        <path key={k} d={d} className={`cont ${active === k ? 'on' : ''}`} fill={`url(#m-${k.replace(/ /g, '')}${dark ? 'd' : ''})`}
          strokeLinejoin="round" onMouseEnter={() => onActive(k)} onMouseLeave={() => onActive(null)} />
      ))}
    </svg>
  )
}
