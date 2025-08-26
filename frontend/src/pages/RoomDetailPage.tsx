import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import useReviewStore from '../store/reviewStore';
import { motion } from 'framer-motion';
import { StarIcon, UsersIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const RoomDetailPage = () => {
  const { id } = useParams();
  const { room, loading: roomLoading, error: roomError, fetchRoomById } = useRoomStore();
  const { reviews, loading: reviewsLoading, error: reviewsError, fetchReviewsByRoomId } = useReviewStore();
  const navigate = useNavigate();
  const roomReviews = reviews.filter(review => review.roomTypeId === Number(id));

  useEffect(() => {
    if (id) {
      fetchRoomById(Number(id));
      fetchReviewsByRoomId(Number(id));
    }
  }, [id, fetchRoomById, fetchReviewsByRoomId]);

   const handleBookNowClick = () => {

      navigate('/book');
    
  };

  if (roomLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-gray-800 font-sans">
        <p className="text-xl">Loading room details...</p>
      </div>
    );
  }

  if (roomError || reviewsError) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-gray-800 font-sans">
        <p className="text-xl text-red-500">Error: {roomError || reviewsError}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-gray-800 font-sans">
        <p className="text-xl">Room not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white text-gray-800 min-h-screen font-sans"
    >
      <div className="container mx-auto px-4 py-16">
        {/* Room Header and Image Gallery */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-amber-600 tracking-tight mb-4">
            {room.type}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {room.description}
          </p>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={room.imageUrl || "https://placehold.co/1200x600/C29F5D/ffffff?text=No+Image+Available"}
              alt={room.type}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Room Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-gray-50 rounded-xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold font-serif text-gray-800 mb-6">Room Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600">
              <div className="flex items-center">
                <UsersIcon className="h-6 w-6 text-amber-500 mr-4" />
                <span>Quantity Available: {room.quantity}</span>
              </div>
              <div className="flex items-center">
                <CalendarDaysIcon className="h-6 w-6 text-amber-500 mr-4" />
                <span>Available: 24/7</span>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{room.description}</p>
            </div>
          </motion.div>

          {/* Booking Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-amber-500 rounded-xl shadow-lg p-8 text-white flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl font-bold font-serif">${room.price}</span>
              <span className="text-sm"> / night</span>
              <p className="text-lg mt-4">
                This room offers the perfect blend of comfort and style.
                Book now to secure your stay.
              </p>
            </div>
            <button onClick={handleBookNowClick} className="mt-6 w-full bg-white text-amber-600 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition duration-300 transform hover:scale-105">
              Book This Room
            </button>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="py-12">
          <h2 className="text-3xl font-bold font-serif text-center text-gray-800 mb-12">
            Guest Reviews
          </h2>
          {roomReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roomReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="bg-gray-50 p-8 rounded-xl shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500 overflow-hidden mr-4 flex items-center justify-center text-white font-bold">
                      {review.user?.name?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{review.user?.name || 'Guest'}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{review.comment}"</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 italic">
              No reviews available yet for this room.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoomDetailPage;