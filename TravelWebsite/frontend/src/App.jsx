import { useEffect, useMemo, useState } from "react";




  

import DestinationsPage from "./DestinationsPage.jsx";
import TourDetails from "./components/Tourdetails.jsx";
import TaxiBooking from "./components/TaxiBooking.jsx";
import Destinationdetails from "./components/Destinationdetails.jsx";
import Places from "./components/Places.jsx";
import {
  Routes,
  Route,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Trending from "./components/Trending.jsx";
import Popular from "./components/Popular.jsx";
import Footer from "./components/Footer.jsx";
import BookingModal from "./components/BookingModal.jsx";
import Scene from "./components/Scene.jsx";
import { Modal } from "./components/common.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { DURATIONS } from "./data.js";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import CheckoutPage from "./components/Checkoupage.jsx";





const API = "http://localhost:5000/api/tours";

const EMPTY = {
  region: "",
  type: "",
  month: "",
  duration: ""
};


// ====================================================
// MAIN APP
// ====================================================

function MainApp() {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    ...EMPTY,
    region: searchParams.get("region") || ""
  });

  const [tour, setTour] = useState(null);
  const [video, setVideo] = useState(false);

  // MongoDB tours
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==================================================
  // FETCH TOURS FROM MONGODB
  // ==================================================

  useEffect(() => {

    const fetchTours = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(API);

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        const data = await response.json();

        const tourData = Array.isArray(data)
          ? data
          : Array.isArray(data.tours)
            ? data.tours
            : [];

        setTours(tourData);

      } catch (err) {

        console.error(
          "Error fetching tours:",
          err
        );

        setError(
          "Unable to load tours. Please try again."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchTours();

  }, []);


  // ==================================================
  // CHECK FILTERS
  // ==================================================

  const filtered = Object.values(filters).some(
    value => value !== ""
  );


  // ==================================================
  // FILTER TOURS
  // ==================================================

  const list = useMemo(() => {

    if (!filtered) {
      return tours;
    }

    const d =
      filters.duration !== ""
        ? DURATIONS.find(
            item =>
              item.label === filters.duration
          )
        : null;

    return tours.filter(t => {

      // REGION
      if (
        filters.region &&
        t.region !== filters.region
      ) {
        return false;
      }

      // TYPE
      if (
        filters.type &&
        t.type !== filters.type
      ) {
        return false;
      }

      // MONTH
      if (filters.month) {

        const months =
          Array.isArray(t.months)
            ? t.months
            : [];

        if (
          !months.includes(filters.month)
        ) {
          return false;
        }

      }

      // DURATION
      if (d) {

        const days = Number(t.days);

        if (
          days < d.min ||
          days > d.max
        ) {
          return false;
        }

      }

      return true;

    });

  }, [tours, filters, filtered]);


  // ==================================================
  // HERO SEARCH
  // ==================================================

  const search = f => {

    setFilters({
      ...EMPTY,
      ...f
    });

    setTimeout(() => {

      document
        .getElementById("tours")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }, 30);

  };


  // ==================================================
  // SELECT REGION
  // ==================================================

  const pick = region => {

    setFilters({
      ...EMPTY,
      region: region || ""
    });

    setTimeout(() => {

      document
        .getElementById("tours")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }, 30);

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (
    <>

      <Header
        onSignIn={() =>
          navigate("/login")
        }
        onTaxi={() =>
          navigate("/taxi")
        }
      />


      <Hero
        onSearch={search}
        onPlay={() =>
          setVideo(true)
        }
      />


      {/* LOADING */}

      {loading && (
        <div className="center">
          <p>
            Loading tours...
          </p>
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="center">
          <p className="empty">
            {error}
          </p>
        </div>
      )}


      {/* TRENDING (cards open /tours/:id) */}

      {!loading &&
        !error && (

          <Trending
            tours={list}
            filtered={filtered}
            onClear={() =>
              setFilters(EMPTY)
            }
          />

        )}


      {/* DESTINATIONS */}
{/* 
     <Destinations onPick={pick} /> */}

<Places />
      {/* POPULAR (cards open /tours/:id) */}

      <Popular
        onPick={pick}
      />


      {/* FOOTER */}

      <Footer />


      {/* BOOKING */}

      {tour && (
        <BookingModal
          tour={tour}
          onClose={() =>
            setTour(null)
          }
        />
      )}


      {/* VIDEO */}

      {video && (

        <Modal
          onClose={() =>
            setVideo(false)
          }
          wide
        >

          <div className="reel">

            <Scene
              kind="savanna"
            />

            <div className="reel-cap">

              <h3>
                Africa, in motion
              </h3>

              <p>
                Our guides’ 90-second
                highlight reel is coming
                soon — in the meantime,
                browse the safaris below.
              </p>

              <a
                className="btn coral"
                href="#tours"
                onClick={() => {

                  setVideo(false);
                  pick("Africa");

                }}
              >
                SEE AFRICA TOURS
              </a>

            </div>

          </div>

        </Modal>

      )}

    </>
  );
}


// ====================================================
// APP ROUTES
// ====================================================

export default function App() {

  return (

  

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<MainApp />}
        />







      <Route 
       path="/destinations/:id" 
       element={<Destinationdetails />} />



        {/* TOUR DETAILS */}

        <Route
          path="/tours/:id"
          element={<TourDetails />}
        />


        {/* TAXI BOOKING */}

        <Route
          path="/taxi"
          element={<TaxiBooking />}
        />


        {/* DESTINATIONS */}

        <Route
          path="/destinations"
          element={<DestinationsPage />}
        />


        {/* LOGIN  AND REGISTER */}

         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />


        <Route
          path="/login"
          element={<Login />}
        />


      
        {/* Checkout page */}

        <Route path="/checkout" element={<CheckoutPage />} />

      </Routes>



  );
}