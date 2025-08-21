import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export const getProfile = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");

  try {
    const profile = await db
      .select()
      .from(users)
      .where(eq(users.id, user.sub))
      .get();

    if (!profile) return c.json({ error: 'User not found' }, 404);

    // Exclude sensitive information like password
    const { password, ...userProfile } = profile as any;
    return c.json(userProfile);
  } catch (err: any) {
    console.error('getProfile error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateProfile = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { name, email } = await c.req.json();

  if (!name && !email) {
    return c.json({ error: "No fields to update" }, 400);
  }
  try {
    const updatedUser = await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, user.sub))
      .returning()
      .get();

    if (!updatedUser) return c.json({ error: 'User not found' }, 404);

    const { password, ...userProfile } = updatedUser as any;
    return c.json(userProfile);
  } catch (err: any) {
    console.error('updateProfile error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteProfile = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");

  try {
    const deleted = await db.delete(users).where(eq(users.id, user.sub)).run();
    if (!deleted.success) return c.json({ error: 'User not found' }, 404);
    return c.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('deleteProfile error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
