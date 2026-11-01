import { useEffect, useState } from 'react'

export const Wave = ({ color = 'currentColor' }) => (
  <svg className="wave" width="40" height="10" viewBox="0 0 40 10" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
    <path d="M1 8 L6 2 L11 8 L16 2 L21 8 L26 2 L31 8 L36 2 L39 6" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
)

export const Stars = ({ n }) => (
  <span className="stars" aria-label={`${n} out of 5`}>{[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= n ? 'on' : ''}>★</span>)}</span>
)

export const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)

export const Arrow = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: dir === 'l' ? 'scaleX(-1)' : 'none' }}><path d="M9 4l8 8-8 8" /></svg>
)

export const SectionTitle = ({ title, sub, light }) => (
  <div className={`sec-title ${light ? 'light' : ''}`}>
    <Wave />
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </div>
)

export const money = n => '$' + n.toLocaleString('en-US')

export function useVisible() {
  const calc = () => (window.innerWidth < 640 ? 1 : window.innerWidth < 980 ? 2 : 3)
  const [v, setV] = useState(calc)
  useEffect(() => {
    const f = () => setV(calc())
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return v
}

export function Carousel({ items, render, className = '', arrows = true }) {
  const per = useVisible()
  const [i, setI] = useState(0)
  const max = Math.max(0, items.length - per)
  const idx = Math.min(i, max)
  useEffect(() => setI(0), [items])
  return (
    <div className={`carousel ${className}`}>
      {arrows && <button className="car-btn prev" onClick={() => setI(Math.max(0, idx - 1))} disabled={idx === 0} aria-label="Previous"><Arrow dir="l" /></button>}
      <div className="car-viewport">
        <div className="car-track" style={{ transform: `translateX(-${idx * (100 / per)}%)` }}>
          {items.map((it, k) => <div className="car-item" style={{ flex: `0 0 ${100 / per}%` }} key={it.id ?? it.name ?? k}>{render(it)}</div>)}
        </div>
      </div>
      {arrows && <button className="car-btn next" onClick={() => setI(Math.min(max, idx + 1))} disabled={idx === max} aria-label="Next"><Arrow dir="r" /></button>}
    </div>
  )
}

export function Modal({ onClose, children, wide }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  )
}
