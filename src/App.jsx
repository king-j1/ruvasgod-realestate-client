
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell.jsx";
import StaffLayout from "./components/StaffLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import MyPurchases from "./pages/MyPurchases.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminVehicles from "./pages/AdminVehicles.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";

import PaymentCallback from "./pages/PaymentCallback.jsx";
import PaymentCallbackSale from "./pages/PaymentCallbackSale.jsx";

import StaffDashboard from "./pages/StaffDashboard.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import StaffCustomers from "./pages/StaffCustomers.jsx";
import StaffVehicles from "./pages/StaffVehicles.jsx";
import StaffBookings from "./pages/StaffBookings.jsx";
import StaffSales from "./pages/StaffSales.jsx";
import StaffPayments from "./pages/StaffPayments.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StaffRoute from "./components/StaffRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>

          {/* =========================
              PUBLIC WEBSITE
          ========================= */}

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/vehicles" element={<Vehicles />} />

          <Route
            path="/vehicles/:id"
            element={<VehicleDetails />}
          />


          {/* =========================
              CUSTOMER
          ========================= */}

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


          {/* =========================
              ADMIN
          ========================= */}

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


          {/* =========================
              PAYMENTS
          ========================= */}

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


          {/* =========================
              STAFF PORTAL
          ========================= */}

          <Route
            path="/staff"
            element={
              <StaffRoute>
                <StaffLayout />
              </StaffRoute>
            }
          >

            {/* /staff */}
            <Route
              index
              element={<StaffDashboard />}
            />

            {/* /staff/dashboard */}
            <Route
              path="dashboard"
              element={<StaffDashboard />}
            />


            {/* /staff/staff */}
            <Route
              path="staff"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffManagement />
                </StaffRoute>
              }
            />


            {/* /staff/customers */}
            <Route
              path="customers"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "sales",
                    "rental",
                  ]}
                >
                  <StaffCustomers />
                </StaffRoute>
              }
            />


            {/* /staff/vehicles */}
            <Route
              path="vehicles"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "vehicle_manager",
                  ]}
                >
                  <StaffVehicles />
                </StaffRoute>
              }
            />


            {/* /staff/bookings */}
            <Route
              path="bookings"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "rental",
                    "finance",
                  ]}
                >
                  <StaffBookings />
                </StaffRoute>
              }
            />


            {/* /staff/sales */}
            <Route
              path="sales"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "sales",
                    "finance",
                  ]}
                >
                  <StaffSales />
                </StaffRoute>
              }
            />


            {/* /staff/payments */}
            <Route
              path="payments"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "finance",
                  ]}
                >
                  <StaffPayments />
                </StaffRoute>
              }
            />

          </Route>

        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
