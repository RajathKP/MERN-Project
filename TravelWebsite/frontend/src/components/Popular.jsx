
import { useEffect, useState } from 'react'
import Scene from './Scene.jsx'
import { Carousel, Stars, ClockIcon, money } from './common.jsx'
import { OurDestinations } from './Destinations.jsx'

const API = "http://localhost:5000/api/tours"

export default function Popular({ onBook, onPick }) {

  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const fetchTours = async () => {

      try {
        setLoading(true)
        setError('')

        const response = await fetch(API)

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        const tourData = Array.isArray(data)
          ? data
          : data.tours || []

        setTours(tourData)

      } catch (err) {

        console.error("Failed to fetch popular tours:", err)
        setError("Unable to load popular tours.")

      } finally {

        setLoading(false)

      }
    }

    fetchTours()

  }, [])


  // Popular tours = tours with 5 or more reviews
  const list = tours.filter(
    tour => Number(tour.reviews || 0) >= 5
  )


  return (
    <>
      <section className="popular" id="popular">

        <Scene
          kind="italy"
          className="pop-bg"
        />

        <div className="pop-shade" />

        <div className="wrap pop-in">

          <div className="pop-head">

            <h2>
              Popular Tours

              <svg
                className="wave"
                width="40"
                height="10"
                viewBox="0 0 40 10"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              >
                <path
                  d="M1 8 L6 2 L11 8 L16 2 L21 8 L26 2 L31 8 L36 2 L39 6"
                  strokeLinejoin="round"
                />
              </svg>

            </h2>

            <a
              href="#tours"
              onClick={() => onPick('')}
              className="all-tours"
            >
              <u>ALL TOURS</u>
            </a>

          </div>


          {/* Loading */}
          {loading && (
            <p className="loading">
              Loading popular tours...
            </p>
          )}


          {/* Error */}
          {error && (
            <p className="error">
              {error}
            </p>
          )}


          {/* Popular Tours */}
          {!loading &&
            !error &&
            list.length > 0 && (

              <Carousel
                className="pop-car"
                items={list.map(tour => ({
                  ...tour,
                  id: tour._id || tour.id
                }))}

                render={t => (

                  <article
                    className="pcard"
                    onClick={() => onBook(t)}
                    tabIndex={0}
                    onKeyDown={e =>
                      e.key === 'Enter' && onBook(t)
                    }
                  >

                    <div className="pcard-img">

                      <Scene
                        kind={t.scene}
                        image={t.image}
                        alt={t.title}
                      />

                      {t.was > t.price && (
                        <span className="tag">
                          {Math.round(
                            (1 - t.price / t.was) * 100
                          )}% Off
                        </span>
                      )}

                    </div>


                    <div className="pcard-body">

                      <h3>
                        {t.title}
                      </h3>

                      <p>
                        {t.description || ''}
                      </p>

                    </div>


                    <div className="pcard-foot">

                      <div>

                        <span className="dur">
                          <ClockIcon />
                          {t.days} Days
                        </span>

                        <div className="rv">

                          <Stars
                            n={Number(t.rating || 0)}
                          />

                          <small>
                            ({Number(t.reviews || 0)} Review
                            {Number(t.reviews || 0) !== 1 ? 's' : ''})
                          </small>

                        </div>

                      </div>


                      <div className="price">

                        {t.was > t.price ? (
                          <s>
                            {money(t.was)}
                          </s>
                        ) : (
                          <small>
                            From
                          </small>
                        )}

                        <b>
                          {money(t.price)}
                        </b>

                      </div>

                    </div>

                  </article>

                )}
              />

            )}


          {/* No popular tours */}
          {!loading &&
            !error &&
            list.length === 0 && (

              <p>
                No popular tours available.
              </p>

            )}

        </div>

      </section>


      <section className="section">

        <OurDestinations
          onPick={onPick}
        />

      </section>

    </>
  )
}
