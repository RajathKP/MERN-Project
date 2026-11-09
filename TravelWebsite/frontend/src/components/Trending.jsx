import { useNavigate } from 'react-router-dom'
import Scene from './Scene.jsx'
import { SectionTitle, Stars, ClockIcon, money } from './common.jsx'

export default function Trending({
  tours,
  filtered,
  onClear
}) {
  const navigate = useNavigate()

  // Open the tour details page
  const openTour = t => navigate(`/tours/${t._id || t.id}`)

  return (
    <section className="section" id="tours">

      <div className="wrap">

        <SectionTitle
          title={
            filtered
              ? `${tours.length} tour${tours.length === 1 ? '' : 's'} found`
              : 'Trending'
          }
          sub={
            filtered
              ? 'Matching your search — adjust the filters above to see more.'
              : 'Hand-picked escapes our travellers are booking right now.'
          }
        />

        {filtered && (
          <div className="center">
            <button
              className="link-btn"
              onClick={onClear}
            >
              Clear filters ✕
            </button>
          </div>
        )}

        {tours.length === 0 && (
          <p className="empty">
            No tours match those filters yet. Try a different month or duration.
          </p>
        )}

        <div className="grid3">

          {tours.map(t => (

            <article
              className="tcard"
              key={t._id || t.id}
              onClick={() => openTour(t)}
              tabIndex={0}
              onKeyDown={e =>
                e.key === 'Enter' && openTour(t)
              }
            >

              <div className="tcard-img">

                <Scene
                  kind={t.scene}
                  image={t.image}
                  alt={t.title}
                />

                <div className="tcard-hover">

                  <div className="th-top">

                    <Stars
                      n={Number(t.rating || 0)}
                    />

                    <span>
                      <ClockIcon />
                      {t.days} Days
                    </span>

                  </div>

                  <div className="th-bot">

                    <small>
                      From
                    </small>

                    {(t.oldPrice || t.was) > t.price && (
                      <s>
                        {money(t.oldPrice || t.was)}
                      </s>
                    )}

                    <b>
                      {money(t.price)}
                    </b>

                  </div>

                </div>

                <span className="tag">
                  {t.city}
                </span>

              </div>

              <h3>
                {t.title}
              </h3>

              <p>
                {t.description || ''}
              </p>

            </article>

          ))}

        </div>

      </div>

    </section>
  )
}