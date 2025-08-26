import React, { useState } from "react";
import axios from "axios";
import { 
  XMarkIcon, 
  StarIcon, 
  TrashIcon, 
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import ConfirmationDialog from './ConfirmationDialog';

export default function RoomDetailModal({ room, onClose, currentUser }) {
  const [localReviews, setLocalReviews] = useState(room?.reviews || []);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!room) return null;

  const handleDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    
    setIsConfirmDeleteOpen(false);
    
    try {
      await axios.delete(`/api/reviews/${reviewToDelete}`);
      setLocalReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewToDelete));
      toast.success("Review deleted successfully!");
      setReviewToDelete(null);
    } catch (err) {
      console.error("Failed to delete review", err);
      toast.error("Failed to delete review. Please try again.");
    }
  };

  // Carousel navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === room.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? room.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
     <div className="fixed inset-0 modal-overlay flex justify-center items-center z-[1000] p-4 animate-fade-in" aria-modal="true" role="dialog" onClick={onClose}>
         <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Image Carousel */}
          <div className="relative mb-6">
            {room.images?.length > 0 ? (
              <div className="relative w-full h-64 overflow-hidden rounded-lg shadow-md">
                <img
                  src={room.images[currentImageIndex]}
                  alt={`Room image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Image Indicators */}
                {room.images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {room.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-4' : 'bg-white bg-opacity-50'}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 shadow-md">
                <PhotoIcon className="h-16 w-16" />
              </div>
            )}
          </div>

          <h2 id="modal-title" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            {room.type} Room
          </h2>

          {/* Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-700">
                <strong>Price:</strong> <span className="font-semibold text-lg text-blue-600">${room.price}</span> per night
              </p>
              <p className="text-gray-700">
                <strong>Quantity:</strong> {room.quantity} available
              </p>
            </div>
            <p className="col-span-full text-gray-600 italic">"{room.description}"</p>
          </div>

          <hr className="my-4" />

          {/* Reviews Section */}
          <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-900">
            <StarIcon className="h-5 w-5 text-yellow-400 mr-2" /> Reviews
          </h3>
          {localReviews.length > 0 ? (
            <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {localReviews.map((review) => (
                <li key={review.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-800">{review.user.name}</span>
                      <span className="ml-2 text-yellow-500 flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" /> {review.rating}
                      </span>
                    </div>
                    {currentUser?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        aria-label="Delete review"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 italic mb-1">"{review.comment}"</p>
                  <small className="text-gray-400">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No reviews for this room yet.</p>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Review Deletion */}
      <ConfirmationDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Review Deletion"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </>
  );
}

 