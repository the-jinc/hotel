// src/components/FeaturedRooms.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useRoomStore from '../store/roomStore';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Renders a section showcasing a selection of featured rooms with a luxury theme.
 * Fetches room data from the `useRoomStore` and includes an image carousel for each room.
 */
const FeaturedRooms = () => {
  // Access state and actions from the Zustand store
  const { rooms, fetchRooms } = useRoomStore();
  
  // State to manage the current image index for each room's carousel
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  // Fetch rooms data on component mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Initialize or update image indices when rooms data changes
  useEffect(() => {
    const indices = {};
    rooms.forEach(room => {
      if (room.id) {
        indices[room.id] = 0;
      }
    });
    setCurrentImageIndices(indices);
  }, [rooms]);

  // Filter and select up to 3 featured rooms that have a valid ID
  const featured = rooms.filter(room => room.id).slice(0, 3);

  // Function to move to the next image in a room's carousel
  const nextImage = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.images) return;
    
    setCurrentImageIndices(prev => ({
      ...prev,
      [roomId]: (prev[roomId] + 1) % room.images.length
    }));
  };

  // Function to move to the previous image in a room's carousel
  const prevImage = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room.images) return;
    
    setCurrentImageIndices(prev => ({
      ...prev,
      [roomId]: (prev[roomId] - 1 + room.images.length) % room.images.length
    }));
  };

  return (
    // Updated container for a light, luxurious background
    <div className="py-16 bg-white text-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Featured Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map(room => (
            <motion.div 
              key={room.id}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
            >
              {/* Image Carousel */}
              <div className="relative h-48 w-full bg-gray-200">
                {room.images?.length > 0 ? (
                  <>
                    <img
                      src={room.images[currentImageIndices[room.id] || 0]}
                      alt={room.type}
                      className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                    />
                    
                    {/* Navigation Arrows - Darker background for visibility */}
                    {room.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(room.id);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-gray-100 p-2 rounded-full hover:bg-opacity-60 transition-all"
                          aria-label="Previous image"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(room.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-gray-100 p-2 rounded-full hover:bg-opacity-60 transition-all"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndices(prev => ({
                                ...prev,
                                [room.id]: index
                              }));
                            }}
                            className={`h-2 w-2 rounded-full transition-all ${currentImageIndices[room.id] === index ? 'bg-amber-500 w-4' : 'bg-gray-300 bg-opacity-50'}`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏨</div>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{room.type}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {room.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-amber-500">
                    ${room.price}/night
                  </span>
                  <Link 
                    to={`/rooms/${room.id}`} 
                    className="hidden md:flex items-center bg-amber-600 text-white px-6 py-3 rounded-sm hover:bg-amber-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedRooms;
