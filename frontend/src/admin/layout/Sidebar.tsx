import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { 
  HomeIcon, 
  UserGroupIcon, 
  BuildingOffice2Icon, 
  CalendarDaysIcon, 
  StarIcon, 
  ArrowLeftOnRectangleIcon, 
  Bars3Icon, 
  XMarkIcon,
  ReceiptPercentIcon // New icon for Bookings
} from '@heroicons/react/24/solid';
import { BookOpenIcon, BriefcaseIcon, CakeIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false); // State for the confirmation dialog
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // Function to open the confirmation dialog
  const handleLogout = () => {
    setIsConfirmLogoutOpen(true);
  };
  
  // Function to handle the actual logout after confirmation
  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
    setIsConfirmLogoutOpen(false); // Close the dialog
  };

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { to: "/admin/users", label: "Users", icon: UserGroupIcon },
    { to: "/admin/rooms", label: "Rooms", icon: BuildingOffice2Icon },
    { to: "/admin/dinings", label: "Dinings", icon: CakeIcon },
    { to: "/admin/meetings", label: "Meetings", icon: BriefcaseIcon },
    { to: "/admin/bookings", label: "Bookings", icon: BookOpenIcon },
    { to: "/admin/availability", label: "Availability", icon: CalendarDaysIcon },
    { to: "/admin/reviews", label: "Reviews", icon: StarIcon },
  ];

  return (
    <>
      <div className={`bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
        {/* Toggle button, always visible */}
        <div className={`flex ${isOpen ? "justify-between items-center p-4" : "justify-center p-4"}`}>
          {isOpen && <h2 className="text-xl font-bold text-blue-400">Admin</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white rounded transition-colors duration-200"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Main navigation links */}
        <nav className={`flex-1 overflow-y-auto ${isOpen ? "mt-4 space-y-2 px-2" : "mt-2"}`}>
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center rounded-lg transition-all duration-200
                  ${isOpen ? "px-4 py-3" : "justify-center p-3"}
                  ${isActive
                    ? "bg-gray-700 text-white border-l-4 border-blue-500 font-semibold"
                    : "text-gray-300 hover:bg-gray-800"
                  }`}
              >
                <link.icon className={`h-6 w-6 ${isOpen ? "mr-4" : ""}`} />
                {isOpen && <span className="text-sm">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout button at the bottom */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200
              ${isOpen ? "p-3" : "p-3"}`}
          >
            <ArrowLeftOnRectangleIcon className={`h-6 w-6 ${isOpen ? "mr-3" : ""}`} />
            {isOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmLogoutOpen}
        onClose={() => setIsConfirmLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        isDestructive={true}
      />
    </>
  );
}
