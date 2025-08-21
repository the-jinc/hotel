import { Hono } from 'hono';
import { getAllUsers, getAllBookings, updateUser, deleteUser } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const adminRoutes = new Hono();

adminRoutes.use(authMiddleware, adminMiddleware);

adminRoutes.get('/users', getAllUsers);
adminRoutes.get('/bookings', getAllBookings);
adminRoutes.put('/users/:id', updateUser);
adminRoutes.delete('/users/:id', deleteUser);

export default adminRoutes;
