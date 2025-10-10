import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserService } from "../services/userService.js";
import {
  jwtAuth,
  requireAdmin,
  requireManagerOrAdmin,
} from "../middleware/auth.js";
import { createAuditMiddleware } from "../middleware/audit.js";

const userRoutes = new Hono();

// Apply JWT authentication to all user routes
userRoutes.use("*", jwtAuth);

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "receptionist", "guest"]).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "receptionist", "guest"]).optional(),
  isActive: z.boolean().optional(),
});

// GET /users - Get all users (Admin only)
userRoutes.get("/", requireAdmin, async (c) => {
  try {
    const users = await UserService.getAllUsers();

    return c.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      500
    );
  }
});

// GET /users/:id - Get user by ID (Admin/Manager only)
userRoutes.get("/:id", requireManagerOrAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const user = await UserService.getUserById(id);

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
      },
      500
    );
  }
});

// POST /users - Create new user (Admin only)
userRoutes.post(
  "/",
  requireAdmin,
  createAuditMiddleware.users(),
  zValidator("json", createUserSchema),
  async (c) => {
    try {
      const userData = c.req.valid("json");
      const result = await UserService.createUser(userData);

      return c.json(
        {
          success: true,
          message: "User created successfully",
          data: result.user, // Don't return token for admin-created users
        },
        201
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to create user",
        },
        400
      );
    }
  }
);

// PUT /users/:id - Update user (Admin only)
userRoutes.put(
  "/:id",
  requireAdmin,
  createAuditMiddleware.users(),
  zValidator("json", updateUserSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      const updatedUser = await UserService.updateUser(id, updates);

      if (!updatedUser) {
        return c.json(
          {
            success: false,
            message: "User not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to update user",
        },
        400
      );
    }
  }
);

// DELETE /users/:id - Delete user (Admin only)
userRoutes.delete(
  "/:id",
  requireAdmin,
  createAuditMiddleware.users(),
  async (c) => {
    try {
      const id = c.req.param("id");
      const currentUserId = c.get("userId");

      // Prevent admin from deleting themselves
      if (id === currentUserId) {
        return c.json(
          {
            success: false,
            message: "Cannot delete your own account",
          },
          400
        );
      }

      const deleted = await UserService.deleteUser(id);

      if (!deleted) {
        return c.json(
          {
            success: false,
            message: "User not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return c.json(
        {
          success: false,
          message: "Failed to delete user",
        },
        500
      );
    }
  }
);

export default userRoutes;
