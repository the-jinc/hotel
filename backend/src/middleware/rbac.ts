import type { Context, Next, MiddlewareHandler } from "hono";

export type UserRole = "admin" | "manager" | "receptionist" | "guest";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}

/**
 * Role-based access control middleware
 * Ensures that the authenticated user has one of the required roles
 */
export const roleMiddleware = (
  requiredRoles: UserRole[]
): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    if (!requiredRoles.includes(user.role)) {
      return c.json(
        {
          error: "Insufficient permissions",
          required: requiredRoles,
          current: user.role,
        },
        403
      );
    }

    await next();
  };
};

/**
 * Check if user has any of the specified roles
 */
export const hasRole = (
  user: AuthenticatedUser,
  roles: UserRole[]
): boolean => {
  return roles.includes(user.role);
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: AuthenticatedUser): boolean => {
  return user.role === "admin";
};

/**
 * Check if user is staff (admin, manager, or receptionist)
 */
export const isStaff = (user: AuthenticatedUser): boolean => {
  return ["admin", "manager", "receptionist"].includes(user.role);
};

/**
 * Check if user is guest
 */
export const isGuest = (user: AuthenticatedUser): boolean => {
  return user.role === "guest";
};
