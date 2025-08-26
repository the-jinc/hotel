// pages/RoomsAndSuitesPage.js
// This component displays a list of all available rooms and suites.

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useRoomStore from '../store/roomStore';

const RoomsAndSuitesPage = () => {
  // Access the list of rooms and the fetchRooms action from the Zustand store
  const { rooms, loading, error, fetchRooms } = useRoomStore();

  // Fetch all rooms from the store when the component first mounts
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle the loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-800 font-sans">
        <p className="text-xl text-gray-600">Loading rooms and suites...</p>
      </div>
    );
  }

  // Handle any errors that may occur during the fetch
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-800 font-sans">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Handle the case where there are no rooms to display
  if (!rooms.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-800 font-sans">
        <p className="text-xl text-gray-600">No rooms or suites are available at this time.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 text-gray-800 min-h-screen font-sans py-16"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold font-serif text-center text-amber-500 tracking-tight mb-12">
          Rooms & Suites
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <motion.div
              // The `key` prop is essential for React to uniquely identify each item in a list
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105"
            >
              <img
                src={room.images && room.images.length > 0 ? room.images[0].url : 'https://placehold.co/600x400/C29F5D/ffffff?text=Room+Image'}
                alt={room.type}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold font-serif text-gray-800 mb-2">{room.type}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold text-lg">${room.price} / night</span>
                  {/* Dynamic link to the specific room's detail page */}
                  <Link
                    to={`/rooms/${room.id}`}
                    className="bg-amber-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-amber-500 transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RoomsAndSuitesPage;
