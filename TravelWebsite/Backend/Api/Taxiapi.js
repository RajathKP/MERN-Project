// Helper for the customer-facing taxi booking form.
// Bookings created here appear in the admin dashboard under "Taxi Bookings".

const TAXI_API = "http://localhost:5000/api/taxi-bookings";

export async function createTaxiBooking({
  name,
  phone,
  email,
  pickupLocation,
  dropLocation,
  tripType,
  pickupDate,
  pickupTime,
  vehicleType,
  passengers,
  fare,
  notes,
}) {
  const response = await fetch(TAXI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      email,
      pickupLocation,
      dropLocation,
      tripType,
      pickupDate,
      pickupTime,
      vehicleType,
      passengers: Number(passengers) || 1,
      fare: Number(fare) || 0,
      notes,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an unexpected response (status ${response.status}). Is the /api/taxi-bookings route mounted?`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to create taxi booking");
  }

  return data;
}