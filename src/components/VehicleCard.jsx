
import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  const image =
    vehicle.images?.length > 0
      ? vehicle.images[0]
      : "https://via.placeholder.com/600x400?text=Ruvasgod+Auto";

  const availableForSale = Boolean(vehicle.availableForSale);
  const availableForRent = Boolean(vehicle.availableForRent);
  const unavailable = !availableForSale && !availableForRent;

  let availabilityLabel = "Unavailable";

  if (availableForSale && availableForRent) {
    availabilityLabel = "Rent & Buy";
  } else if (availableForRent) {
    availabilityLabel = "Available for Rent";
  } else if (availableForSale) {
    availabilityLabel = "Available for Sale";
  }

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0b0e12] shadow-2xl shadow-black/20 transition duration-500 ease-out hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-black/40">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#11151a]">
        <img
          src={image}
          alt={`${vehicle.make} ${vehicle.model}`}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-700 ease-out ${
            unavailable
              ? "grayscale opacity-60"
              : "group-hover:scale-[1.04]"
          }`}
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

        {/* Availability badge */}
        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${
              unavailable
                ? "border-white/10 bg-black/40 text-white/45"
                : "border-white/15 bg-black/45 text-white"
            }`}
          >
            {availabilityLabel}
          </span>
        </div>

        {/* Vehicle type */}
        {vehicle.type && (
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              {vehicle.type}
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-white/10 bg-black/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-md">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Ruvasgod Auto
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {vehicle.make} {vehicle.model}
            </h2>

            <p className="mt-1.5 text-sm text-white/40">
              {vehicle.year} <span className="mx-1.5">•</span>{" "}
              {vehicle.type}
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-6 grid gap-2">
          {availableForSale &&
            vehicle.price !== undefined &&
            vehicle.price !== null && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Purchase
                </p>

                <p className="mt-1 text-base font-semibold text-white">
                  GHS {Number(vehicle.price).toLocaleString()}
                </p>
              </div>
            )}

          {availableForRent &&
            vehicle.rentalPricePerDay !== undefined &&
            vehicle.rentalPricePerDay !== null && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Rental
                </p>

                <p className="mt-1 text-base font-semibold text-white">
                  GHS{" "}
                  {Number(
                    vehicle.rentalPricePerDay
                  ).toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-white/35">
                    / day
                  </span>
                </p>
              </div>
            )}

          {unavailable && (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
              <p className="text-sm text-white/35">
                This vehicle is currently unavailable.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/vehicles/${vehicle._id}`}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition duration-300 ${
            unavailable
              ? "border border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
              : "bg-white text-black hover:bg-cyan-300 active:scale-[0.98]"
          }`}
        >
          <span>
            {unavailable ? "View Details" : "View Vehicle"}
          </span>

          <span
            aria-hidden="true"
            className="text-base transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export default VehicleCard;
