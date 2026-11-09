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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      pickup: pickupLocation,
      dropoff: dropLocation,
      date: pickupDate,
      time: pickupTime,
      passengers: Number(passengers) || 1,
      vehicle: vehicleType || "",
      message: notes || "",
    }),
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an unexpected response (status ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to create taxi booking");
  }

  return data;
}

export async function getTaxiBookings() {
  const response = await fetch(TAXI_API);

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an unexpected response (status ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch taxi bookings");
  }

  return data;
}