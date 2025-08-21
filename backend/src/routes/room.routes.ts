import { Hono } from 'hono';
import { getAllRoomTypes, getRoomTypeById, createRoomType, updateRoomType, deleteRoomType } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const roomRoutes = new Hono();

roomRoutes.get('/', getAllRoomTypes);
roomRoutes.get('/:id', getRoomTypeById);

roomRoutes.use(authMiddleware, adminMiddleware);

roomRoutes.post('/', createRoomType);
roomRoutes.put('/:id', updateRoomType);
roomRoutes.delete('/:id', deleteRoomType);

export default roomRoutes;
