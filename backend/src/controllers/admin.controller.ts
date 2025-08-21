import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users, bookings } from "../schema";
import { eq } from "drizzle-orm";

export const getAllUsers = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allUsers = await db.select().from(users).all();
    // Exclude sensitive information like password
    const usersWithoutPasswords = (allUsers as any[]).map(
      ({ password, ...user }) => user
    );
    return c.json(usersWithoutPasswords);
  } catch (err: any) {
    console.error("getAllUsers error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAllBookings = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allBookings = await db.select().from(bookings).all();
    return c.json(allBookings);
  } catch (err: any) {
    console.error("getAllBookings error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const updateUser = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { id } = c.req.param();
  const { name, email, role } = await c.req.json();

  try {
    const updatedUser = await db
      .update(users)
      .set({
        name,
        email,
        role,
      })
      .where(eq(users.id, parseInt(id)))
      .returning()
      .get();
    if (!updatedUser) return c.json({ error: "User not found" }, 404);
    const { password, ...userWithoutPassword } = updatedUser as any;
    return c.json(userWithoutPassword);
  } catch (err: any) {
    console.error("updateUser error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deleteUser = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { id } = c.req.param();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: "Invalid id" }, 400);

    const deleted = await db.delete(users).where(eq(users.id, parsed)).run();
    if (!deleted.success) return c.json({ error: "User not found" }, 404);
    return c.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("deleteUser error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};
