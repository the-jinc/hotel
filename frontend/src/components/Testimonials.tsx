// Testimonials.js
import { useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import useReviewStore from "../store/reviewStore";
import LoadingSpinner from "./LoadingSpinner";
import type { Review } from '../types/review'; // Import Review

const Testimonials = () => {
  const { publicReviews, loading, error, fetchPublicReviews } =
    useReviewStore();

  useEffect(() => {
    fetchPublicReviews();
  }, [fetchPublicReviews]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading testimonials: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-wider text-amber-600 uppercase">
            Guest Experiences
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 font-serif">
            What Our Guests Say
          </h2>
          <div className="w-20 h-1 bg-amber-600 mx-auto mt-4"></div>
        </div>

        {publicReviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No testimonials available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicReviews.map((review: Review, index: number) => ( // Typed review and index
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    {review.userImage ? (
                      <img
                        src={review.userImage}
                        alt={review.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {review.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {review.userName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {review.roomTypeName}
                    </p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "text-amber-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 mb-6 italic">"{review.comment}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;