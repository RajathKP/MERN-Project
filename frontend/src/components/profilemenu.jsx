import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './ProfileMenu.css'
import LogoutConfirm from './LogoutConfirm.jsx'

const readUser = () => {
  try {
    if (!localStorage.getItem('token') && !localStorage.getItem('user')) return null
    return JSON.parse(localStorage.getItem('user') || 'null') || { name: '' }
  } catch {
    return null
  }
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(readUser)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const onClick = e => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = e => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Close after navigating and refresh the logged-in state
  useEffect(() => {
    setOpen(false)
    setUser(readUser())
  }, [pathname, search])

  const [confirmLogout, setConfirmLogout] = useState(false)

  const logout = () => {
    setConfirmLogout(false)
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch {
      /* storage unavailable */
    }
    setUser(null)
    setOpen(false)

    // tell the header (notification bell) that the user is logged out
    window.dispatchEvent(new Event('auth-changed'))

    // go to the home page
    navigate('/', { replace: true })
  }

  const firstName = (user?.name || '').split(' ')[0]

  return (
    <div className="pm" ref={ref}>
      <button
        type="button"
        className="pm-btn"
        onClick={() => {
          setUser(readUser())
          setOpen(o => !o)
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        </svg>
      </button>

      {confirmLogout && (
        <LogoutConfirm onConfirm={logout} onCancel={() => setConfirmLogout(false)} />
      )}

      {open && (
        <div className="pm-menu" role="menu">
          {user ? (
            <>
              <p className="pm-hello">{firstName ? `Hi, ${firstName}` : 'My account'}</p>
              <Link to="/dashboard" role="menuitem">Dashboard</Link>
              <Link to="/dashboard?tab=profile" role="menuitem">My profile</Link>
              <button type="button" role="menuitem" className="pm-logout" onClick={() => { setOpen(false); setConfirmLogout(true) }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" role="menuitem" className={pathname === '/login' ? 'active' : ''}>Login</Link>
              <Link to="/register" role="menuitem" className={pathname === '/register' ? 'active' : ''}>Register</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}