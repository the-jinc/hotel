
import React from 'react';
import { Link } from 'react-router-dom';

const GalleryCTA = () => (
  <div className="py-16 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold font-serif text-gray-800 mb-4">See Our Hotel in a New Light</h2>
      <p className="text-lg text-gray-600 mb-8">View our stunning gallery and envision your perfect stay.</p>
      <Link to="/gallery" className="inline-block bg-amber-600 text-white font-bold py-3 px-8 rounded-full hover:bg-amber-700 transition duration-300 transform hover:scale-105 shadow-lg">
          View Gallery
      </Link>
  </div>
);

export default GalleryCTA;