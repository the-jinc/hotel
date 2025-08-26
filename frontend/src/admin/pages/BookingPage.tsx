import { useEffect, useState } from "react";
import useBookingStore from "../../store/bookingStore";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import {
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function BookingsPage() {
  const {
    bookings,
    total,
    page,
    limit,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    fetchBookings,
    deleteBooking,
    updateBookingStatus,
    loading,
    error,
  } = useBookingStore();

  const [searchInput, setSearchInput] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatusToUpdate, setNewStatusToUpdate] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [page, search, statusFilter]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Function to initiate the status change confirmation dialog
  const handleStatusChange = (booking, newStatus) => {
    if (newStatus === booking.status) return;
    setBookingToUpdate(booking);
    setNewStatusToUpdate(newStatus);
    setIsStatusConfirmOpen(true);
  };

  // Function to perform the actual status update after confirmation
  const handleConfirmStatusChange = async () => {
    if (bookingToUpdate && newStatusToUpdate) {
      await updateBookingStatus(bookingToUpdate.id, newStatusToUpdate);
      setBookingToUpdate(null);
      setNewStatusToUpdate(null);
      setIsStatusConfirmOpen(false);
    }
  };

  // Function to initiate the delete confirmation dialog
  const handleDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteConfirmOpen(true);
  };

  // Function to perform the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (bookingToDelete) {
      await deleteBooking(bookingToDelete.id);
      setBookingToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case "confirmed":
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case "cancelled":
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 sm:p-6 lg:p-10 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-6">
        {/* Header and Controls */}
        {/* Uses flex-col on small screens and flex-row on medium screens and up */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Booking Management</h2>
        </div>

        {/* Search and Filter */}
        {/* Uses flex-col on small screens and flex-row on medium screens and up */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative w-full md:w-auto md:flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user, email, or room..."
              value={searchInput}
              onChange={handleSearch}
              // The input is w-full on all screen sizes to ensure it fills the container
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            />
          </div>
          {/* The select box is w-full on small screens for better usability */}
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* State Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ArrowPathIcon className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-base sm:text-lg font-medium">Loading bookings...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm" role="alert">
            <ExclamationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Error fetching data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        {/* The table is wrapped in overflow-x-auto to handle horizontal scrolling on small screens */}
        {!loading && !error && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* The headers use a slightly smaller font on small screens */}
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{b.user.name}</div>
                        <div className="text-xs text-gray-500">{b.user.email}</div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{b.roomType.type}</div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{new Date(b.checkIn).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{new Date(b.checkOut).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b, e.target.value)}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors duration-200
                              ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                              ${b.status !== 'pending' ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                            disabled={b.status !== 'pending'}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDelete(b)}
                            className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                            title="Delete Booking"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 sm:px-6 sm:py-6 text-center text-gray-500 italic">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {/* The pagination controls stack vertically on small screens and horizontally on medium screens */}
        {!loading && !error && total > limit && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-8">
            <p className="text-sm text-gray-700 mb-2 md:mb-0 text-center md:text-left">
              Showing <span className="font-semibold">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
              <span className="font-semibold">{Math.min(total, page * limit)}</span> of{" "}
              <span className="font-semibold">{total}</span> results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Confirmation Modals */}
      {bookingToDelete && (
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Booking"
          message="Are you sure you want to permanently delete this booking? This action cannot be undone."
          confirmText="Delete"
          isDestructive={true}
        />
      )}
      {bookingToUpdate && (
        <ConfirmationDialog
          isOpen={isStatusConfirmOpen}
          onClose={() => setIsStatusConfirmOpen(false)}
          onConfirm={handleConfirmStatusChange}
          title="Update Booking Status"
          message={
            newStatusToUpdate === "confirmed"
              ? "Are you sure you want to confirm this booking?"
              : "Are you sure you want to change the booking status to cancelled?"
          }
          confirmText="Confirm"
        />
      )}
    </div>
  );
}
