import { useState } from "react";
import Scene from "./Scene.jsx";
import { REGIONS, TYPES, MONTHS, DURATIONS } from "../data.js";

export default function Hero({ onSearch }) {
  const [f, setF] = useState({
    region: "",
    type: "",
    month: "",
    duration: "",
  });

  const [showVideo, setShowVideo] = useState(false);

  const set = (key) => (e) => {
    setF({
      ...f,
      [key]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(f);
    }
  };

  return (
    <section className="hero" id="top">

      {/* Background */}
      <Scene kind="trail" className="hero-bg" />

      <div className="hero-shade" />

      <div className="hero-center">

        {/* Video Preview */}
        <button
          type="button"
          className="video"
          onClick={() => setShowVideo(true)}
          aria-label="Play intro video"
        >
          <video
            src="/africa-cinematic-video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <span className="play">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <path d="M7 4l14 8-14 8z" />
            </svg>
          </span>
        </button>

        <h1>Planning a Trip to Africa?</h1>

        <p className="script">
          Your Dream Trip is Our Mission
        </p>

      </div>

      {/* Search */}
      <form className="search" onSubmit={submit}>

        <label>
          <select
            value={f.region}
            onChange={set("region")}
            aria-label="Destination"
          >
            <option value="">Destinations</option>

            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            value={f.type}
            onChange={set("type")}
            aria-label="Adventure type"
          >
            <option value="">Adventure Type</option>

            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            value={f.month}
            onChange={set("month")}
            aria-label="Travel month"
          >
            <option value="">Travel Month</option>

            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <label>
          <select
            value={f.duration}
            onChange={set("duration")}
            aria-label="Duration"
          >
            <option value="">Duration</option>

            {DURATIONS.map((duration) => (
              <option
                key={duration.label}
                value={duration.label}
              >
                {duration.label}
              </option>
            ))}
          </select>
        </label>

        <button className="btn coral" type="submit">
          FIND TOURS
        </button>

      </form>

      {/* Video Popup */}
      {showVideo && (
        <div className="video-modal">

          <div className="video-box">

            <button
              type="button"
              className="close-video"
              onClick={() => setShowVideo(false)}
              aria-label="Close video"
            >
              ×
            </button>

            <video
              src="/AFRICA   Cinematic Video.mp4"
              controls
              autoPlay
              playsInline
            />

          </div>

        </div>
      )}

    </section>
  );
}