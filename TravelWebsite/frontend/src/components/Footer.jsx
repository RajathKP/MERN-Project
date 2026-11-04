import { useState } from 'react'
import { Logo } from './Header.jsx'

export default function Footer() {
  const [ok, setOk] = useState(false)
  return (
    <footer className="footer" id="contact">
      <div className="wrap fgrid">
        <div>
          <Logo />
          <p>Small-group tours, custom itineraries and honest prices. Your dream trip is our mission.</p>
          <p className="fcontact">1-800-321-6543<br />hello@travelu.example</p>
        </div>
        <div><h4>Explore</h4><a href="#destinations">Destinations</a><a href="#tours">Tour listings</a><a href="#popular">Popular tours</a></div>
        <div><h4>Company</h4><a href="#top">About us</a><a href="#top">Careers</a><a href="#top">Travel blog</a></div>
        <div>
          <h4>Newsletter</h4>
          {ok ? <p className="thanks">Thanks — see you in your inbox! ✈️</p> : (
            <form onSubmit={e => { e.preventDefault(); setOk(true) }} className="news">
              <input required type="email" placeholder="Your email" /><button className="btn coral">JOIN</button>
            </form>)}
        </div>
      </div>
      <div className="copy">© {new Date().getFullYear()} Travelu. All rights reserved.</div>
    </footer>
  )
}
