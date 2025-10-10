import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { UserService } from "../services/userService.js";

export interface AuthContext {
  userId: string;
  role: string;
  user?: any;
}

export const jwtAuth = createMiddleware<{ Variables: AuthContext }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, {
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = await UserService.verifyToken(token);

      // Get user from database to ensure they still exist and are active
      const user = await UserService.getUserById(decoded.userId);

      if (!user || !user.isActive) {
        throw new HTTPException(401, {
          message: "Invalid token or inactive user",
        });
      }

      // Set context variables
      c.set("userId", decoded.userId);
      c.set("role", decoded.role);
      c.set("user", user);

      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(401, { message: "Invalid token" });
    }
  }
);

export const requireRole = (...allowedRoles: string[]) => {
  return createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
    const userRole = c.get("role");

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    await next();
  });
};

// Convenience middleware for common roles
export const requireAdmin = requireRole("admin");
export const requireManagerOrAdmin = requireRole("admin", "manager");
export const requireStaff = requireRole("admin", "manager", "receptionist");
