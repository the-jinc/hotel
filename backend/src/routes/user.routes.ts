import { Hono } from 'hono';
import { getProfile, updateProfile, deleteProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const userRoutes = new Hono();

userRoutes.use(authMiddleware);

userRoutes.get('/profile', getProfile);
userRoutes.put('/profile', updateProfile);
userRoutes.delete('/profile', deleteProfile);

export default userRoutes;
