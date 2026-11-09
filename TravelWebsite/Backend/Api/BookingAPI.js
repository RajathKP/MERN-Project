// Helper used by the customer-facing BookingModal to save a booking.
// The booking then shows up in the admin dashboard under "Bookings".

const BOOKINGS_API = "http://localhost:5000/api/bookings";

export async function createBooking({
  tour,
  name,
  email,
  phone,
  travelDate,
  guests,
  notes,
}) {
  const guestCount = Number(guests) || 1;

  const response = await fetch(BOOKINGS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tourId: tour._id,
      tourTitle: tour.title,
      name,
      email,
      phone,
      travelDate,
      guests: guestCount,
      totalPrice: (Number(tour.price) || 0) * guestCount,
      notes,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an unexpected response (status ${response.status}). Is the /api/bookings route mounted?`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to create booking");
  }

  return data;
}

/*
  USAGE inside components/BookingModal.jsx:

    import { createBooking } from "../bookingApi.js";

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await createBooking({
          tour,                       // the tour prop passed to the modal
          name: form.name,
          email: form.email,
          phone: form.phone,
          travelDate: form.date,
          guests: form.guests,
          notes: form.notes,
        });
        // show your existing "Booking confirmed" state here
      } catch (err) {
        setError(err.message);        // or alert(err.message)
      }
    };
*/