import { useId, useState } from 'react'

// Original illustrated "photos". Each scene = sky gradient + sun + layered land + a motif.
const P = {
  paris:    { sky: ['#5aa6e6', '#f6e7cf'], sun: ['#fff7d6', 300, 70, 26], ground: '#6c8f4e', water: '#7fb6d6', motif: 'tower' },
  dubai:    { sky: ['#0a1230', '#35477d'], sun: null, ground: '#0c1a3a', water: '#0f8a9d', motif: 'skyline' },
  istanbul: { sky: ['#6eb4ee', '#d9ecfa'], sun: ['#fffbe8', 80, 60, 20], ground: '#4d7a45', water: '#5a98c9', motif: 'mosque' },
  london:   { sky: ['#f7d774', '#fff2c4'], sun: ['#fffdf0', 120, 110, 40], ground: '#4a4551', water: null, motif: 'street' },
  vienna:   { sky: ['#68a9e8', '#f3f0e6'], sun: null, ground: '#5f9a3d', water: '#8cc2e0', motif: 'palace' },
  scotland: { sky: ['#4fa3e8', '#d8efff'], sun: ['#fff', 330, 50, 18], ground: '#3d8a50', water: '#48a5c7', motif: 'castle' },
  italy:    { sky: ['#5db4ee', '#cfe9f8'], sun: ['#fff9db', 310, 55, 22], ground: '#cf8a55', water: '#1a8fc4', motif: 'coast' },
  africa:   { sky: ['#e8894a', '#ffd78a'], sun: ['#fff2c2', 200, 150, 46], ground: '#6a5a22', water: null, motif: 'savanna' },
  sea:      { sky: ['#8ed0f0', '#e6f6fb'], sun: ['#fff', 90, 50, 24], ground: '#6c6a62', water: '#18b4a6', motif: 'cove' },
  ice:      { sky: ['#1b2630', '#3b5568'], sun: null, ground: '#10161c', water: null, motif: 'cave' },
  park:     { sky: ['#d98a3d', '#f6cf7a'], sun: ['#fff1b8', 250, 90, 30], ground: '#8c7326', water: null, motif: 'hills' },
  adult:    { sky: ['#97bfe0', '#e8e2c3'], sun: null, ground: '#5a7a2d', water: null, motif: 'trail' },
  newyork:  { sky: ['#ff9a6b', '#ffd9a6'], sun: ['#fff4cf', 200, 130, 36], ground: '#26304a', water: '#35557f', motif: 'skyline2' },
  tokyo:    { sky: ['#f6a8c0', '#fde6e0'], sun: ['#fff', 320, 70, 28], ground: '#394861', water: null, motif: 'pagoda' },
  rio:      { sky: ['#3fa7ea', '#bfe8ff'], sun: ['#fff6c8', 80, 55, 24], ground: '#2f8f4f', water: '#1b8ec7', motif: 'mountain' },
  bali:     { sky: ['#f9b872', '#fde6b4'], sun: ['#fff6d8', 200, 120, 34], ground: '#2e8a4d', water: '#16a3a6', motif: 'terrace' },
  cairo:    { sky: ['#f5b25f', '#fde3a5'], sun: ['#fff2c8', 300, 80, 28], ground: '#d9a85c', water: null, motif: 'pyramids' },
  trail:    { sky: ['#97bfe0', '#e8e2c3'], sun: null, ground: '#5a7a2d', water: null, motif: 'trail' },
  savanna:  { sky: ['#e8894a', '#ffd78a'], sun: ['#fff2c2', 200, 150, 46], ground: '#6a5a22', water: null, motif: 'savanna' },
  mountain: { sky: ['#5aa6df', '#dff0fa'], sun: ['#fff', 90, 50, 22], ground: '#2f6b4a', water: '#2fb3c4', motif: 'mountain' },
  hills:    { sky: ['#d98a3d', '#f6cf7a'], sun: ['#fff1b8', 250, 90, 30], ground: '#8c7326', water: null, motif: 'hills' },
  banff:    { sky: ['#5aa6df', '#dff0fa'], sun: null, ground: '#2f6b4a', water: '#2fb3c4', motif: 'mountain' },
}

function Windows({ x, y, w, h, on = '#ffd66b', gap = 8 }) {
  const out = []
  for (let r = 0; r < Math.floor(h / gap) - 1; r++)
    for (let c = 0; c < Math.floor(w / gap) - 1; c++)
      if ((r * 7 + c * 13 + x) % 5 > 1) out.push(<rect key={r + '-' + c} x={x + 3 + c * gap} y={y + 5 + r * gap} width="3" height="4" fill={on} opacity=".85" />)
  return <>{out}</>
}

