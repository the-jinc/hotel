
import React from 'react';
import { StarIcon, SparklesIcon, WifiIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';

const AmenitiesSection = () => (
  <div className="py-16 bg-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-12">Indulge in Our Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center">
          <WifiIcon className="h-12 w-12 text-amber-600 mb-3" />
          <h3 className="text-xl font-semibold">Free High-Speed Wi-Fi</h3>
        </div>
        <div className="flex flex-col items-center">
          <SparklesIcon className="h-12 w-12 text-amber-600 mb-3" />
          <h3 className="text-xl font-semibold">Exceptional Service</h3>
        </div>
        <div className="flex flex-col items-center">
          <MapPinIcon className="h-12 w-12 text-amber-600 mb-3" />
          <h3 className="text-xl font-semibold">Prime Location</h3>
        </div>
        <div className="flex flex-col items-center">
          <StarIcon className="h-12 w-12 text-amber-600 mb-3" />
          <h3 className="text-xl font-semibold">Fine Dining</h3>
        </div>
      </div>
    </div>
  </div>
);

export default AmenitiesSection;
