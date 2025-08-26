import React from "react";
import AvailabilityCalendar from "../../components/AvailabilityCalendar";

const AvailabilityCalendarPage = () => {
  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <AvailabilityCalendar />
      </div>
    </div>
  );
};

export default AvailabilityCalendarPage;