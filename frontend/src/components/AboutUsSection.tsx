
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutUsSection = () => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <img
          src="https://placehold.co/800x600/C29F5D/ffffff?text=Our+Hotel"
          alt="Hotel interior"
          className="rounded-xl shadow-lg"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4">
          Discover a Place of Serenity and Style
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          At Woliso Hotel, we believe in creating more than just a stay; we create memories. Our commitment to impeccable service, exquisite dining, and elegant accommodations ensures that every moment of your visit is truly special.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Nestled in the heart of the city, our hotel offers a peaceful retreat from the bustling world outside. Whether you're here for a romantic getaway, a business trip, or a family vacation, you'll find everything you need for a perfect escape.
        </p>
        <Link to="/about" className="inline-block mt-6 text-amber-600 hover:text-amber-700 font-semibold transition duration-300">
          Learn More About Us &rarr;
        </Link>
      </motion.div>
    </div>
  </section>
);

export default AboutUsSection;
