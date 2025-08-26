import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import UserPage from "./pages/BookNowPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import useAuthStore from "./store/authStore";
import UsersPage from "./admin/pages/UsersPage";
import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/layout/AdminLayout';
import RoomsPage from './admin/pages/RoomsPage';
import BooksPage from './admin/pages/BookingPage';
import AdminDiningPage from './admin/pages/DiningPage';
import AdminAvailabilityPage from './admin/pages/AdminAvailabilityPage';
import AdminReviewsPage from './admin/pages/AdminReviewsPage';
import AdminHomePage from './admin/pages/AdminDashboard';
import UserLayout from './components/UserLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import RoomDetailPage from './pages/RoomDetailPage';
import GalleryPage from './pages/GalleryPage';
import RoomsAndSuitesPage from './pages/RoomsAndSuitesPAge';
import DiningPage from './pages/DiningPage';
import MeetingsAndEventsPage from './admin/pages/MeetingAndEventsPage';
import MeetingsEventsPage from './pages/MeetingsPage';
import BookNowPage from './pages/BookNowPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingSuccessPage from './pages/BookingSuccessPage';

export default function App(): React.ReactElement {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!isInitialized) {
    return <div className="p-6 text-center">Loading...</div>; // or a spinner
  }

  return (
    <Router>
      <Routes>
        {/* User-facing routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/rooms" element={<RoomsAndSuitesPage />} />
          <Route path="/dining" element={<DiningPage />} />
          <Route path="/meetings" element={<MeetingsEventsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/book" element={<BookNowPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          
          <Route
            path="/userpage"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminHomePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="dinings" element={<AdminDiningPage />} />
          <Route path="meetings" element={<MeetingsAndEventsPage />} />
          <Route path="bookings" element={<BooksPage />} />
          <Route path="availability" element={<AdminAvailabilityPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>

        {/* Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}
