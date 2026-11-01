import { useState } from 'react'
import Scene from './Scene.jsx'
import WorldMap from './WorldMap.jsx'
import { Carousel, SectionTitle, Wave } from './common.jsx'
import { DESTINATIONS, REGIONS, COUNTS } from '../data.js'

export function OurDestinations({ dark, onPick }) {
  const [active, setActive] = useState(null)
  return (
    <div className="our-dest wrap">
      <WorldMap active={active} onActive={setActive} dark={dark} />
      <div className="od-text">
        <h2>Our Destinations <Wave /></h2>
        <p>From sunlit coastlines to snow-capped passes, we run small-group trips in more than sixty countries — each one planned by people who have actually been there.</p>
        <ul className="counts">
          {COUNTS.map(([n, c]) => (
            <li key={n}><button className={active === n ? 'on' : ''} onMouseEnter={() => setActive(n)} onMouseLeave={() => setActive(null)} onClick={() => onPick(n)}>{n} <i>({c})</i></button></li>
          ))}
        </ul>
        <a className="btn coral" href="#tours" onClick={() => onPick('')}><u>ALL DESTINATIONS</u></a>
      </div>
    </div>
  )
}

export default function Destinations({ onPick }) {
  const tabs = REGIONS.filter(r => DESTINATIONS[r])
  const [tab, setTab] = useState('Europe')
  return (
    <section className="section dark" id="destinations">
      <div className="wrap">
        <SectionTitle light title="Top Destinations" sub="Pick a continent and start exploring — every card opens a curated list of tours." />
        <div className="tabs" role="tablist">
          {tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <Carousel items={DESTINATIONS[tab].map(d => ({ ...d, id: tab + d.name }))} render={d => (
          <a className="dcard" href="#tours" onClick={() => onPick(tab)}>
            <Scene kind={d.scene} image={d.image} alt={d.name} />
            <div className="dcard-cap"><b>{d.name}</b><span>{d.sub}</span></div>
          </a>
        )} />
      </div>
      <OurDestinations dark onPick={onPick} />
    </section>
  )
}
