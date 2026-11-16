import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/customer/Dashboard";
import CarsPage from "./pages/public/CarsPage";
import CarDetailsPage from "./pages/public/CarDetailsPage";
import ContactPage from "./pages/public/Contact";
import ReviewsPage from "./pages/public/ReviewsPage";
import PricingPage from "./pages/public/PricingPage";
import MainLayout from "./layouts/MainLayout";

import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import UploadCarPage from "./pages/vendor/UploadCarPage";
import MyCarsPage from "./pages/vendor/MyCarsPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorSubscriptionPage from "./pages/vendor/VendorSubscriptionPage";
import VendorRoute from "./routes/VendorRoute";

import CustomerLayout from "./layouts/CustomerLayout";
import OrdersPage from "./pages/customer/OrdersPage";
import CheckoutPage from "./pages/customer/CheckOutPage";
import PaymentCallbackPage from "./pages/customer/PaymentCallbackPage";
import CustomerRoute from "./routes/CustomerRoute";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCarsPage from "./pages/admin/AdminCarsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import PaymentsPage from "./pages/admin/Payments";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoutes";
import GlobalTransactionLoader from "./components/common/GlobalTransactionLoader";
import ScrollToTopButton from "./components/common/ScrollToTopButton";

function App() {
  return (
    <BrowserRouter>
      <GlobalTransactionLoader />
      <ScrollToTopButton />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
                <ProfilePage />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <VendorRoute>
              <VendorLayout />
            </VendorRoute>
          }
        >
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/upload" element={<UploadCarPage />} />
          <Route path="/vendor/cars" element={<MyCarsPage />} />
          <Route path="/vendor/orders" element={<VendorOrdersPage />} />
          <Route path="/vendor/subscribe" element={<VendorSubscriptionPage />} />
        </Route>

        <Route
          element={
            <CustomerRoute>
              <CustomerLayout />
            </CustomerRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/checkout/car/:carId" element={<CheckoutPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
        </Route>

        <Route
          path="/payment/callback"
          element={
            <ProtectedRoute>
              <PaymentCallbackPage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/cars" element={<AdminCarsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/payments" element={<PaymentsPage />} />
          <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
        </Route>

        {/* ///////////////////////////////////////// */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
