import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StaffLayout from "./components/StaffLayout.jsx";
import StaffRoute from "./components/StaffRoute.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import PropertyViewingPaymentCallback from "./pages/PropertyViewingPaymentCallback.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import StaffCustomers from "./pages/StaffCustomers.jsx";
import StaffPropertyEnquiries from "./pages/StaffPropertyEnquiries.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import StaffProperties from "./pages/StaffProperties.jsx";
import StaffPropertyCreate from "./pages/StaffPropertyCreate.jsx";
import StaffPropertyDetails from "./pages/StaffPropertyDetails.jsx";
import StaffPropertyEdit from "./pages/StaffPropertyEdit.jsx";
import StaffPropertyVerification from "./pages/StaffPropertyVerification.jsx";
import CustomerAccount from "./pages/CustomerAccount.jsx";
import StaffCustomerDetails from "./pages/StaffCustomerDetails.jsx";
import StaffOwners from "./pages/StaffOwners.jsx";
import StaffOwnerCreate from "./pages/StaffOwnerCreate.jsx";
import StaffOwnerDetails from "./pages/StaffOwnerDetails.jsx";
import StaffPropertyViewings from "./pages/StaffPropertyViewings";
import CustomerKyc from "./pages/CustomerKyc.jsx";
import CustomerAgreements from "./pages/CustomerAgreements.jsx";
import CustomerAgreementDetails from "./pages/CustomerAgreementDetails.jsx";
import CustomerInstallments from "./pages/CustomerInstallments.jsx";
import StaffPaymentQueue from "./pages/StaffPaymentQueue.jsx";
import StaffInstallments from "./pages/StaffInstallments.jsx";
import StaffAgreementCreate from "./pages/StaffAgreementCreate.jsx";
import StaffAgreementTemplates from "./pages/StaffAgreementTemplates.jsx";

const REAL_ESTATE_STAFF_ROLES = [
  "admin",
  "manager",
  "sales",
  "rental",
  "finance",
];

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route
            path="/property-viewing/payment/callback"
            element={<PropertyViewingPaymentCallback />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/kyc"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerKyc />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/agreements"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerAgreements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/agreements/:id"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerAgreementDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/installments"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerInstallments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-requests"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Navigate to="/account" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <StaffRoute roles={["admin"]}>
                <Navigate to="/staff/dashboard" replace />
              </StaffRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <StaffRoute roles={REAL_ESTATE_STAFF_ROLES}>
                <StaffLayout />
              </StaffRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route
              path="properties"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffProperties />
                </StaffRoute>
              }
            />
            <Route
              path="finance"
              element={
                <StaffRoute roles={["admin", "manager", "finance"]}>
                  <StaffPaymentQueue />
                </StaffRoute>
              }
            />

            <Route
              path="installments"
              element={
                <StaffRoute roles={["admin", "manager", "finance"]}>
                  <StaffInstallments />
                </StaffRoute>
              }
            />
            <Route
              path="property-verification"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffPropertyVerification />
                </StaffRoute>
              }
            />
            <Route
              path="properties/new"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffPropertyCreate />
                </StaffRoute>
              }
            />
            <Route
              path="properties/:id"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffPropertyDetails />
                </StaffRoute>
              }
            />
            <Route
              path="properties/:id/edit"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffPropertyEdit />
                </StaffRoute>
              }
            />
            <Route
              path="staff"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffManagement />
                </StaffRoute>
              }
            />
            <Route
              path="property-enquiries"
              element={
                <StaffRoute roles={["admin", "manager", "sales", "rental"]}>
                  <StaffPropertyEnquiries />
                </StaffRoute>
              }
            />
            <Route
              path="customers"
              element={
                <StaffRoute roles={["admin", "manager", "sales", "rental"]}>
                  <StaffCustomers />
                </StaffRoute>
              }
            />
            <Route
              path="customers/:id"
              element={
                <StaffRoute roles={["admin", "manager", "sales", "rental"]}>
                  <StaffCustomerDetails />
                </StaffRoute>
              }
            />
            <Route
              path="owners"
              element={
                <StaffRoute roles={["admin"]}>
                  <StaffOwners />
                </StaffRoute>
              }
            />
            <Route
              path="owners/new"
              element={
                <StaffRoute roles={["admin"]}>
                  <StaffOwnerCreate />
                </StaffRoute>
              }
            />
            <Route
              path="owners/:id"
              element={
                <StaffRoute roles={["admin"]}>
                  <StaffOwnerDetails />
                </StaffRoute>
              }
            />
            <Route
              path="property-viewings"
              element={
                <StaffRoute
                  roles={[
                    "admin",
                    "manager",
                    "property_manager",
                    "sales",
                    "rental",
                  ]}
                >
                  <StaffPropertyViewings />
                </StaffRoute>
              }
            />
            <Route
              path="agreements/new"
              element={
                <StaffRoute roles={["admin", "manager", "sales", "rental"]}>
                  <StaffAgreementCreate />
                </StaffRoute>
              }
            />
            <Route
              path="agreements/templates"
              element={
                <StaffRoute roles={["admin", "manager"]}>
                  <StaffAgreementTemplates />
                </StaffRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