function Motif({ kind, p }) {
  switch (kind) {
    case 'tower':
      return (<>
        <path d="M0 230 Q100 210 200 225 T400 220 V280 H0Z" fill="#6ea05a" />
        <rect y="238" width="400" height="42" fill={p.water} opacity=".9" />
        <path d="M200 40 L209 120 L222 205 L236 232 H164 L178 205 L191 120Z" fill="#4a4a50" />
        <path d="M178 205 Q200 185 222 205" stroke="#cfc6b4" strokeWidth="5" fill="none" />
        <path d="M191 120 H209 M184 160 H216" stroke="#cfc6b4" strokeWidth="3" />
        <path d="M0 232 Q60 200 120 230 T240 228 T400 226 V250 H0Z" fill="#3f7a3a" />
        <circle cx="120" cy="215" r="22" fill="#4c8a40" /><circle cx="285" cy="212" r="26" fill="#4c8a40" />
        <path d="M60 262 q10 -30 20 0z M95 262 q8 -26 16 0z" fill="#d94a4a" />
        <circle cx="70" cy="238" r="5" fill="#f2c9a6" /><circle cx="102" cy="240" r="5" fill="#f2c9a6" />
      </>)
    case 'skyline':
      return (<>
        <rect y="200" width="400" height="80" fill={p.water} />
        <path d="M0 215 H400 V280 H0Z" fill="url(#glow)" opacity=".6" />
        {[[20,130,36],[60,160,28],[92,110,30],[130,170,26],[160,90,34],[212,60,40],[262,140,30],[298,120,36],[340,165,30]].map(([x,y,w],i)=>(
          <g key={i}><rect x={x} y={y} width={w} height={205-y} fill="#17234a" /><Windows x={x} y={y} w={w} h={205-y} /></g>))}
        <path d="M212 60 l12 -22 l12 22z" fill="#17234a" />
        <path d="M0 215 H400" stroke="#ff9b3d" strokeWidth="3" opacity=".7" />
        <path d="M30 230 H370 M60 246 H340 M90 262 H300" stroke="#ff9b3d" strokeWidth="2" opacity=".35" />
      </>)
    case 'mosque':
      return (<>
        <rect y="215" width="400" height="65" fill={p.water} />
        <path d="M0 245 Q100 205 200 240 T400 232 V280 H0Z" fill="#3f6e3a" />
        <path d="M130 215 Q200 120 270 215Z" fill="#cfd8e2" />
        <path d="M165 215 Q200 165 235 215Z" fill="#b8c4d2" />
        <rect x="125" y="215" width="150" height="20" fill="#e3e8ee" />
        {[70,100,300,330].map((x,i)=>(<g key={i}><rect x={x} y={i%3===0?95:110} width="7" height={140-(i%3===0?95:110)+90} fill="#e3e8ee" /><path d={`M${x-2} ${i%3===0?95:110} l5.5 -26 l5.5 26z`} fill="#8e9db0" /></g>))}
        <circle cx="200" cy="146" r="4" fill="#e3e8ee" />
        <rect x="199" y="120" width="2" height="22" fill="#e3e8ee" />
      </>)
    case 'street':
      return (<>
        <path d="M0 280 V150 L70 120 V280Z" fill="#3a3340" /><path d="M400 280 V110 L300 100 V280Z" fill="#2d2832" />
        <Windows x={300} y={100} w={100} h={170} on="#f4c860" gap={14} />
        <path d="M150 280 L190 160 H215 L270 280Z" fill="#7b6d63" />
        <path d="M198 280 L203 170" stroke="#f3d27a" strokeWidth="3" strokeDasharray="10 8" />
        <rect x="235" y="196" width="46" height="34" rx="3" fill="#cc2f2f" /><rect x="239" y="200" width="38" height="10" fill="#f7e2b0" opacity=".8" />
        <circle cx="248" cy="232" r="5" fill="#222" /><circle cx="270" cy="232" r="5" fill="#222" />
        <path d="M150 140 l20 -22 l20 22z" fill="#8a7e74" /><rect x="152" y="140" width="36" height="30" fill="#8a7e74" />
        <rect x="320" y="206" width="9" height="30" rx="4" fill="#15131a" />
      </>)
    case 'palace':
      return (<>
        <path d="M0 200 H400 V280 H0Z" fill="#69a846" />
        <rect x="90" y="140" width="220" height="48" fill="#efe6cf" /><rect x="170" y="108" width="60" height="80" fill="#efe6cf" />
        <path d="M170 108 Q200 70 230 108Z" fill="#6fa38c" /><path d="M90 140 l20 -14 h20 l20 14z M250 140 l20 -14 h20 l20 14z" fill="#6fa38c" />
        <Windows x={90} y={140} w={220} h={48} on="#7a8aa0" gap={10} />
        <path d="M120 280 Q130 230 150 210 H250 Q270 230 280 280Z" fill="#9fd0e8" />
        <path d="M200 210 V170 M180 210 Q180 175 160 170 M220 210 Q220 175 240 170" stroke="#fff" strokeWidth="4" fill="none" opacity=".9" />
        <path d="M110 225 Q125 175 108 165 M290 225 Q275 175 292 165" stroke="#fff" strokeWidth="3" fill="none" opacity=".8" />
        <circle cx="40" cy="190" r="30" fill="#e07b3f" opacity=".9" /><circle cx="360" cy="188" r="32" fill="#d96a35" opacity=".9" />
      </>)
    case 'castle':
      return (<>
        <path d="M0 200 Q80 170 160 200 T400 190 V280 H0Z" fill="#3d8a50" />
        <rect y="238" width="400" height="42" fill={p.water} />
        <rect x="140" y="130" width="120" height="72" fill="#f0d6c8" />
        {[[130,90],[180,70],[225,90]].map(([x,y],i)=>(<g key={i}><rect x={x} y={y+20} width="30" height={110-(y-90)} fill="#f4dccd" /><path d={`M${x-4} ${y+20} L${x+15} ${y-20} L${x+34} ${y+20}Z`} fill="#d95b5b" /></g>))}
        <path d="M130 130 h140" stroke="#d8b9a8" strokeWidth="3" />
        <path d="M0 250 q60 -30 90 -10 t90 6 V260 H0Z" fill="#2b6b3d" />
        <path d="M290 190 l18 -50 l18 50z M318 190 l18 -64 l18 64z M344 190 l14 -38 l14 38z" fill="#2c7a40" />
        <path d="M0 205 H400" stroke="#c96a4a" strokeWidth="0" />
        <path d="M60 270 q25 -30 55 0" stroke="#c8503a" strokeWidth="7" fill="none" />
        <rect x="20" y="215" width="70" height="10" fill="#d85a46" />
      </>)
    case 'coast':
      return (<>
        <path d="M0 140 L70 70 L140 120 L200 60 L260 125 L320 80 L400 130 V280 H0Z" fill="#6d93a8" opacity=".75" />
        <rect y="150" width="400" height="130" fill={p.water} />
        <path d="M0 180 Q120 160 230 200 T400 270 V280 H0Z" fill="#e9d6b8" />
        {[[20,150],[58,162],[96,170],[134,182],[172,194]].map(([x,y],i)=>(<g key={i}><rect x={x} y={y} width="30" height="26" fill={['#e6924f','#f2b36b','#d9784b','#f0c488','#e08a55'][i]} /><path d={`M${x-3} ${y} L${x+15} ${y-12} L${x+33} ${y}Z`} fill="#b5532f" /></g>))}
        <ellipse cx="290" cy="210" rx="26" ry="8" fill="#fff" /><path d="M280 205 h22 l-4 -12 h-14z" fill="#f4f4f4" />
        <path d="M250 240 q40 -8 80 0" stroke="#ffffff" strokeWidth="2" opacity=".5" fill="none" />
      </>)
    case 'savanna':
      return (<>
        <path d="M0 190 Q100 170 200 190 T400 185 V280 H0Z" fill="#7a6528" />
        <path d="M0 225 Q120 205 220 228 T400 220 V280 H0Z" fill="#9a7f2e" />
        {[[70,120],[310,100]].map(([x,y],i)=>(<g key={i}><path d={`M${x} ${y+90} V${y+30}`} stroke="#2b1d0e" strokeWidth="6" /><ellipse cx={x} cy={y+22} rx="58" ry="16" fill="#3f4b1e" /><ellipse cx={x-22} cy={y+34} rx="30" ry="9" fill="#4d5c25" /></g>))}
        <path d="M160 238 l6 -30 l6 30z M190 240 l5 -22 l5 22z" fill="#2b1d0e" /><circle cx="166" cy="206" r="6" fill="#2b1d0e" /><circle cx="195" cy="217" r="5" fill="#2b1d0e" />
        <path d="M0 262 q30 -16 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#5a4a1a" strokeWidth="6" fill="none" />
      </>)
    case 'cove':
      return (<>
        <rect y="150" width="400" height="130" fill={p.water} />
        <path d="M0 150 H400" stroke="#cdeef0" strokeWidth="3" opacity=".6" />
        <path d="M0 280 V40 Q60 20 110 60 L140 150 Q90 190 70 280Z" fill="#6a6860" />
        <path d="M30 60 Q70 50 100 80 L120 140 Q80 120 40 150Z" fill="#8a8678" opacity=".7" />
        <path d="M400 280 V190 Q340 175 300 210 Q330 250 400 270Z" fill="#7d7a70" />
        <path d="M190 215 l60 -12 l22 -10 l6 12 l-20 22 h-70z" fill="#f2f2f2" /><rect x="228" y="188" width="22" height="14" fill="#fff" /><path d="M190 215 h86" stroke="#2d7aa8" strokeWidth="4" />
        <path d="M150 222 q50 8 130 -6" stroke="#fff" strokeWidth="3" opacity=".7" fill="none" />
      </>)
    case 'cave':
      return (<>
        <path d="M0 0 H400 V280 H0Z" fill="#0c1218" />
        <path d="M120 280 Q110 150 200 130 Q290 150 280 280Z" fill="#8fb4cc" opacity=".35" />
        <path d="M0 280 V30 Q80 60 100 140 Q110 200 90 280Z M400 280 V20 Q330 70 310 140 Q300 210 320 280Z" fill="#1b232b" />
        <path d="M0 0 H400 V50 Q300 90 200 60 Q100 90 0 50Z" fill="#212c35" />
        <path d="M170 280 L195 200 H215 L235 280Z" fill="#c9d8e2" opacity=".4" />
        <rect x="190" y="160" width="18" height="38" rx="6" fill="#e0452f" /><circle cx="199" cy="150" r="8" fill="#2a2f35" />
      </>)
    case 'hills':
      return (<>
        <path d="M0 210 Q60 110 140 160 T260 120 T400 190 V280 H0Z" fill="#a98b2c" />
        <path d="M0 240 Q100 160 190 215 T400 215 V280 H0Z" fill="#7c6420" />
        <path d="M0 260 Q120 210 240 255 T400 250 V280 H0Z" fill="#4e4113" />
        <path d="M200 160 q20 -10 40 0" stroke="#fff" strokeWidth="0" />
      </>)
    case 'trail':
      return (<>
        <path d="M0 170 Q100 120 200 160 T400 140 V280 H0Z" fill="#4f7a2c" />
        <path d="M0 215 Q140 170 260 215 T400 205 V280 H0Z" fill="#6e9a3a" />
        <path d="M150 280 Q190 230 220 215 T290 190" stroke="#d9c58d" strokeWidth="10" fill="none" />
        <rect x="205" y="168" width="8" height="26" rx="3" fill="#2d6aa8" /><circle cx="209" cy="162" r="6" fill="#f2c9a6" />
        <rect x="226" y="176" width="8" height="24" rx="3" fill="#cc4a3a" /><circle cx="230" cy="170" r="6" fill="#f2c9a6" />
      </>)
    case 'skyline2':
      return (<>
        <rect y="215" width="400" height="65" fill={p.water} />
        {[[30,120,34],[70,90,30],[106,150,26],[140,70,36],[185,110,32],[225,40,26],[256,100,34],[296,130,30],[332,85,36]].map(([x,y,w],i)=>(<g key={i}><rect x={x} y={y} width={w} height={215-y} fill="#26304a" /><Windows x={x} y={y} w={w} h={215-y} on="#ffcf7a" /></g>))}
        <path d="M225 40 l13 -26 l13 26z" fill="#26304a" /><path d="M0 232 H400 M40 250 H360" stroke="#ffb36b" strokeWidth="2" opacity=".35" />
      </>)
    case 'pagoda':
      return (<>
        <path d="M0 220 Q100 190 200 215 T400 205 V280 H0Z" fill="#4f6a52" />
        {[0,1,2,3,4].map(i=>(<g key={i}><rect x={170+i*3} y={80+i*30} width={60-i*6} height="22" fill="#a33c3c" /><path d={`M${150+i*3} ${104+i*30} Q200 ${86+i*30} ${250-i*3} ${104+i*30} L${244-i*3} ${110+i*30} H${156+i*3}Z`} fill="#2d2f3a" /></g>))}
        <rect x="198" y="40" width="4" height="40" fill="#2d2f3a" />
        <circle cx="60" cy="185" r="28" fill="#f7b6cd" /><circle cx="85" cy="200" r="22" fill="#f4a3c1" /><circle cx="335" cy="190" r="30" fill="#f7b6cd" /><circle cx="310" cy="205" r="22" fill="#f4a3c1" />
        <rect x="56" y="200" width="6" height="40" fill="#5a3b2d" /><rect x="332" y="205" width="6" height="40" fill="#5a3b2d" />
      </>)
    case 'mountain':
      return (<>
        <path d="M0 230 L70 120 L110 160 L170 80 L250 190 L300 140 L400 220 V280 H0Z" fill="#4c7d5a" />
        <path d="M170 80 L148 118 L168 108 L180 124 L192 106Z" fill="#fff" opacity=".85" />
        <rect y="225" width="400" height="55" fill={p.water} />
        <path d="M0 232 q50 -12 100 0 t100 0 t100 0 t100 0" stroke="#fff" strokeWidth="2" opacity=".5" fill="none" />
        <path d="M0 245 Q100 215 200 240 T400 230 V280 H0Z" fill="#2a6a42" opacity=".9" />
      </>)
    case 'terrace':
      return (<>
        <path d="M0 140 Q100 90 200 130 T400 110 V280 H0Z" fill="#3f9a56" />
        {[150,176,202,228,254].map((y,i)=>(<path key={i} d={`M0 ${y} Q100 ${y-30} 200 ${y-6} T400 ${y-14}`} stroke={i%2?'#7fd18a':'#256f3d'} strokeWidth="12" fill="none" opacity=".85" />))}
        <path d="M300 140 V80 M300 90 q-30 -16 -50 4 M300 90 q30 -16 50 4 M300 100 q-26 -4 -44 18 M300 100 q26 -4 44 18" stroke="#1c5a2e" strokeWidth="5" fill="none" />
        <rect x="294" y="86" width="12" height="60" fill="#6a4a2a" />
      </>)
    case 'pyramids':
      return (<>
        <path d="M0 215 Q100 195 200 212 T400 205 V280 H0Z" fill="#e3b872" />
        <path d="M60 215 L160 105 L260 215Z" fill="#d9a352" /><path d="M160 105 L260 215 H190Z" fill="#b8832f" />
        <path d="M230 215 L300 145 L370 215Z" fill="#cf9645" /><path d="M300 145 L370 215 H322Z" fill="#a8742a" />
        <path d="M0 250 Q100 225 200 252 T400 244 V280 H0Z" fill="#c99a52" />
        <path d="M70 262 l6 -22 l6 22z M90 262 l5 -18 l5 18z" fill="#3b2a15" />
      </>)
    default: return null
  }
}

