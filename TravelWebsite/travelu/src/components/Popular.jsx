import Scene from './Scene.jsx'
import { Carousel, Stars, ClockIcon, money } from './common.jsx'
import { TOURS } from '../data.js'
import { OurDestinations } from './Destinations.jsx'

export default function Popular({ onBook, onPick }) {
  const list = TOURS.filter(t => t.reviews >= 5)
  return (
    <>
      <section className="popular" id="popular">
        <Scene kind="italy" className="pop-bg" />
        <div className="pop-shade" />
        <div className="wrap pop-in">
          <div className="pop-head"><h2>Popular Tours <svg className="wave" width="40" height="10" viewBox="0 0 40 10" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 8 L6 2 L11 8 L16 2 L21 8 L26 2 L31 8 L36 2 L39 6" strokeLinejoin="round" /></svg></h2><a href="#tours" onClick={() => onPick('')} className="all-tours"><u>ALL TOURS</u></a></div>
          <Carousel className="pop-car" items={list} render={t => (
            <article className="pcard" onClick={() => onBook(t)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onBook(t)}>
              <div className="pcard-img"><Scene kind={t.scene} image={t.image} alt={t.title} />{t.was && <span className="tag">{Math.round((1 - t.price / t.was) * 100)}% Off</span>}</div>
              <div className="pcard-body"><h3>{t.title}</h3><p>{t.blurb}</p></div>
              <div className="pcard-foot">
                <div><span className="dur"><ClockIcon /> {t.days} Days</span><div className="rv"><Stars n={t.rating} /> <small>({t.reviews} Review{t.reviews > 1 ? 's' : ''})</small></div></div>
                <div className="price">{t.was ? <s>{money(t.was)}</s> : <small>From</small>}<b>{money(t.price)}</b></div>
              </div>
            </article>
          )} />
        </div>
      </section>
      <section className="section"><OurDestinations onPick={onPick} /></section>
    </>
  )
}
