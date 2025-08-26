import React, { useEffect, useState, useRef } from "react";
import { DateRange } from "react-date-range";
import { addDays, format, startOfDay } from "date-fns";
import useRoomStore from "../store/roomStore";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const AvailabilityCalendar = () => {
  const {
    availabilityCalendar,
    fetchAvailabilityCalendar,
    calendarLoading,
    calendarError,
  } = useRoomStore();

  const [showPicker, setShowPicker] = useState(false);
  const datePickerRef = useRef(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfDay(new Date()),
      endDate: startOfDay(addDays(new Date(), 6)),
      key: "selection",
    },
  ]);

  useEffect(() => {
    const startStr = format(dateRange[0].startDate, "yyyy-MM-dd");
    const endStr = format(dateRange[0].endDate, "yyyy-MM-dd");
    
    fetchAvailabilityCalendar(startStr, endStr);
  }, [dateRange, fetchAvailabilityCalendar]);

  // Handle closing the date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerRef]);

  // Custom handler to close the picker after selecting a range
  const handleDateSelect = (item) => {
    setDateRange([
      {
        startDate: startOfDay(item.selection.startDate),
        endDate: startOfDay(item.selection.endDate),
        key: "selection",
      },
    ]);
    if (item.selection.startDate !== item.selection.endDate) {
      setShowPicker(false);
    }
  };

  const roomTypes = Object.keys(availabilityCalendar || {});
  const dates =
    roomTypes.length > 0
      ? Object.keys(availabilityCalendar[roomTypes[0]]).sort(
          (a, b) => new Date(a) - new Date(b)
        )
      : [];

  const formattedDateRange = `${format(dateRange[0].startDate, "MMM d, yyyy")} - ${format(dateRange[0].endDate, "MMM d, yyyy")}`;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Availability Calendar</h2>
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            <span>{formattedDateRange}</span>
          </button>

          {showPicker && (
            <div className="absolute z-20 mt-2 right-0 shadow-lg rounded-lg overflow-hidden">
              <DateRange
                ranges={dateRange}
                minDate={new Date()}
                onChange={handleDateSelect} // Use the new handler
                rangeColors={["#2563eb"]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-6 text-sm items-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-emerald-100 border border-gray-400" />
          <span className="text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-rose-100 border border-gray-400" />
          <span className="text-gray-700">Fully Booked</span>
        </div>
      </div>

      {/* Loading/Error */}
      {calendarLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ArrowPathIcon className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-4 text-lg font-medium">Loading calendar...</p>
        </div>
      )}
      {calendarError && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm" role="alert">
          <ExclamationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-bold">Error fetching data</p>
            <p className="text-sm">{calendarError}</p>
          </div>
        </div>
      )}

      {/* Calendar Table */}
      {!calendarLoading && !calendarError && roomTypes.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 border-r px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">Room Type</th>
                {dates.map((date) => (
                  <th key={date} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center border-l">
                    {format(new Date(date), "MMM d")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roomTypes.map((roomType) => (
                <tr key={roomType}>
                  <td className="sticky left-0 bg-white border-r px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900 z-10">
                    {roomType}
                  </td>
                  {dates.map((date) => {
                    const entry = availabilityCalendar[roomType][date];
                    const isAvailable = entry.available > 0;
                    return (
                      <td
                        key={date}
                        title={`Available: ${entry.available}, Booked: ${entry.booked}`}
                        className={`px-4 py-4 text-center text-sm font-medium border-l border-r transition-colors duration-200
                          ${isAvailable
                            ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                            : "bg-rose-100 hover:bg-rose-200 text-rose-800"
                          }
                        `}
                      >
                        {entry.available}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !calendarLoading && !calendarError && (
          <div className="text-center p-8 text-gray-500 italic">
            No availability data found for this date range.
          </div>
        )
      )}
    </>
  );
};

export default AvailabilityCalendar;