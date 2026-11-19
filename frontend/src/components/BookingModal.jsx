import { useState } from 'react'
import Scene from './Scene.jsx'
import { Modal, Stars, money } from './common.jsx'

const BOOKINGS_API = 'http://localhost:6001/api/bookings'

export default function BookingModal({ tour, onClose }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', date: '', guests: 2, notes: '' })
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const guests = Number(f.guests) || 1
  const total = tour.price * guests

  // Save the booking to the backend so it shows up in the admin Bookings tab
  const submit = async e => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const response = await fetch(BOOKINGS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour._id,
          tourTitle: tour.title,
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          travelDate: f.date,
          guests,
          totalPrice: total,
          notes: f.notes.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Booking failed. Please try again.')

      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="book">
        <div className="book-img"><Scene kind={tour.scene} image={tour.image} alt={tour.title} /><span className="tag">{tour.city}</span></div>
        <div className="book-body">
          {done ? (
            <div className="done">
              <div className="check">✓</div>
              <h3>You’re on the list, {f.name.split(' ')[0] || 'traveller'}!</h3>
              <p>We’ve reserved {guests} seat{guests > 1 ? 's' : ''} on <b>{tour.title}</b> for {f.date}. A confirmation will be sent to <b>{f.email}</b>.</p>
              <button className="btn coral" onClick={onClose}>DONE</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3>{tour.title}</h3>
              <div className="meta"><Stars n={tour.rating} /> <span>{tour.days} days · {tour.type}</span></div>
              <p>{tour.blurb}</p>
              <input required placeholder="Full name" value={f.name} onChange={set('name')} />
              <input required type="email" placeholder="Email address" value={f.email} onChange={set('email')} />
              <input type="tel" placeholder="Phone number (optional)" value={f.phone} onChange={set('phone')} />
              <div className="row2">
                <input required type="date" value={f.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} />
                <input required type="number" min="1" max="12" value={f.guests} onChange={set('guests')} aria-label="Guests" />
              </div>
              <textarea rows="2" placeholder="Notes or special requests (optional)" value={f.notes} onChange={set('notes')} />
              <div className="total"><span>Total ({guests} guest{guests > 1 ? 's' : ''})</span><b>{money(total)}</b></div>
              {error && <p style={{ color: '#b91c1c', margin: '0.5rem 0' }}>{error}</p>}
              <button className="btn coral full" type="submit" disabled={sending}>
                {sending ? 'BOOKING...' : 'BOOK THIS TOUR'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  )
}