import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import API from '../api/axios';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.post('/newsletter/subscribe', { email });
      setMessage({ 
        text: 'Thank you for subscribing! You will receive our exclusive offers soon.', 
        type: 'success' 
      });
      setEmail('');
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Subscription failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-8 shadow-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2">
              Stay Updated with Our Offers
            </h2>
            <p className="text-amber-100">
              Subscribe to receive exclusive deals and luxury travel tips
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-3 rounded-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-sm transition-colors duration-300"
            >
              {loading ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <PaperAirplaneIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {message.text && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-center p-3 rounded-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <p className="text-xs text-amber-100 text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;