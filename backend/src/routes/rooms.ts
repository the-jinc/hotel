import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { RoomService } from "../services/roomService.js";
import {
  jwtAuth,
  requireAdmin,
  requireManagerOrAdmin,
  requireStaff,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

const roomRoutes = new Hono();

// Validation schemas
const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  categoryId: z.string().uuid("Invalid category ID"),
  floor: z.number().int().min(1, "Floor must be at least 1"),
  notes: z.string().optional(),
});

const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  status: z
    .enum(["available", "booked", "cleaning", "out_of_service"])
    .optional(),
  floor: z.number().int().min(1, "Floor must be at least 1").optional(),
  notes: z.string().optional(),
});

const availabilityQuerySchema = z.object({
  checkInDate: z.string().transform((str) => new Date(str)),
  checkOutDate: z.string().transform((str) => new Date(str)),
  guestCount: z
    .string()
    .optional()
    .transform((str) => (str ? parseInt(str, 10) : undefined)),
});

// Public route for room availability (no auth required)
roomRoutes.get(
  "/availability",
  zValidator("query", availabilityQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");

      // Validate dates
      if (query.checkInDate >= query.checkOutDate) {
        throw new HTTPException(400, {
          message: "Check-out date must be after check-in date",
        });
      }

      if (query.checkInDate < new Date()) {
        throw new HTTPException(400, {
          message: "Check-in date cannot be in the past",
        });
      }

      const availableRooms = await RoomService.getAvailableRooms(query);

      return c.json({
        success: true,
        data: availableRooms,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new HTTPException(400, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  }
);

// Apply JWT authentication to protected routes
roomRoutes.use("*", jwtAuth);

// GET /rooms - Get all rooms (Staff+ can view)
roomRoutes.get("/", requireStaff, async (c) => {
  try {
    const rooms = await RoomService.getAllRooms();

    return c.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// GET /rooms/:id - Get room by ID (Staff+ can view)
roomRoutes.get("/:id", requireStaff, async (c) => {
  try {
    const id = c.req.param("id");
    const room = await RoomService.getRoomById(id);

    if (!room) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    return c.json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// GET /rooms/category/:categoryId - Get rooms by category (Staff+ can view)
roomRoutes.get("/category/:categoryId", requireStaff, async (c) => {
  try {
    const categoryId = c.req.param("categoryId");
    const rooms = await RoomService.getRoomsByCategory(categoryId);

    return c.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// POST /rooms - Create new room (Admin only)
roomRoutes.post(
  "/",
  requireAdmin,
  zValidator("json", createRoomSchema),
  async (c) => {
    try {
      const roomData = c.req.valid("json");
      const newRoom = await RoomService.createRoom(roomData);

      return c.json(
        {
          success: true,
          message: "Room created successfully",
          data: newRoom,
        },
        201
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new HTTPException(400, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  }
);

// PUT /rooms/:id - Update room (Manager+ can update)
roomRoutes.put(
  "/:id",
  requireManagerOrAdmin,
  zValidator("json", updateRoomSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      const updatedRoom = await RoomService.updateRoom(id, updates);

      if (!updatedRoom) {
        throw new HTTPException(404, { message: "Room not found" });
      }

      return c.json({
        success: true,
        message: "Room updated successfully",
        data: updatedRoom,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new HTTPException(400, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  }
);

// PUT /rooms/:id/status - Update room status (Staff+ can update)
roomRoutes.put(
  "/:id/status",
  requireStaff,
  zValidator(
    "json",
    z.object({
      status: z.enum(["available", "booked", "cleaning", "out_of_service"]),
    })
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const { status } = c.req.valid("json");

      const updatedRoom = await RoomService.updateRoomStatus(id, status);

      if (!updatedRoom) {
        throw new HTTPException(404, { message: "Room not found" });
      }

      return c.json({
        success: true,
        message: "Room status updated successfully",
        data: updatedRoom,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new HTTPException(400, { message: error.message });
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  }
);

// DELETE /rooms/:id - Delete room (Admin only)
roomRoutes.delete("/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");

    const deleted = await RoomService.deleteRoom(id);

    if (!deleted) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    return c.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    if (error instanceof Error) {
      throw new HTTPException(400, { message: error.message });
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

export default roomRoutes;
