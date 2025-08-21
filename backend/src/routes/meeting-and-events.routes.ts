import { Hono } from 'hono';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/meeting-and-events.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const meetingsAndEventsRoutes = new Hono();

meetingsAndEventsRoutes.get('/', getAllEvents);
meetingsAndEventsRoutes.get('/:id', getEventById);

meetingsAndEventsRoutes.use(authMiddleware, adminMiddleware);

meetingsAndEventsRoutes.post('/', createEvent);
meetingsAndEventsRoutes.put('/:id', updateEvent);
meetingsAndEventsRoutes.delete('/:id', deleteEvent);

export default meetingsAndEventsRoutes;