export default function Scene({ kind = 'paris', image, alt, className = '' }) {
  const id = useId().replace(/:/g, '')
  const [failed, setFailed] = useState(false)
  const p = P[kind] || P.paris
  // Real photo when `image` is given; falls back to the illustrated scene if it is missing or fails to load.
  if (image && !failed) {
    return <img className={`scene ${className}`} src={image} alt={alt || `${kind} photo`} loading="lazy" onError={() => setFailed(true)} />
  }
  return (
    <svg className={`scene ${className}`} viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${kind} illustration`}>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.sky[0]} /><stop offset="1" stopColor={p.sky[1]} /></linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff9b3d" /><stop offset="1" stopColor="#ff9b3d" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="400" height="280" fill={`url(#s${id})`} />
      {p.sun && <circle cx={p.sun[1]} cy={p.sun[2]} r={p.sun[3]} fill={p.sun[0]} opacity=".9" />}
      {p.sky[0] !== '#0a1230' && p.motif !== 'cave' && <g fill="#fff" opacity=".7"><ellipse cx="70" cy="60" rx="38" ry="10" /><ellipse cx="95" cy="52" rx="26" ry="9" /><ellipse cx="270" cy="38" rx="34" ry="8" /></g>}
      {p.sky[0] === '#0a1230' && <g fill="#fff" opacity=".8">{[[30,30],[90,60],[150,20],[260,35],[330,25],[370,70],[60,100]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.4" />)}</g>}
      <Motif kind={p.motif} p={p} />
    </svg>
  )
}
