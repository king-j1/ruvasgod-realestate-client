import { useEffect, useState } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get("/vehicles");
        setVehicles(response.data.vehicles);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load vehicles"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">
          Our Vehicles
        </h1>

        <p className="mb-8 text-slate-500">
          Browse our available vehicles for sale and rental.
        </p>

        {vehicles.length === 0 ? (
          <p>No vehicles available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Vehicles;