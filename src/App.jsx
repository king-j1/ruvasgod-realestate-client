import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import MyPurchases from "./pages/MyPurchases.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminVehicles from "./pages/AdminVehicles.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";
import PaymentCallback from "./pages/PaymentCallback.jsx";
import PaymentCallbackSale from "./pages/PaymentCallbackSale.jsx";


import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />

        {/* Customer */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-purchases"
          element={
            <ProtectedRoute>
              <MyPurchases />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute adminOnly>
              <AdminVehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/callback"
          element={
            <ProtectedRoute>
              <PaymentCallback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/sale/callback"
          element={
            <ProtectedRoute>
              <PaymentCallbackSale />
            </ProtectedRoute>
          }
        />
        
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;