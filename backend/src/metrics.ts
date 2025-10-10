import {
  register,
  collectDefaultMetrics,
  Histogram,
  Counter,
  Gauge,
} from "prom-client";

// Enable default metrics collection (CPU, memory, etc.)
collectDefaultMetrics();

// Custom metrics for the hotel management system
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

export const bookingOperationsTotal = new Counter({
  name: "booking_operations_total",
  help: "Total number of booking operations",
  labelNames: ["operation", "status"],
});

export const foodOrderOperationsTotal = new Counter({
  name: "food_order_operations_total",
  help: "Total number of food order operations",
  labelNames: ["operation", "status"],
});

export const databaseQueryDuration = new Histogram({
  name: "database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Metrics middleware for Hono
export const metricsMiddleware = async (c: any, next: any) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  activeConnections.inc();

  try {
    await next();

    const duration = (Date.now() - start) / 1000;
    const statusCode = c.res.status.toString();

    httpRequestDuration.labels(method, path, statusCode).observe(duration);

    httpRequestsTotal.labels(method, path, statusCode).inc();
  } finally {
    activeConnections.dec();
  }
};

// Metrics endpoint handler
export const metricsHandler = async (c: any) => {
  try {
    const metrics = await register.metrics();
    return c.text(metrics, 200, {
      "Content-Type": register.contentType,
    });
  } catch (error) {
    console.error("Error generating metrics:", error);
    return c.text("Error generating metrics", 500);
  }
};
