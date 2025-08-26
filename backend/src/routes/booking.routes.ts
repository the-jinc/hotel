import { Hono } from "hono";
import {
  getUserBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const bookingRoutes = new Hono();

bookingRoutes.use(authMiddleware);

bookingRoutes.get("/my", getUserBookings); // user's own bookings
bookingRoutes.get("/", getUserBookings); // fallback list (could later be admin only)
bookingRoutes.get("/:id", getBookingById);
bookingRoutes.post("/", createBooking);
bookingRoutes.put("/:id", updateBooking);
bookingRoutes.delete("/:id", cancelBooking);

export default bookingRoutes;
