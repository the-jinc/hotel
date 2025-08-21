import { Hono } from 'hono';
import { getAllReviews, getReviewById, createReview, updateReview, deleteReview } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const reviewRoutes = new Hono();

reviewRoutes.get('/', getAllReviews);
reviewRoutes.get('/:id', getReviewById);

reviewRoutes.use(authMiddleware);
reviewRoutes.post('/', createReview);
reviewRoutes.put('/:id', updateReview);
reviewRoutes.delete('/:id', deleteReview);

export default reviewRoutes;
