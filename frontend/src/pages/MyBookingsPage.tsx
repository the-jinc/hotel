import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useBookingStore from "../store/bookingStore";
import useReviewStore from "../store/reviewStore";
import {
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { myBookings, fetchMyBookings, updateBookingStatus, loading, error } =
    useBookingStore();
  const { createReview } = useReviewStore();

  // State for cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // State for review functionality
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleShowCancelModal = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!bookingToCancel) return;

    try {
      await updateBookingStatus(bookingToCancel, "Cancelled");
      toast.success("Booking cancelled successfully");
    } catch (err: any) {
      toast.error("Failed to cancel booking");
    } finally {
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  const handleSubmitReview = async (bookingId: string, roomTypeId: string) => {
    try {
      await createReview({
        roomTypeId: roomTypeId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      toast.success("Review submitted successfully!");
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  const canReviewBooking = (booking: Booking) => {
    const isPastBooking = new Date(booking.checkOut) < new Date();
    return booking.status === "Confirmed" && isPastBooking;
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow-sm">
            <CheckIcon className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm">
            <XMarkIcon className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 shadow-sm">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-lg text-gray-600">
            View and manage your upcoming stays
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : myBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You don't have any bookings yet.</p>
            <button
              onClick={() => navigate("/book")}
              className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
            >
              Book a Room
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-xl overflow-hidden rounded-lg border border-gray-100">
            <ul className="divide-y divide-gray-200">
              {myBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {booking.roomType?.type || "Unknown Room Type"}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 inline mr-1 text-gray-400" />
                          {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.nights} night
                          {booking.nights !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          ${booking.roomPrice?.toFixed(2) || "0.00"} per night
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          Total: ${booking.totalPrice?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      {booking.status === "Pending" && (
                        <button
                          onClick={() => handleShowCancelModal(booking.id)}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setShowReviewForm(
                            showReviewForm === booking.id ? null : booking.id
                          )
                        }
                        disabled={!canReviewBooking(booking)}
                        className={`px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          canReviewBooking(booking)
                            ? "border-amber-500 text-amber-700 bg-amber-100 hover:bg-amber-200 focus:ring-amber-500"
                            : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                        }`}
                      >
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        {showReviewForm === booking.id
                          ? "Cancel Review"
                          : "Give Review"}
                      </button>
                    </div>

                    {showReviewForm === booking.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Share your experience
                        </h4>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                          </label>
                          <select
                            value={reviewData.rating}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                rating: parseInt(e.target.value),
                              })
                            }
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                          >
                            {[5, 4, 3, 2, 1].map((num) => (
                              <option key={num} value={num}>
                                {num} Star{num !== 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                          </label>
                          <textarea
                            rows={3}
                            value={reviewData.comment}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                comment: e.target.value,
                              })
                            }
                            className="shadow-sm focus:ring-amber-500 focus:border-amber-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Tell us about your stay..."
                          />
                        </div>

                        <button
                          onClick={() =>
                            handleSubmitReview(booking.id, booking.roomType.id)
                          }
                          disabled={!reviewData.comment.trim()}
                          className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                            reviewData.comment.trim()
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-amber-300 cursor-not-allowed"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-sm">
              <div className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <XMarkIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">
                    Cancel Booking
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this booking? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 space-y-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-sm border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                    onClick={handleCancel}
                  >
                    Confirm Cancellation
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-sm border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
