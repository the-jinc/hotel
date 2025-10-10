import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// Import metrics
import { metricsMiddleware, metricsHandler } from "./metrics.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import roomCategoryRoutes from "./routes/roomCategories.js";
import roomRoutes from "./routes/rooms.js";
import availabilityRoutes from "./routes/availability.js";
import bookingRoutes from "./routes/bookings.js";
import foodCategoryRoutes from "./routes/foodCategories.js";
import foodItemRoutes from "./routes/foodItems.js";
import foodOrderRoutes from "./routes/foodOrders.js";
import reportRoutes from "./routes/reports.js";
import backupRoutes from "./routes/backups.js";
import auditLogRoutes from "./routes/auditLogs.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", metricsMiddleware);
app.use("*", cors());

// Health check
app.get("/", (c) => {
  return c.json({ message: "Hotel Management System API" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get("/metrics", metricsHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/admin/room-categories", roomCategoryRoutes);
app.route("/admin/rooms", roomRoutes);
app.route("/rooms", availabilityRoutes); // Public room availability routes
app.route("/bookings", bookingRoutes); // Booking management routes
app.route("/food-categories", foodCategoryRoutes); // Food category management
app.route("/food-items", foodItemRoutes); // Food item management
app.route("/food-orders", foodOrderRoutes); // Food order management
app.route("/reports", reportRoutes); // Management reports (admin/manager only)
app.route("/backups", backupRoutes); // Backup management (admin only)
app.route("/audit-logs", auditLogRoutes); // Audit logs (admin only)

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);

  // Handle all errors with consistent JSON response
  return c.json(
    {
      success: false,
      message: err instanceof Error ? err.message : "Internal server error",
    },
    500
  );
});

const port = Number(process.env.PORT) || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
