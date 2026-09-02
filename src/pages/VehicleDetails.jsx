import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || ""
  );
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" or "success"
  const [unavailable, setUnavailable] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await api.get(`/vehicles/${id}`);
        setVehicle(response.data.vehicle);
      } catch (error) {
        setMessage("Failed to load vehicle.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (booking) {
      return;
    }

    if (!startDate || !endDate) {
      setMessage("Please select both dates.");
      setMessageType("error");
      return;
    }

    try {
      setBooking(true);
      setMessage("");
      setMessageType("");
      setUnavailable(false);
      setAlternatives([]);

      // Check availability
      const availabilityResponse = await api.get(
        `/bookings/availability/${id}`,
        {
          params: { startDate, endDate },
        }
      );

      if (!availabilityResponse.data.available) {
        // Vehicle is unavailable
        setUnavailable(true);
        setMessage(
          "This vehicle is unavailable for your selected dates."
        );
        setMessageType("error");

        // Fetch alternative vehicles
        try {
          setLoadingAlternatives(true);
          const alternativesResponse = await api.get(
            `/vehicles/${id}/alternatives`,
            {
              params: { startDate, endDate },
            }
          );

          if (
            alternativesResponse.data.vehicles &&
            alternativesResponse.data.vehicles.length > 0
          ) {
            setAlternatives(alternativesResponse.data.vehicles);
          }
        } catch (altError) {
          console.error("Failed to fetch alternatives:", altError);
        } finally {
          setLoadingAlternatives(false);
        }
      } else {
        // Vehicle is available, create booking
        await api.post("/bookings", {
          vehicleId: id,
          startDate,
          endDate,
        });

        setMessage("Booking created successfully!");
        setMessageType("success");

        setTimeout(() => {
          navigate("/my-bookings");
        }, 1000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Booking failed."
      );
      setMessageType("error");
    } finally {
      setBooking(false);
    }
  };

  const handleAlternativeClick = (altVehicleId) => {
    // Navigate to the alternative vehicle with dates preserved
    navigate(
      `/vehicles/${altVehicleId}?startDate=${startDate}&endDate=${endDate}`
    );
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
        <div className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-slate-200/70 bg-slate-100/80 p-4 sm:aspect-[16/9] sm:p-6">
            <img
              src={image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-contain transition duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>

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
                <div
                  className={`mb-4 rounded-lg p-3 text-sm ${
                    messageType === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
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

        {/* Show alternatives if vehicle is unavailable */}
        {unavailable && alternatives.length > 0 && (
          <div className="mt-12">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                Don't worry!
              </h2>
              <p className="mb-8 text-lg text-slate-600">
                Here are some similar vehicles available for your
                selected dates:
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {alternatives.map((alt) => (
                  <div
                    key={alt._id}
                    className="overflow-hidden rounded-2xl bg-slate-50 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div>
                      <img
                        src={
                          alt.images?.length > 0
                            ? alt.images[0]
                            : "https://via.placeholder.com/600x400?text=Ruvasgod+Auto"
                        }
                        alt={`${alt.make} ${alt.model}`}
                        className="h-56 w-full object-cover"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-slate-900">
                        {alt.make} {alt.model}
                      </h3>

                      <p className="mt-1 text-slate-500">
                        {alt.year} • {alt.type}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {alt.transmission} • {alt.fuelType}
                      </p>

                      <p className="mt-4 text-lg font-semibold">
                        ${alt.rentalPricePerDay}/day
                      </p>

                      <button
                        onClick={() => handleAlternativeClick(alt._id)}
                        className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
                      >
                        View Vehicle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Show message if no alternatives found */}
        {unavailable &&
          alternatives.length === 0 &&
          !loadingAlternatives && (
            <div className="mt-12">
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <p className="text-lg text-slate-700">
                  We couldn't find a similar vehicle for those dates.
                  Try different dates or{" "}
                  <button
                    onClick={() => navigate("/vehicles")}
                    className="font-semibold text-slate-900 underline hover:text-slate-700"
                  >
                    browse all vehicles
                  </button>
                  .
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default VehicleDetails;