import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { RoomCategoryService } from "../services/roomCategoryService.js";
import {
  jwtAuth,
  requireAdmin,
  requireManagerOrAdmin,
} from "../middleware/auth.js";

const roomCategoryRoutes = new Hono();

// Apply JWT authentication to all routes
roomCategoryRoutes.use("*", jwtAuth);

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  basePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Base price must be a valid decimal"),
  maxOccupancy: z.number().int().min(1, "Max occupancy must be at least 1"),
  amenities: z.string().optional(), // JSON string
  images: z.string().optional(), // JSON string
});

const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  description: z.string().optional(),
  basePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Base price must be a valid decimal")
    .optional(),
  maxOccupancy: z
    .number()
    .int()
    .min(1, "Max occupancy must be at least 1")
    .optional(),
  amenities: z.string().optional(),
  images: z.string().optional(),
});

// GET /room-categories - Get all categories (Manager+ can view)
roomCategoryRoutes.get("/", requireManagerOrAdmin, async (c) => {
  try {
    const categories = await RoomCategoryService.getAllCategories();

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

// GET /room-categories/:id - Get category by ID (Manager+ can view)
roomCategoryRoutes.get("/:id", requireManagerOrAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const category = await RoomCategoryService.getCategoryById(id);

    if (!category) {
      return c.json(
        {
          success: false,
          message: "Room category not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching room category:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch room category",
      },
      500
    );
  }
});

// POST /room-categories - Create new category (Admin only)
roomCategoryRoutes.post(
  "/",
  requireAdmin,
  zValidator("json", createCategorySchema),
  async (c) => {
    try {
      const categoryData = c.req.valid("json");
      const newCategory = await RoomCategoryService.createCategory(
        categoryData
      );

      return c.json(
        {
          success: true,
          message: "Room category created successfully",
          data: newCategory,
        },
        201
      );
    } catch (error) {
      console.error("Error creating room category:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to create room category",
        },
        400
      );
    }
  }
);

// PUT /room-categories/:id - Update category (Admin only)
roomCategoryRoutes.put(
  "/:id",
  requireAdmin,
  zValidator("json", updateCategorySchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      const updatedCategory = await RoomCategoryService.updateCategory(
        id,
        updates
      );

      if (!updatedCategory) {
        return c.json(
          {
            success: false,
            message: "Room category not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        message: "Room category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Error updating room category:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to update room category",
        },
        400
      );
    }
  }
);

// DELETE /room-categories/:id - Delete category (Admin only)
roomCategoryRoutes.delete("/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");

    const deleted = await RoomCategoryService.deleteCategory(id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          message: "Room category not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Room category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room category:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete room category",
      },
      400
    );
  }
});

export default roomCategoryRoutes;
