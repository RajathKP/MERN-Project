import { useState } from 'react'
import Scene from './Scene.jsx'
import { Modal, Stars, money } from './common.jsx'

export default function BookingModal({ tour, onClose }) {
  const [f, setF] = useState({ name: '', email: '', date: '', guests: 2 })
  const [done, setDone] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const total = tour.price * Number(f.guests || 1)
  return (
    <Modal onClose={onClose} wide>
      <div className="book">
        <div className="book-img"><Scene kind={tour.scene} image={tour.image} alt={tour.title} /><span className="tag">{tour.city}</span></div>
        <div className="book-body">
          {done ? (
            <div className="done">
              <div className="check">✓</div>
              <h3>You’re on the list, {f.name.split(' ')[0] || 'traveller'}!</h3>
              <p>We’ve reserved {f.guests} seat{f.guests > 1 ? 's' : ''} on <b>{tour.title}</b> for {f.date}. A confirmation will be sent to <b>{f.email}</b>.</p>
              <button className="btn coral" onClick={onClose}>DONE</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setDone(true) }}>
              <h3>{tour.title}</h3>
              <div className="meta"><Stars n={tour.rating} /> <span>{tour.days} days · {tour.type}</span></div>
              <p>{tour.blurb}</p>
              <input required placeholder="Full name" value={f.name} onChange={set('name')} />
              <input required type="email" placeholder="Email address" value={f.email} onChange={set('email')} />
              <div className="row2">
                <input required type="date" value={f.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} />
                <input required type="number" min="1" max="12" value={f.guests} onChange={set('guests')} aria-label="Guests" />
              </div>
              <div className="total"><span>Total ({f.guests || 1} guest{f.guests > 1 ? 's' : ''})</span><b>{money(total)}</b></div>
              <button className="btn coral full" type="submit">BOOK THIS TOUR</button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  )
}
