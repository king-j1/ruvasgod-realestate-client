import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  const image =
    vehicle.images?.length > 0
      ? vehicle.images[0]
      : "https://via.placeholder.com/600x400?text=Ruvasgod+Auto";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-slate-200/70 bg-slate-100/80 p-3">
        <img
          src={image}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-contain transition duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">
          {vehicle.make} {vehicle.model}
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {vehicle.year} • {vehicle.type}
        </p>

        <div className="mt-5 space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm">
          {vehicle.availableForSale && vehicle.price !== undefined && (
            <p className="font-semibold text-slate-800">
              Sale: GHS {vehicle.price}
            </p>
          )}

          {vehicle.availableForRent &&
            vehicle.rentalPricePerDay !== undefined && (
              <p className="font-semibold text-slate-800">
                Rental: GHS {vehicle.rentalPricePerDay}/day
              </p>
            )}

          {!vehicle.availableForSale && !vehicle.availableForRent && (
            <p className="text-slate-500">Currently unavailable</p>
          )}
        </div>

        <Link
          to={`/vehicles/${vehicle._id}`}
          className="mt-5 block rounded-lg bg-slate-950 px-4 py-3 text-center font-semibold text-white transition duration-300 ease-out hover:bg-slate-800 active:scale-[0.98]"
        >
          View Vehicle
        </Link>
      </div>
    </div>
  );
}

export default VehicleCard;