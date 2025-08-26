import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
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
            About Hotel Paradise
          </h1>
          <p className="text-lg text-gray-600">Your Ultimate Destination for Luxury and Comfort.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://placehold.co/800x500/C29F5D/ffffff?text=Hotel+Lobby"
              alt="Hotel Lobby"
              className="rounded-xl shadow-lg w-full transform transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold font-serif text-gray-800 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2010, Hotel Paradise was built with a singular vision: to provide an unparalleled guest experience that blends modern luxury with timeless elegance. Nestled in the heart of Paradise City, our hotel offers breathtaking views and world-class amenities.
            </p>
            <p className="text-gray-600">
              We believe in the art of hospitality. Our dedicated staff is committed to ensuring every moment of your stay is perfect, from our meticulously designed rooms to our gourmet dining options. We are more than just a hotel; we are a destination for creating lasting memories.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-semibold font-serif text-gray-800 mb-6">Our Mission</h2>
          <p className="max-w-3xl mx-auto text-gray-600">
            To be the leading provider of luxury accommodation and exceptional service in the region, creating a welcoming and comfortable environment where every guest feels valued and pampered. We strive for excellence in all we do, ensuring a sustainable and responsible approach to hospitality.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
