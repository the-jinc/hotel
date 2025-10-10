import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestLayout from "@/components/GuestLayout";
import StaffLayout from "@/components/StaffLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import RoomDetailsPage from "@/pages/RoomDetailsPage";
import CheckoutPage from "@/pages/CheckoutPage";
import BookingSuccessPage from "@/pages/BookingSuccessPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import StaffBookingManagementPage from "@/pages/StaffBookingManagementPage";
import DashboardPage from "@/pages/DashboardPage";
import RoomCategoriesPage from "@/pages/RoomCategoriesPage";
import RoomsPage from "@/pages/RoomsPage";
import MenuPage from "@/pages/MenuPage";
import FoodCheckoutPage from "@/pages/FoodCheckoutPage";
import MyFoodOrdersPage from "@/pages/MyFoodOrdersPage";
import FoodCategoriesManagementPage from "@/pages/FoodCategoriesManagementPage";
import FoodItemsManagementPage from "@/pages/FoodItemsManagementPage";
import FoodOrdersManagementPage from "@/pages/FoodOrdersManagementPage";
import UsersManagementPage from "@/pages/UsersManagementPage";
import AuditLogPage from "@/pages/AuditLogPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Helper function to determine redirect path after login
  const getRedirectPath = () => {
    if (!user) return "/";

    // Staff roles go to dashboard
    if (["admin", "manager", "receptionist"].includes(user.role)) {
      return "/dashboard";
    }

    // Guests go to home page
    return "/";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-yellow-200 text-center py-2 text-sm font-medium border-b border-yellow-300">
        This website is in development. It is not production ready, and bugs are expected.
      </div>
      <Router>
        <div className="App">
          <Routes>
            {/* Authentication routes - outside layouts */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={getRedirectPath()} replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to={getRedirectPath()} replace />
                ) : (
                  <RegisterPage />
                )
              }
            />

            {/* Guest Layout Routes */}
            <Route path="/" element={<GuestLayout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="rooms/:categoryId" element={<RoomDetailsPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route
                path="food-checkout"
                element={
                  <ProtectedRoute>
                    <FoodCheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-food-orders"
                element={
                  <ProtectedRoute>
                    <MyFoodOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="booking-success"
                element={
                  <ProtectedRoute>
                    <BookingSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Staff Layout Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute
                  requiredRoles={["admin", "manager", "receptionist"]}
                >
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="staff/bookings"
                element={<StaffBookingManagementPage />}
              />

              {/* Admin/Manager Room Management */}
              <Route
                path="admin/room-categories"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <RoomCategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/rooms"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin User Management */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Audit Logs */}
              <Route
                path="admin/audit-logs"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />

              {/* Food Management */}
              <Route
                path="admin/food-categories"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <FoodCategoriesManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/food-items"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <FoodItemsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="staff/food-orders"
                element={
                  <ProtectedRoute
                    requiredRoles={["admin", "manager", "receptionist"]}
                  >
                    <FoodOrdersManagementPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all - redirect to home for public, dashboard for authenticated */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
