import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CalendarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useRoomStore from '../store/roomStore';
import useBookingStore from '../store/bookingStore';
import useAuthStore from '../store/authStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PhotoIcon } from '@heroicons/react/24/outline';

const BookNowPage = () => {
  const navigate = useNavigate();
  const { rooms, fetchRooms, fetchAvailabilityCalendar, availabilityCalendar } = useRoomStore();
  const { createBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    return selectedRoom.price * calculateNights();
  };

  const checkAvailability = async () => {
  if (!checkIn || !checkOut) {
    toast.error('Please select both check-in and check-out dates');
    return;
  }

  if (checkOut <= checkIn) {
    toast.error('Check-out date must be after check-in date');
    return;
  }

  try {
    setIsLoading(true);
    
    // Format dates for API call
    const formattedCheckIn = checkIn.toISOString().split('T')[0];
    const formattedCheckOut = checkOut.toISOString().split('T')[0];
    
    // Fetch availability data and wait for it to complete
    await fetchAvailabilityCalendar(formattedCheckIn, formattedCheckOut);

    // Add a small delay to ensure the store has updated
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now process the data
    processAvailabilityData(formattedCheckIn, formattedCheckOut);
    
  } catch (error) {
    console.error('Error:', error);
    toast.error(error.message || 'Failed to check availability. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

const processAvailabilityData = (startDate, endDate) => {
  // Get the latest availabilityCalendar from the store
  const currentAvailability = useRoomStore.getState().availabilityCalendar;
  
  if (!currentAvailability || Object.keys(currentAvailability).length === 0) {
    toast.error('Availability data not loaded yet');
    return;
  }

  // Get all dates in the range
  const datesInRange = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  while (currentDate <= endDateObj) {
    datesInRange.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Find room types that are available for ALL dates in the range
  const availableRoomTypes = Object.keys(currentAvailability).filter(roomType => {
    const roomAvailability = currentAvailability[roomType];
    if (!roomAvailability) return false;

    return datesInRange.every(date => {
      const dayAvailability = roomAvailability[date];
      return dayAvailability && dayAvailability.available > 0;
    });
  });

  // Filter rooms to only include available ones
  const available = rooms.filter(room => 
    availableRoomTypes.includes(room.type)
  );
  
  setAvailableRooms(available);
  
  if (available.length === 0) {
    toast.error('No rooms available for the selected dates');
  } else {
    toast.success(`Found ${available.length} available room types`);
  }
};

  const getRoomAvailability = (roomType) => {
    if (!availabilityCalendar || !checkIn || !checkOut) return null;
    
    const roomAvailability = availabilityCalendar[roomType];
    if (!roomAvailability) return null;

    const formattedCheckIn = checkIn.toISOString().split('T')[0];
    const formattedCheckOut = checkOut.toISOString().split('T')[0];

    return {
      minAvailability: Math.min(
        ...Object.entries(roomAvailability)
          .filter(([date]) => date >= formattedCheckIn && date <= formattedCheckOut)
          .map(([_, data]) => data.available)
      )
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please complete all booking details');
      return;
    }

    try {
      setIsLoading(true);
      await createBooking({
        roomTypeId: selectedRoom.id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString()
      });
      
      toast.success('Booking created successfully!');
      navigate('/booking-success');
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Book Your Stay</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find and reserve your perfect room
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {/* Date Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => {
                          setCheckIn(date);
                          setSelectedRoom(null);
                          setAvailableRooms([]);
                        }}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={new Date()}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholderText="Select check-in date"
                      />
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={checkOut}
                        onChange={(date) => {
                          setCheckOut(date);
                          setSelectedRoom(null);
                          setAvailableRooms([]);
                        }}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn || new Date()}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholderText="Select check-out date"
                      />
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={!checkIn || !checkOut || isLoading}
                  className="mt-4 w-full md:w-auto px-6 py-3 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking...' : 'Check Availability'}
                </button>
              </div>

              {/* Room Selection */}
              {availableRooms.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Rooms</h2>
                  <div className="space-y-4">
                    {availableRooms.map((room) => {
                      const availability = getRoomAvailability(room.type);
                      return (
                        <div
                          key={room.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedRoom?.id === room.id
                              ? 'border-amber-500 bg-amber-50 shadow-inner'
                              : 'border-gray-200 hover:border-amber-300'
                          }`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-200">
                              {room.images?.[0] ? (
                                <img
                                  src={room.images[0]}
                                  alt={room.type}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <PhotoIcon className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {room.type}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {room.description}
                              </p>
                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-lg font-semibold text-amber-600">
                                  ${room.price}/night
                                </span>
                                {availability && (
                                  <span className="text-sm text-gray-600">
                                    {availability.minAvailability} room{availability.minAvailability !== 1 ? 's' : ''} available
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedRoom?.id === room.id && (
                              <CheckIcon className="h-5 w-5 text-amber-500 ml-2" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {(checkIn && checkOut && selectedRoom) && (
                <div className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium text-gray-800">{selectedRoom.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium text-gray-800">
                        {checkIn.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium text-gray-800">
                        {checkOut.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium text-gray-800">{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per night:</span>
                      <span className="font-medium text-gray-800">
                        ${selectedRoom.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-amber-300 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!selectedRoom || isLoading}
                  className="w-full px-6 py-3 bg-amber-600 text-white font-medium rounded-sm shadow-md hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNowPage;