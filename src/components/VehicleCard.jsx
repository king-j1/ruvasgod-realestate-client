import { Link } from "react-router-dom";

function VehicleCard({ vehicle }) {
  const image =
    vehicle.images?.length > 0
      ? vehicle.images[0]
      : "https://via.placeholder.com/600x400?text=Ruvasgod+Auto";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <img
        src={image}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="text-xl font-bold text-slate-900">
          {vehicle.make} {vehicle.model}
        </h2>

        <p className="mt-1 text-slate-500">
          {vehicle.year} • {vehicle.type}
        </p>

        <p className="mt-4 text-lg font-semibold">
          ${vehicle.rentalPricePerDay}/day
        </p>

        <Link
          to={`/vehicles/${vehicle._id}`}
          className="mt-4 block rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
        >
          View Vehicle
        </Link>
      </div>
    </div>
  );
}

export default VehicleCard;