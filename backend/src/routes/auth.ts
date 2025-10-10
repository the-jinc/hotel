import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserService } from "../services/userService.js";
import { jwtAuth } from "../middleware/auth.js";

const authRoutes = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// POST /auth/register
authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const userData = c.req.valid("json");
    const result = await UserService.createUser(userData);

    return c.json(
      {
        success: true,
        message: "User registered successfully",
        data: result,
      },
      201
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to register user",
      },
      400
    );
  }
});

// POST /auth/login
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const credentials = c.req.valid("json");
    const result = await UserService.loginUser(credentials);

    return c.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      },
      401
    );
  }
});

// POST /auth/forgot-password
authRoutes.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  async (c) => {
    try {
      const { email } = c.req.valid("json");

      // In a real application, you would:
      // 1. Generate a password reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link

      // For now, just return success (don't reveal if email exists)
      return c.json({
        success: true,
        message:
          "If an account with that email exists, you will receive password reset instructions.",
      });
    } catch (error) {
      console.error("Error processing forgot password:", error);
      return c.json(
        {
          success: false,
          message: "Failed to process request",
        },
        500
      );
    }
  }
);

// GET /auth/me
authRoutes.get("/me", jwtAuth, async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        401
      );
    }

    return c.json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch user profile",
      },
      500
    );
  }
});

export default authRoutes;
