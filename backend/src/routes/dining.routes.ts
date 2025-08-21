import { Hono } from 'hono';
import { getAllDiningOptions, getDiningOptionById, createDiningOption, updateDiningOption, deleteDiningOption } from '../controllers/dining.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const diningRoutes = new Hono();

diningRoutes.get('/', getAllDiningOptions);
diningRoutes.get('/:id', getDiningOptionById);

diningRoutes.use(authMiddleware, adminMiddleware);

diningRoutes.post('/', createDiningOption);
diningRoutes.put('/:id', updateDiningOption);
diningRoutes.delete('/:id', deleteDiningOption);

export default diningRoutes;
