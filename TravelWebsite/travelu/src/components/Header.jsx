import { useEffect, useState } from 'react'

export const Logo = () => (
  <a className="logo" href="#top" aria-label="Travelu home">
    <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
      <rect x="9" y="1" width="8" height="5" rx="1.5" fill="none" stroke="#ffd400" strokeWidth="2" />
      <rect x="2" y="6" width="22" height="20" rx="4" fill="#ff7a59" />
      <rect x="6" y="9" width="14" height="14" rx="2" fill="#ffd400" opacity=".95" />
      <circle cx="8" cy="28.5" r="1.5" fill="#fff" /><circle cx="18" cy="28.5" r="1.5" fill="#fff" />
    </svg>
    <span>Travelu</span>
  </a>
)

const LINKS = [['Home', '#top'], ['Destinations', '#destinations'], ['Listings', '#tours'], ['Popular', '#popular'], ['Contact', '#contact']]
const Social = ({ d }) => <a href="#top" className="soc" aria-label="social"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></a>

export default function Header({ onSignIn }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 60)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <header className={`header ${solid ? 'solid' : ''} ${open ? 'open' : ''}`}>
      <div className="header-in">
        <Logo />
        <nav className="nav" onClick={() => setOpen(false)}>
          {LINKS.map(([t, h], i) => <a key={t} href={h} className={i === 0 ? 'active' : ''}>{t}</a>)}
          <span className="socials">
            <Social d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z" />
            <Social d="M3 3h18v18H3zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01" />
            <Social d="M22 5.9a8 8 0 0 1-2.4.7 4 4 0 0 0 1.8-2.3 8 8 0 0 1-2.6 1A4 4 0 0 0 11.9 9 11.4 11.4 0 0 1 3.6 4.8a4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.8-.5 4 4 0 0 0 3.2 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.2 11.4 11.4 0 0 0 8.2 20c7.5 0 11.7-6.2 11.7-11.6v-.5A8 8 0 0 0 22 5.9z" />
          </span>
        </nav>
        <div className="header-r">
          <a className="phone" href="tel:18003216543"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>1-800-321-6543</a>
          <button className="signin" onClick={onSignIn}>SIGN IN</button>
        </div>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /><i /></button>
      </div>
    </header>
  )
}
