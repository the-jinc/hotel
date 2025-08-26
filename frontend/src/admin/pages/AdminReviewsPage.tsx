import React, { useEffect, useState } from 'react';
import useReviewStore from '../../store/reviewStore';
import useRoomStore from '../../store/roomStore';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import {
  MagnifyingGlassIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const AdminReviewsPage = () => {
  const {
    reviews,
    loading,
    error,
    filters,
    fetchReviews,
    deleteReview,
    toggleReviewVisibility,
    setFilters,
    clearFilters
  } = useReviewStore();
  
  const { rooms, fetchRooms } = useRoomStore();
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchReviews();
  }, [fetchReviews, fetchRooms]);

  // Function to open the confirmation dialog
  const handleDelete = (reviewId) => {
    setReviewToDeleteId(reviewId);
    setIsDeleteConfirmOpen(true);
  };

  // Function to perform the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (reviewToDeleteId) {
      await deleteReview(reviewToDeleteId);
      setReviewToDeleteId(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  // The review data should already be filtered by the store,
  // so we just need to handle pagination here.
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Reviews Management</h1>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            />
          </div>
          
          {/* Rating filter */}
          <select
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Star{num !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          
          {/* Room Type filter */}
          <select
            name="roomTypeId"
            value={filters.roomTypeId}
            onChange={handleFilterChange}
            className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          >
            <option value="">All Room Types</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.type}
              </option>
            ))}
          </select>
          
          {/* Clear filters button */}
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          > 
            Clear
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-4 text-lg font-medium">Loading reviews...</p>
          </div>
        )}
        
        {/* Reviews table */}
        {!loading && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            {/* Empty state */}
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No reviews match your current filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {review.user?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {review.roomType?.type || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-900 font-medium">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div 
                            className="text-sm text-gray-600 max-w-xs truncate" 
                            title={review.comment}
                          >
                            {review.comment}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            review.isVisible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {review.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={review.isVisible}
                                onChange={() => toggleReviewVisibility(review.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                              title="Delete Review"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && reviews.length > reviewsPerPage && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-8">
            <p className="text-sm text-gray-700 mb-2 md:mb-0">
              Showing <span className="font-semibold">{indexOfFirstReview + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(indexOfLastReview, reviews.length)}</span> of{" "}
              <span className="font-semibold">{reviews.length}</span> results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Confirmation Modal for Deletion */}
      {reviewToDeleteId && (
        <ConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Review"
          message="Are you sure you want to permanently delete this review? This action cannot be undone."
          confirmText="Delete"
          isDestructive={true}
        />
      )}
    </div>
  );
};

export default AdminReviewsPage;
