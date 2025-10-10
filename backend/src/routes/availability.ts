import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AvailabilityService } from "../services/availabilityService.js";

const availabilityRoutes = new Hono();

// Validation schemas
const searchSchema = z.object({
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  checkOutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD"),
  guestCount: z
    .number()
    .min(1, "Guest count must be at least 1")
    .max(10, "Guest count cannot exceed 10"),
  categoryId: z.string().uuid().optional(),
});

// GET /rooms/availability - Search for available rooms (Public)
availabilityRoutes.get(
  "/availability",
  zValidator("query", searchSchema),
  async (c) => {
    try {
      const query = c.req.valid("query");
      const availableRooms = await AvailabilityService.searchAvailableRooms(
        query
      );

      // Calculate total price for each room
      const roomsWithPricing = availableRooms.map((room) => ({
        ...room,
        totalPrice: AvailabilityService.calculateTotalPrice(
          room.category.basePrice,
          query.checkInDate,
          query.checkOutDate
        ),
        nights: Math.ceil(
          (new Date(query.checkOutDate).getTime() -
            new Date(query.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));

      return c.json({
        success: true,
        data: {
          rooms: roomsWithPricing,
          searchParams: query,
          totalResults: roomsWithPricing.length,
        },
      });
    } catch (error) {
      console.error("Error searching available rooms:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to search rooms",
        },
        400
      );
    }
  }
);

// GET /rooms/categories - Get all room categories (Public)
availabilityRoutes.get("/categories", async (c) => {
  try {
    const categories = await AvailabilityService.getAllRoomCategories();

    return c.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching room categories:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch room categories",
      },
      500
    );
  }
});

// GET /rooms/:id - Get room details (Public)
availabilityRoutes.get("/:id", async (c) => {
  try {
    const roomId = c.req.param("id");
    const room = await AvailabilityService.getRoomDetails(roomId);

    if (!room) {
      return c.json(
        {
          success: false,
          message: "Room not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Error fetching room details:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch room details",
      },
      500
    );
  }
});

export default availabilityRoutes;
