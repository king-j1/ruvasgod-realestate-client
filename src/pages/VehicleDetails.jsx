
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
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || "",
  );
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");

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

  const rentalDays =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(endDate) - new Date(startDate)) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const rentalTotal =
    rentalDays > 0 ? rentalDays * vehicle?.rentalPricePerDay : 0;

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

      const availabilityResponse = await api.get(
        `/bookings/availability/${id}`,
        {
          params: { startDate, endDate },
        },
      );

      if (!availabilityResponse.data.available) {
        setUnavailable(true);
        setMessage("This vehicle is unavailable for your selected dates.");
        setMessageType("error");

        try {
          setLoadingAlternatives(true);

          const alternativesResponse = await api.get(
            `/vehicles/${id}/alternatives`,
            {
              params: { startDate, endDate },
            },
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
      setMessage(error.response?.data?.message || "Booking failed.");
      setMessageType("error");
    } finally {
      setBooking(false);
    }
  };

  const handleAlternativeClick = (altVehicleId) => {
    navigate(
      `/vehicles/${altVehicleId}?startDate=${startDate}&endDate=${endDate}`,
    );
  };

  const handlePurchase = async () => {
    if (purchasing) {
      return;
    }

    try {
      setPurchasing(true);
      setPurchaseMessage("");

      const saleResponse = await api.post("/sales", {
        vehicleId: id,
      });

      const saleId = saleResponse.data?.sale?._id;

      if (!saleId) {
        throw new Error("Purchase could not be initialized.");
      }

      const paymentResponse = await api.post(
        "/payments/sales/initialize",
        {
          saleId,
        },
      );

      const authorizationUrl =
        paymentResponse.data?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error("Purchase payment could not be initialized.");
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error("Sale payment initialization error:", error);

      setPurchaseMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to initialize purchase.",
      );

      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <div className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/35">
              Ruvasgod Auto
            </p>

            <p className="mt-3 text-white/60">
              Preparing vehicle details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white">
        <div className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/35">
              Ruvasgod Auto
            </p>

            <h1 className="mt-5 text-3xl font-semibold">
              Vehicle not found
            </h1>

            <button
              type="button"
              onClick={() => navigate("/vehicles")}
              className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
            >
              Browse Fleet
            </button>
          </div>
        </div>
      </main>
    );
  }

  const image =
    vehicle.images?.length > 0
      ? vehicle.images[0]
      : "https://via.placeholder.com/1000x700?text=Ruvasgod+Auto";

  const availableForRent = Boolean(vehicle.availableForRent);
  const availableForSale = Boolean(vehicle.availableForSale);
  const completelyUnavailable =
    !availableForRent && !availableForSale;

  const formattedSalePrice =
    vehicle.price !== undefined && vehicle.price !== null
      ? Number(vehicle.price).toLocaleString()
      : null;

  const formattedRentalPrice =
    vehicle.rentalPricePerDay !== undefined &&
    vehicle.rentalPricePerDay !== null
      ? Number(vehicle.rentalPricePerDay).toLocaleString()
      : null;

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* Main vehicle section */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24 lg:pt-12">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate("/vehicles")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
        >
          <span className="text-lg">←</span>
          Back to Fleet
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/30">
          {/* Vehicle image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[#11151a] lg:aspect-[16/8]">
            <img
              src={image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className={`h-full w-full object-cover ${
                completelyUnavailable ? "grayscale opacity-60" : ""
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Brand */}
            <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
              <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md">
                Ruvasgod Auto
              </span>
            </div>

            {/* Availability */}
            <div className="absolute right-5 top-5 sm:right-7 sm:top-7">
              <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75 backdrop-blur-md">
                {availableForRent && availableForSale
                  ? "Rent & Buy"
                  : availableForRent
                    ? "Available for Rent"
                    : availableForSale
                      ? "Available for Sale"
                      : "Unavailable"}
              </span>
            </div>

            {/* Vehicle name over image */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                {vehicle.type || "Premium Vehicle"}
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {vehicle.make} {vehicle.model}
              </h1>

              <p className="mt-2 text-sm text-white/50 sm:text-base">
                {vehicle.year}
                {vehicle.transmission && (
                  <>
                    <span className="mx-2 text-white/20">•</span>
                    {vehicle.transmission}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            {/* Left column */}
            <div>
              <div className="flex flex-wrap gap-3">
                {vehicle.fuelType && (
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                    {vehicle.fuelType}
                  </span>
                )}

                {vehicle.color && (
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                    {vehicle.color}
                  </span>
                )}

                {vehicle.mileage !== undefined &&
                  vehicle.mileage !== null && (
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                      {vehicle.mileage} mileage
                    </span>
                  )}
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/70">
                  The Vehicle
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Built for your next move.
                </h2>

                {vehicle.description && (
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-white/45 sm:text-base">
                    {vehicle.description}
                  </p>
                )}
              </div>

              {/* Specifications */}
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30">
                  Specifications
                </p>

                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3">
                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Year
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.year || "—"}
                    </p>
                  </div>

                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Transmission
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.transmission || "—"}
                    </p>
                  </div>

                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Fuel
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.fuelType || "—"}
                    </p>
                  </div>

                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Color
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.color || "—"}
                    </p>
                  </div>

                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Mileage
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.mileage ?? "—"}
                    </p>
                  </div>

                  <div className="bg-[#0b0e12] p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/80">
                      {vehicle.location || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
              {/* Pricing */}
              {(availableForSale || availableForRent) && (
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/30">
                    Pricing
                  </p>

                  <div className="mt-5 space-y-4">
                    {availableForSale && formattedSalePrice && (
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-white/35">
                            Purchase
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-tight">
                            GHS {formattedSalePrice}
                          </p>
                        </div>

                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                          Buy
                        </span>
                      </div>
                    )}

                    {availableForRent && formattedRentalPrice && (
                      <div className="flex items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
                        <div>
                          <p className="text-xs text-white/35">
                            Rental
                          </p>

                          <p className="mt-1 text-2xl font-semibold tracking-tight">
                            GHS {formattedRentalPrice}
                            <span className="ml-1 text-sm font-normal text-white/30">
                              / day
                            </span>
                          </p>
                        </div>

                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                          Rent
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rental */}
              {availableForRent && (
                <form
                  onSubmit={handleBooking}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-xl shadow-black/20 sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                        Rental
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        Reserve your vehicle
                      </h2>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        GHS {formattedRentalPrice}
                      </p>

                      <p className="text-xs text-white/30">
                        per day
                      </p>
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                        messageType === "error"
                          ? "border-red-400/10 bg-red-400/[0.06] text-red-300"
                          : "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-300"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-white/35"
                      >
                        Start Date
                      </label>

                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-white/35"
                      >
                        End Date
                      </label>

                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20"
                      />
                    </div>
                  </div>

                  {rentalDays > 0 && (
                    <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40">
                          {rentalDays}{" "}
                          {rentalDays === 1 ? "day" : "days"}
                        </span>

                        <span className="text-xl font-semibold">
                          GHS{" "}
                          {Number(rentalTotal).toLocaleString()}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-white/25">
                        Estimated rental total
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={booking}
                    className="mt-5 w-full rounded-xl bg-white px-5 py-4 text-sm font-semibold text-black transition hover:bg-cyan-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {booking
                      ? "Checking availability..."
                      : "Reserve Vehicle"}
                  </button>
                </form>
              )}

              {/* Purchase */}
              {availableForSale && (
                <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.035] p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                    Purchase
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Make it yours.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/40">
                    Secure this vehicle through the Ruvasgod Auto
                    purchase process.
                  </p>

                  {purchaseMessage && (
                    <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-300">
                      {purchaseMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-4 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {purchasing
                      ? "Connecting to Paystack..."
                      : `Buy Now · GHS ${formattedSalePrice}`}
                  </button>

                  <p className="mt-3 text-center text-[11px] text-white/25">
                    Secure payment powered by Paystack
                  </p>
                </section>
              )}

              {/* Completely unavailable */}
              {completelyUnavailable && (
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/30">
                    —
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    Currently unavailable
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    This vehicle is no longer available for rental or
                    purchase.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/vehicles")}
                    className="mt-6 rounded-full border border-white/[0.1] px-6 py-3 text-sm font-semibold text-white/70 transition hover:bg-white hover:text-black"
                  >
                    Explore Other Vehicles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alternatives */}
      {unavailable && (
        <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
          <div className="border-t border-white/[0.06] pt-12">
            {loadingAlternatives ? (
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

                <p className="mt-4 text-sm text-white/40">
                  Finding similar vehicles...
                </p>
              </div>
            ) : alternatives.length > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  Suggested Vehicles
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your journey doesn't have to stop.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                  This vehicle isn't available for your selected dates,
                  but we've found other vehicles you may like.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {alternatives.map((alt) => (
                    <VehicleCard
                      key={alt._id}
                      vehicle={alt}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-8 sm:p-10">
                <p className="text-lg font-semibold text-white">
                  No similar vehicles found.
                </p>

                <p className="mt-2 text-sm leading-7 text-white/40">
                  Try different rental dates or browse the complete
                  Ruvasgod Auto fleet.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/vehicles")}
                  className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
                >
                  Browse Fleet
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default VehicleDetails;
