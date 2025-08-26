// src/components/BookingSuccessPage.jsx

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const BookingSuccessPage = () => {
  return (
    // Main container with a light background
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center border border-gray-100">
        {/* Success Icon with luxury amber color */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
          <CheckCircleIcon className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          Booking Request Sent!
        </h2>
        <p className="mt-2 text-gray-600">
          Your booking request has been sent successfully. We'll review and send a confirmation to your email.
        </p>
        <div className="mt-6">
          <Link
            to="/my-bookings"
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-sm shadow-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-300"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
