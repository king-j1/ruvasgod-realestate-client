import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        setVehicle(response.data.vehicle);
      } catch (error) {
        setMessage("Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setMessage("Please select both dates.");
      return;
    }

    try {
      setBooking(true);
      setMessage("");

      await api.post("/bookings", {
        vehicleId: id,
        startDate,
        endDate,
      });

      setMessage("Booking created successfully!");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Booking failed."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading vehicle...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Vehicle not found.
      </div>
    );
  }

  const image =
    vehicle.images?.length > 0
      ? vehicle.images[0]
      : "https://via.placeholder.com/800x500?text=Ruvasgod+Auto";

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <img
            src={image}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-[450px] w-full object-cover"
          />

          <div className="grid gap-8 p-8 md:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {vehicle.make} {vehicle.model}
              </h1>

              <p className="mt-2 text-slate-500">
                {vehicle.year} • {vehicle.type} •{" "}
                {vehicle.transmission}
              </p>

              <p className="mt-6 text-3xl font-bold">
                ${vehicle.rentalPricePerDay}
                <span className="text-base font-normal text-slate-500">
                  {" "}
                  / day
                </span>
              </p>

              <p className="mt-6 text-slate-600">
                {vehicle.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Fuel:</strong> {vehicle.fuelType}
                </div>

                <div>
                  <strong>Color:</strong> {vehicle.color}
                </div>

                <div>
                  <strong>Mileage:</strong> {vehicle.mileage}
                </div>

                <div>
                  <strong>Location:</strong> {vehicle.location}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleBooking}
              className="rounded-xl bg-slate-50 p-6"
            >
              <h2 className="mb-5 text-2xl font-bold">
                Rent this vehicle
              </h2>

              {message && (
                <div className="mb-4 rounded-lg bg-white p-3 text-sm">
                  {message}
                </div>
              )}

              <label className="mb-2 block font-medium">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <label className="mb-2 block font-medium">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-3"
              />

              <button
                type="submit"
                disabled={booking || !vehicle.availableForRent}
                className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {booking ? "Booking..." : "Book Vehicle"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetails;