import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BuildingOffice2Icon, 
  PhoneIcon, 
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const Header = () => {
  const { user, token, isInitialized, logout, initializeAuth } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set loading state based on auth initialization
  useEffect(() => {
    setIsLoading(!isInitialized);
  }, [isInitialized]);

  const isAuthenticated = !!token;

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/my-account');
    } else {
      navigate('/login', { state: { from: window.location.pathname } });
    }
  };

  const handleBookNowClick = () => {
    if (isAuthenticated) {
      navigate('/book');
    } else {
      navigate('/login', { state: { from: '/book-now' } });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.account-dropdown') === null) {
        setIsDropdownOpen(false);
      }
      if (event.target.closest('.mobile-menu') === null && 
          event.target.closest('.mobile-menu-button') === null) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        {/* Simplified loading header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="bg-gray-800 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <a href="tel:+18005551234" className="flex items-center hover:text-amber-100 transition">
              <PhoneIcon className="h-4 w-4 mr-1" />
              +1 (800) 555-1234
            </a>
            <a href="#" className="flex items-center hover:text-amber-100 transition">
              <MapPinIcon className="h-4 w-4 mr-1" />
              123 Paradise Lane, Miami, FL
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <BuildingOffice2Icon className="h-10 w-10 text-amber-600 mr-3" />
            <Link to="/" className="text-2xl font-serif font-bold text-gray-800 tracking-tight">
              Woliso Hotel 
              <span className="block text-xs font-sans font-normal text-gray-500">INTERNATIONAL LUXURY HOTEL</span>
            </Link>
          </div>

          {/* Primary navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">Home</Link>
            <Link to="/rooms" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">Rooms & Suites</Link>
            <Link to="/dining" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">Dining</Link>
            <Link to="/experiences" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">Experiences</Link>
            <Link to="/meetings" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">Meetings & Events</Link>
            <Link to="/about" className="text-gray-700 hover:text-amber-600 transition duration-300 font-medium py-2 border-b-2 border-transparent hover:border-amber-600">About</Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBookNowClick}
              className="hidden md:flex items-center bg-amber-600 text-white px-6 py-3 rounded-sm hover:bg-amber-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Book Now
            </button>
            
            <div className="relative account-dropdown">
              <button 
                onClick={() => isAuthenticated ? setIsDropdownOpen(!isDropdownOpen) : handleAccountClick()}
                className="hidden md:flex items-center text-gray-600 hover:text-amber-600 transition duration-300"
              >
                <UserCircleIcon className="h-6 w-6" />
                {isAuthenticated && (
                  <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {isAuthenticated && isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">Welcome, {user?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link 
                    to="/my-account" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 border-t"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden text-gray-600 focus:outline-none mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mobile-menu bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/rooms" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rooms & Suites
              </Link>
              <Link 
                to="/dining" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dining
              </Link>
              <Link 
                to="/experiences" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                to="/meetings" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Meetings & Events
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-amber-600 py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile account actions */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/my-account" 
                      className="block py-2 text-gray-700 hover:text-amber-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/my-bookings" 
                      className="block py-2 text-gray-700 hover:text-amber-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="block w-full text-left py-2 text-gray-700 hover:text-amber-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="block w-full text-left py-2 text-gray-700 hover:text-amber-600"
                  >
                    Sign In
                  </button>
                )}
              </div>
              
              {/* Mobile book now button */}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleBookNowClick();
                }}
                className="w-full flex items-center justify-center bg-amber-600 text-white px-6 py-3 rounded-sm hover:bg-amber-700 transition duration-300 font-medium shadow-md hover:shadow-lg mt-4"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Now
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Secondary navigation for important actions */}
      <div className="bg-gray-50 border-t border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <Link to="/weddings" className="flex items-center text-gray-700 hover:text-amber-600">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              Weddings
            </Link>
            <Link to="/spa" className="text-gray-700 hover:text-amber-600">Spa</Link>
            <Link to="/gallery" className="text-gray-700 hover:text-amber-600">Gallery</Link>
            <Link to="/contact" className="text-gray-700 hover:text-amber-600">Contact</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;