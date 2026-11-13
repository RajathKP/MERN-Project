import "./OverviewCard.css";

// Personal overview for the signed-in traveller.
// Usage: <OverviewCard bookings={bookings} taxiBookings={taxiBookings} savedCount={saved.length} />
// taxiBookings: array, or null while loading / unavailable.
const DAY = 24 * 60 * 60 * 1000;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const isCancelled = (b) => (b.status || "").toLowerCase() === "cancelled" || (b.status || "").toLowerCase() === "canceled";

export default function OverviewCard({ bookings = [], taxiBookings = null, savedCount = 0 }) {
  const today = startOfToday();

  // ---- tours
  const tours = bookings.filter((b) => !isCancelled(b));
  const past = tours.filter((b) => b.travelDate && new Date(b.travelDate) < today);
  const upcoming = tours
    .filter((b) => b.travelDate && new Date(b.travelDate) >= today)
    .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));
  const spent = tours
    .filter((b) => (b.paymentStatus || "").toLowerCase() === "paid")
    .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const unpaid = tours.filter((b) => (b.paymentStatus || "").toLowerCase() !== "paid").length;

  // ---- taxi
  const taxiAvailable = Array.isArray(taxiBookings);
  const taxi = taxiAvailable ? taxiBookings.filter((t) => !isCancelled(t)) : [];
  const taxiUpcoming = taxi.filter((t) => {
    const when = t.pickupDate || t.date || t.travelDate;
    return when && new Date(when) >= today;
  }).length;

  // ---- headline (most useful first)
  const next = upcoming[0];
  const daysToNext = next ? Math.ceil((new Date(next.travelDate) - today) / DAY) : null;
  let headline;
  let tone = "neutral";

  if (unpaid > 0) {
    headline = `${unpaid} booking${unpaid === 1 ? " is" : "s are"} waiting for payment.`;
    tone = "warn";
  } else if (next && daysToNext <= 7) {
    headline = `Your trip to ${next.tourTitle || "your tour"} is ${
      daysToNext === 0 ? "today" : daysToNext === 1 ? "tomorrow" : `in ${daysToNext} days`
    }. Check your documents.`;
    tone = "good";
  } else if (next) {
    headline = `Next up: ${next.tourTitle || "your tour"} in ${daysToNext} days.`;
    tone = "good";
  } else if (tours.length === 0) {
    headline = savedCount
      ? `You've saved ${savedCount} tour${savedCount === 1 ? "" : "s"}. Book one to lock in your trip.`
      : "Plan your first trip. Browse tours and find one you love.";
    tone = "warn";
  } else {
    headline = `You've taken ${past.length} trip${past.length === 1 ? "" : "s"} with us. Time to plan the next one.`;
  }

  const stats = [
    { label: "Tours booked", value: tours.length },
    { label: "Past tours", value: past.length },
    { label: "Upcoming tours", value: upcoming.length },
    {
      label: "Taxi bookings",
      value: taxiAvailable ? taxi.length : "—",
      title: taxiAvailable ? `${taxiUpcoming} upcoming` : "Taxi bookings unavailable",
    },
    { label: "Saved tours", value: savedCount },
    { label: "Total paid", value: fmt(spent) },
  ];

  return (
    <section className={`oc-card oc-${tone}`} aria-labelledby="oc-title">
      <div className="oc-head">
        <span className="oc-eyebrow">Your overview</span>
        <h3 id="oc-title">{headline}</h3>
      </div>

      <dl className="oc-grid">
        {stats.map((s) => (
          <div key={s.label} className="oc-item" title={s.title}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}