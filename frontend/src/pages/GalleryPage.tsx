import React from 'react';
import { motion } from 'framer-motion';

// Using placeholder image URLs to ensure the component renders correctly
const images = [
  { id: 1, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Hotel+Exterior', alt: 'Luxury hotel exterior' },
  { id: 2, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Hotel+Lobby', alt: 'Elegant hotel lobby' },
  { id: 3, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Modern+Room', alt: 'Modern hotel room' },
  { id: 4, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Poolside+View', alt: 'Poolside view' },
  { id: 5, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Restaurant', alt: 'Hotel restaurant' },
  { id: 6, src: 'https://placehold.co/800x600/C29F5D/ffffff?text=Spacious+Suite', alt: 'Spacious hotel suite' },
];

const GalleryPage = () => {
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
            Our Gallery
          </h1>
          <p className="text-lg text-gray-600">A Glimpse Into Our World of Luxury</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              className="overflow-hidden rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover aspect-video"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryPage;
