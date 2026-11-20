
import { useEffect, useMemo, useState } from 'react'
import Scene from './Scene.jsx'
import { Carousel, SectionTitle, Wave } from './common.jsx'
import { Link } from 'react-router-dom'

const API = "https://mern-project-htye.onrender.com/api/tours"

// ----------------------------------------------------
// OUR DESTINATIONS
// ----------------------------------------------------

export function OurDestinations({
  onPick,
  counts = []
}) {
  return (
    <div className="our-dest wrap">

      <div className="od-text">

        

        <ul className="counts">

          {counts.map(([name, count]) => (
            <li key={name}>

              <button
                type="button"
                onClick={() => onPick(name)}
              >
                {name} <i>({count})</i>
              </button>

            </li>
          ))}

        </ul>

       <Link className="btn coral" to="/destinations">
  ALL DESTINATIONS
</Link>

      </div>

    </div>
  )
}

// ----------------------------------------------------
// DESTINATIONS
// ----------------------------------------------------

export default function Destinations({ onPick }) {

  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('')

  // --------------------------------------------------
  // FETCH TOURS
  // --------------------------------------------------

  useEffect(() => {

    const fetchTours = async () => {

      try {

        setLoading(true)
        setError('')

        const response = await fetch(API)

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          )
        }

        const data = await response.json()

        console.log("Tours received:", data)

        const tourData = Array.isArray(data)
          ? data
          : Array.isArray(data.tours)
            ? data.tours
            : []

        setTours(tourData)

      } catch (err) {

        console.error(
          "Failed to fetch tours:",
          err
        )

        setError(
          "Unable to load destinations. Please check that the backend is running."
        )

      } finally {

        setLoading(false)

      }
    }

    fetchTours()

  }, [])

  // --------------------------------------------------
  // GROUP TOURS BY REGION
  // --------------------------------------------------

  const destinations = useMemo(() => {

    return tours.reduce((groups, tour) => {

      const region =
        tour.region?.trim()

      if (!region) {
        return groups
      }

      if (!groups[region]) {
        groups[region] = []
      }

      groups[region].push(tour)

      return groups

    }, {})

  }, [tours])

  // --------------------------------------------------
  // REGIONS
  // --------------------------------------------------

  const regions = useMemo(() => {

    return Object.keys(destinations)

  }, [destinations])

  // --------------------------------------------------
  // REGION COUNTS
  // --------------------------------------------------

  const counts = useMemo(() => {

    return regions.map(region => {

      const count =
        destinations[region]?.length || 0

      return [
        region,
        String(count).padStart(2, '0')
      ]

    })

  }, [regions, destinations])

  // --------------------------------------------------
  // SELECT FIRST REGION
  // --------------------------------------------------

  useEffect(() => {

    if (regions.length === 0) {
      setTab('')
      return
    }

    if (!regions.includes(tab)) {
      setTab(regions[0])
    }

  }, [regions, tab])

  // --------------------------------------------------
  // CURRENT REGION TOURS
  // --------------------------------------------------

  const currentTours =
    destinations[tab] || []

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <section
      className="section dark"
      id="destinations"
    >

      <div className="wrap">

        <SectionTitle
          light
          title="Top Destinations"
          sub="Pick a continent and start exploring — every card opens a curated list of tours."
        />

        {/* LOADING */}

        {loading && (
          <p className="loading">
            Loading destinations...
          </p>
        )}

        {/* ERROR */}

        {!loading && error && (
          <p className="error">
            {error}
          </p>
        )}

        {/* TABS */}

        {!loading &&
          !error &&
          regions.length > 0 && (

            <div
              className="tabs"
              role="tablist"
            >

              {regions.map(region => (

                <button
                  key={region}
                  type="button"
                  role="tab"
                  aria-selected={tab === region}
                  className={
                    tab === region
                      ? 'on'
                      : ''
                  }
                  onClick={() => {
                    setTab(region)
                    onPick(region)
                  }}
                >
                  {region}
                </button>

              ))}

            </div>

          )}

        {/* CAROUSEL */}

        {!loading &&
          !error &&
          currentTours.length > 0 && (

            <Carousel
              items={currentTours.map(tour => ({
                ...tour,
                id: tour._id || tour.id
              }))}

              render={tour => {

                const title =
                  tour.city ||
                  tour.name ||
                  tour.title ||
                  "Untitled Tour"

                const description =
                  tour.sub ||
                  tour.description ||
                  ""

                return (

                  <a
                    key={tour._id || tour.id}
                    className="dcard"
                    href="#tours"
                    onClick={() => onPick(tab)}
                  >

                    <Scene
                      kind={tour.scene || 'paris'}
                      image={tour.image}
                      alt={title}
                    />

                    <div className="dcard-cap">

                      <b>
                        {title}
                      </b>

                      <span>
                        {description}
                      </span>

                    </div>

                  </a>

                )

              }}
            />

          )}

        {/* NO TOURS */}

        {!loading &&
          !error &&
          regions.length === 0 && (

            <p>
              No destinations available.
            </p>

          )}

        {!loading &&
          !error &&
          regions.length > 0 &&
          currentTours.length === 0 && (

            <p>
              No tours available for this region.
            </p>

          )}

      </div>

      {/* REGION COUNTS */}

      {!loading &&
        !error &&
        regions.length > 0 && (

          <OurDestinations
            onPick={onPick}
            counts={counts}
          />

        )}

    </section>

  )
}
