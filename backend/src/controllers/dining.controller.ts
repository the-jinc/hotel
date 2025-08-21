import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { dining } from "../schema";
import { eq } from "drizzle-orm";

export const getAllDiningOptions = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allDiningOptions = await db.select().from(dining).all();
    return c.json(allDiningOptions);
  } catch (err: any) {
    console.error('getAllDiningOptions error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getDiningOptionById = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const diningOption = await db
      .select()
      .from(dining)
      .where(eq(dining.id, parsed))
      .get();

    if (!diningOption) return c.json({ error: 'Dining option not found' }, 404);
    return c.json(diningOption);
  } catch (err: any) {
    console.error('getDiningOptionById error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const createDiningOption = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { name, description, images } = await c.req.json();

  if (!name || !description) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const newDiningOption = await db
      .insert(dining)
      .values({
        name,
        description,
        images: images || [],
      })
      .returning()
      .get();
    return c.json(newDiningOption, 201);
  } catch (err: any) {
    console.error('createDiningOption error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateDiningOption = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);
    const { name, description, images } = await c.req.json();

    const updatedDiningOption = await db
      .update(dining)
      .set({
        name,
        description,
        images: images || [],
      })
      .where(eq(dining.id, parsed))
      .returning()
      .get();

    if (!updatedDiningOption) return c.json({ error: 'Dining option not found' }, 404);
    return c.json(updatedDiningOption);
  } catch (err: any) {
    console.error('updateDiningOption error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteDiningOption = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const deleted = await db
      .delete(dining)
      .where(eq(dining.id, parsed))
      .run();
    if (!deleted.success) return c.json({ error: 'Dining option not found' }, 404);
    return c.json({ message: 'Dining option deleted successfully' });
  } catch (err: any) {
    console.error('deleteDiningOption error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
