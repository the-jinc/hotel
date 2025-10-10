import { Hono } from "hono";
import { jwtAuth, requireManagerOrAdmin } from "../middleware/auth.js";
import {
  reportingService,
  type ReportFilters,
} from "../services/reportingService.js";

const reports = new Hono();

// Apply authentication middleware - only managers and admins can access reports
reports.use("*", jwtAuth);
reports.use("*", requireManagerOrAdmin);

// GET /reports/occupancy
reports.get("/occupancy", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    const groupBy = c.req.query("groupBy") as
      | "day"
      | "week"
      | "month"
      | undefined;

    if (!startDate || !endDate) {
      return c.json(
        {
          error: "startDate and endDate query parameters are required",
          example: "/reports/occupancy?startDate=2024-01-01&endDate=2024-01-31",
        },
        400
      );
    }

    // Validate date format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return c.json(
        {
          error: "Invalid date format. Use YYYY-MM-DD format",
        },
        400
      );
    }

    const filters: ReportFilters = {
      startDate,
      endDate,
      groupBy: groupBy || "day",
    };

    const occupancyReport = await reportingService.getOccupancyReport(filters);

    return c.json({
      success: true,
      data: occupancyReport,
      filters,
    });
  } catch (error) {
    console.error("Error generating occupancy report:", error);
    return c.json(
      {
        error: "Failed to generate occupancy report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /reports/revenue
reports.get("/revenue", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    const groupBy = c.req.query("groupBy") as
      | "day"
      | "week"
      | "month"
      | undefined;

    if (!startDate || !endDate) {
      return c.json(
        {
          error: "startDate and endDate query parameters are required",
          example: "/reports/revenue?startDate=2024-01-01&endDate=2024-01-31",
        },
        400
      );
    }

    // Validate date format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return c.json(
        {
          error: "Invalid date format. Use YYYY-MM-DD format",
        },
        400
      );
    }

    const filters: ReportFilters = {
      startDate,
      endDate,
      groupBy: groupBy || "day",
    };

    const revenueReport = await reportingService.getRevenueReport(filters);

    return c.json({
      success: true,
      data: revenueReport,
      filters,
    });
  } catch (error) {
    console.error("Error generating revenue report:", error);
    return c.json(
      {
        error: "Failed to generate revenue report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /reports/food-sales
reports.get("/food-sales", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    if (!startDate || !endDate) {
      return c.json(
        {
          error: "startDate and endDate query parameters are required",
          example:
            "/reports/food-sales?startDate=2024-01-01&endDate=2024-01-31",
        },
        400
      );
    }

    // Validate date format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return c.json(
        {
          error: "Invalid date format. Use YYYY-MM-DD format",
        },
        400
      );
    }

    const filters: ReportFilters = {
      startDate,
      endDate,
    };

    const foodSalesReport = await reportingService.getFoodSalesReport(filters);

    return c.json({
      success: true,
      data: foodSalesReport,
      filters,
    });
  } catch (error) {
    console.error("Error generating food sales report:", error);
    return c.json(
      {
        error: "Failed to generate food sales report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /reports/kpis
reports.get("/kpis", async (c) => {
  try {
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    if (!startDate || !endDate) {
      return c.json(
        {
          error: "startDate and endDate query parameters are required",
          example: "/reports/kpis?startDate=2024-01-01&endDate=2024-01-31",
        },
        400
      );
    }

    // Validate date format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return c.json(
        {
          error: "Invalid date format. Use YYYY-MM-DD format",
        },
        400
      );
    }

    const filters: ReportFilters = {
      startDate,
      endDate,
    };

    const kpis = await reportingService.getKPIs(filters);

    return c.json({
      success: true,
      data: kpis,
      filters,
    });
  } catch (error) {
    console.error("Error generating KPIs:", error);
    return c.json(
      {
        error: "Failed to generate KPIs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default reports;
