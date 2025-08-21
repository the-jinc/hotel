import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { roomTypes } from "../schema";
import { eq } from "drizzle-orm";

export const getAllRoomTypes = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allRoomTypes = await db.select().from(roomTypes).all();
    return c.json(allRoomTypes);
  } catch (err: any) {
    console.error('getAllRoomTypes error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getRoomTypeById = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const roomType = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.id, parsed))
      .get();

    if (!roomType) return c.json({ error: 'Room type not found' }, 404);
    return c.json(roomType);
  } catch (err: any) {
    console.error('getRoomTypeById error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const createRoomType = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { type, price, quantity, description, images } = await c.req.json();

  if (!type || !price || !quantity || !description) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const newRoomType = await db
      .insert(roomTypes)
      .values({
        type,
        price,
        quantity,
        description,
        images: images || [],
      })
      .returning()
      .get();
    return c.json(newRoomType, 201);
  } catch (err: any) {
    console.error('createRoomType error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateRoomType = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);
    const { type, price, quantity, description, images } = await c.req.json();

    const updatedRoomType = await db
      .update(roomTypes)
      .set({
        type,
        price,
        quantity,
        description,
        images: images || [],
      })
      .where(eq(roomTypes.id, parsed))
      .returning()
      .get();

    if (!updatedRoomType) return c.json({ error: 'Room type not found' }, 404);
    return c.json(updatedRoomType);
  } catch (err: any) {
    console.error('updateRoomType error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteRoomType = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const deleted = await db
      .delete(roomTypes)
      .where(eq(roomTypes.id, parsed))
      .run();
    if (!deleted.success) return c.json({ error: 'Room type not found' }, 404);
    return c.json({ message: 'Room type deleted successfully' });
  } catch (err: any) {
    console.error('deleteRoomType error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
