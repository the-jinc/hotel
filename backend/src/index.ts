import { Hono } from "hono";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import diningRoutes from "./routes/dining.routes";
import meetingsAndEventsRoutes from "./routes/meeting-and-events.routes";
import adminRoutes from "./routes/admin.routes";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", cors());

app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/rooms", roomRoutes);
app.route("/api/bookings", bookingRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/dinings", diningRoutes);
app.route("/api/meetings-and-events", meetingsAndEventsRoutes);
app.route("/api/admin", adminRoutes);

export default app;
