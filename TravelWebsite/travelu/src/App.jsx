import { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Trending from './components/Trending.jsx'
import Destinations from './components/Destinations.jsx'
import Popular from './components/Popular.jsx'
import Footer from './components/Footer.jsx'
import BookingModal from './components/BookingModal.jsx'
import Scene from './components/Scene.jsx'
import { Modal } from './components/common.jsx'
import { TOURS, FEATURED, DURATIONS } from './data.js'

const EMPTY = { region: '', type: '', month: '', duration: '' }

export default function App() {
  const [filters, setFilters] = useState(EMPTY)
  const [tour, setTour] = useState(null)
  const [video, setVideo] = useState(false)
  const [signin, setSignin] = useState(false)
  const filtered = Object.values(filters).some(v => v !== '')

  const list = useMemo(() => {
    if (!filtered) return FEATURED.map(s => TOURS.find(t => t.scene === s))
    const d = filters.duration !== '' ? DURATIONS[filters.duration] : null
    return TOURS.filter(t =>
      (!filters.region || t.region === filters.region) &&
      (!filters.type || t.type === filters.type) &&
      (!filters.month || t.months.includes(filters.month)) &&
      (!d || (t.days >= d.min && t.days <= d.max)))
  }, [filters, filtered])

  const search = f => { setFilters(f); setTimeout(() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' }), 30) }
  const pick = region => setFilters({ ...EMPTY, region: region || '' })

  return (
    <>
      <Header onSignIn={() => setSignin(true)} />
      <Hero onSearch={search} onPlay={() => setVideo(true)} />
      <Trending tours={list} filtered={filtered} onClear={() => setFilters(EMPTY)} onBook={setTour} />
      <Destinations onPick={pick} />
      <Popular onBook={setTour} onPick={pick} />
      <Footer />
      {tour && <BookingModal tour={tour} onClose={() => setTour(null)} />}
      {video && (
        <Modal onClose={() => setVideo(false)} wide>
          <div className="reel"><Scene kind="savanna" /><div className="reel-cap"><h3>Africa, in motion</h3><p>Our guides’ 90-second highlight reel is coming soon — in the meantime, browse the safaris below.</p><a className="btn coral" href="#tours" onClick={() => { setVideo(false); pick('Africa') }}>SEE AFRICA TOURS</a></div></div>
        </Modal>
      )}
      {signin && (
        <Modal onClose={() => setSignin(false)}>
          <form className="signin-form" onSubmit={e => { e.preventDefault(); setSignin(false) }}>
            <h3>Welcome back</h3>
            <input required type="email" placeholder="Email" /><input required type="password" placeholder="Password" />
            <button className="btn coral full">SIGN IN</button>
          </form>
        </Modal>
      )}
    </>
  )
}
