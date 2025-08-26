import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useMeetingsEventsStore from '../store/meetingAndEventsStore'; // Adjust the import path as needed

// Reusable Carousel component
const Carousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden">
      <img
        src={images[currentImageIndex]}
        alt="Event space"
        className="w-full h-[400px] object-cover transition-opacity duration-500 ease-in-out"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 text-gray-800 rounded-full hover:bg-white transition-colors duration-300 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 text-gray-800 rounded-full hover:bg-white transition-colors duration-300 z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

const MeetingsEventsPage = () => {
  const { 
    meetingsAndEvents, 
    meetingsAndEventsLoading, 
    meetingsAndEventsError, 
    fetchMeetingsAndEvents 
  } = useMeetingsEventsStore();

  useEffect(() => {
    fetchMeetingsAndEvents();
  }, [fetchMeetingsAndEvents]);

  if (meetingsAndEventsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (meetingsAndEventsError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center p-4 max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Error loading events</h3>
          <p>{meetingsAndEventsError}</p>
          <button 
            onClick={fetchMeetingsAndEvents}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 text-gray-800 font-sans min-h-screen py-16"
    >
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-serif text-amber-500 tracking-tight mb-4">
            Meetings & Events
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Host your next corporate meeting, social gathering, or special celebration in our versatile event spaces.
          </p>
        </div>

        {meetingsAndEvents.length === 0 && !meetingsAndEventsLoading ? (
          <div className="text-center mt-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mt-4 text-gray-600">No event spaces available</h3>
            <p className="text-gray-500 mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {meetingsAndEvents.map((event, index) => (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
              >
                <Carousel images={event.images || [
                  `https://placehold.co/1000x600/C29F5D/ffffff?text=${encodeURIComponent(event.name)}`
                ]} />
                <div className="p-6">
                  <h2 className="text-2xl font-semibold font-serif text-gray-800 mb-2">
                    {event.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {event.description || 'Perfect for your next event.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      {event.eventType || 'Event Space'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Capacity: {event.capacity || 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MeetingsEventsPage;