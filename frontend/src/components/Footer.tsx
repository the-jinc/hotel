import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOffice2Icon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-16 font-sans">
      <div className="container mx-auto px-4">
        {/* Main Footer Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <h3 className="text-4xl font-bold font-serif text-amber-500 mb-4 tracking-tight">Woliso Hotel</h3>
            <p className="text-sm leading-relaxed">
              Experience a new standard of luxury and comfort. We are dedicated to providing an unforgettable stay with impeccable service and world-class amenities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm hover:text-amber-400 transition-colors duration-300">Home</Link></li>
              <li><Link to="/rooms" className="text-sm hover:text-amber-400 transition-colors duration-300">Rooms & Suites</Link></li>
              <li><Link to="/about" className="text-sm hover:text-amber-400 transition-colors duration-300">About Us</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-amber-400 transition-colors duration-300">Contact</Link></li>
              <li><Link to="/gallery" className="text-sm hover:text-amber-400 transition-colors duration-300">Gallery</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <BuildingOffice2Icon className="h-5 w-5 mr-3 text-amber-400" />
                <span>123 Paradise Lane, Miami, FL</span>
              </li>
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-3 text-amber-400" />
                <a href="tel:+1234567890" className="hover:text-amber-400 transition-colors duration-300">(123) 456-7890</a>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-amber-400" />
                <a href="mailto:info@woliso.com" className="hover:text-amber-400 transition-colors duration-300">info@woliso.com</a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.1 5.9a8.04 8.04 0 01-2.3.64 4.02 4.02 0 001.76-2.24 8.07 8.07 0 01-2.55.97 4.02 4.02 0 00-6.85 3.66A11.45 11.45 0 013.9 5.3a4.02 4.02 0 001.24 5.37 4.02 4.02 0 01-1.82-.5 4.02 4.02 0 003.22 3.96 4.06 4.06 0 01-1.8.07 4.03 4.03 0 003.75 2.79A8.09 8.09 0 012 18.2a11.45 11.45 0 006.2 1.8c7.4 0 11.46-6.14 11.46-11.45 0-.17 0-.35-.01-.52A8.1 8.1 0 0022.1 5.9z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.715.01 3.682.046 1.045.093 1.705.28 2.378.536.602.235 1.15.545 1.624 1.018.474.474.783 1.022 1.018 1.624.256.673.443 1.333.536 2.378.035.967.046 1.252.046 3.682s-.01 2.715-.046 3.682c-.093 1.045-.28 1.705-.536 2.378-.235.602-.545 1.15-1.018 1.624-.474.474-1.022.783-1.624 1.018-.673.256-1.333.443-2.378.536-.967.035-1.252.046-3.682.046s-2.715-.01-3.682-.046c-1.045-.093-1.705-.28-2.378-.536-.602-.235-1.15-.545-1.624-1.018a4.912 4.912 0 01-1.018-1.624c-.256-.673-.443-1.333-.536-2.378-.035-.967-.046-1.252-.046-3.682s.01-2.715.046-3.682c.093-1.045.28-1.705.536-2.378.235-.602.545-1.15 1.018-1.624.474-.474 1.022-.783 1.624-1.018.673-.256 1.333-.443 2.378-.536.967-.035 1.252-.046 3.682-.046zm0-2c-2.88 0-3.264.012-4.402.062a7.35 7.35 0 00-2.438.468c-.96.37-1.782.9-2.585 1.702-.803.803-1.332 1.625-1.702 2.585a7.35 7.35 0 00-.468 2.438c-.05 1.138-.062 1.522-.062 4.402s.012 3.264.062 4.402a7.35 7.35 0 00.468 2.438c.37.96.9 1.782 1.702 2.585.803.803 1.625 1.332 2.585 1.702a7.35 7.35 0 002.438.468c1.138.05 1.522.062 4.402.062s3.264-.012 4.402-.062a7.35 7.35 0 002.438-.468c.96-.37 1.782-.9 2.585-1.702.803-.803 1.332-1.625 1.702-2.585a7.35 7.35 0 00.468-2.438c.05-1.138.062-1.522.062-4.402s-.012-3.264-.062-4.402a7.35 7.35 0 00-.468-2.438c-.37-.96-.9-1.782-1.702-2.585-.803-.803-1.625-1.332-2.585-1.702a7.35 7.35 0 00-2.438-.468c-1.138-.05-1.522-.062-4.402-.062zm0 11.233a5.233 5.233 0 100-10.466 5.233 5.233 0 000 10.466z" clipRule="evenodd" />
                  <path d="M12.315 11a1.233 1.233 0 100-2.466 1.233 1.233 0 000 2.466z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.349 20.349v-5.263c0-1.28-.023-2.924-1.782-2.924-1.83 0-2.11 1.428-2.11 2.836v5.351H10.99v-8.818h3.966v1.815c.552-1.045 1.83-1.92 3.86-1.92 4.148 0 4.914 2.723 4.914 6.257v4.667h-4.381zm-15.011-9.849c-1.516 0-2.518-.946-2.518-2.235 0-1.266.985-2.235 2.457-2.235 1.474 0 2.519.969 2.519 2.235 0 1.289-1.045 2.235-2.458 2.235zm1.536 10.049h-3.093v-12.08h3.093v12.08z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Separator and Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Woliso Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
