import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { meetingsAndEvents } from "../schema";
import { eq } from "drizzle-orm";

export const getAllEvents = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allEvents = await db.select().from(meetingsAndEvents).all();
    return c.json(allEvents);
  } catch (err: any) {
    console.error('getAllEvents error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getEventById = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const event = await db
      .select()
      .from(meetingsAndEvents)
      .where(eq(meetingsAndEvents.id, parsed))
      .get();

    if (!event) return c.json({ error: 'Event not found' }, 404);
    return c.json(event);
  } catch (err: any) {
    console.error('getEventById error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const createEvent = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { name, description, capacity, eventType, images } = await c.req.json();

  if (!name || !description || !capacity || !eventType) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const newEvent = await db
      .insert(meetingsAndEvents)
      .values({
        name,
        description,
        capacity,
        eventType,
        images: images || [],
      })
      .returning()
      .get();
    return c.json(newEvent, 201);
  } catch (err: any) {
    console.error('createEvent error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateEvent = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);
    const { name, description, capacity, eventType, images } = await c.req.json();

    const updatedEvent = await db
      .update(meetingsAndEvents)
      .set({
        name,
        description,
        capacity,
        eventType,
        images: images || [],
      })
      .where(eq(meetingsAndEvents.id, parsed))
      .returning()
      .get();

    if (!updatedEvent) return c.json({ error: 'Event not found' }, 404);
    return c.json(updatedEvent);
  } catch (err: any) {
    console.error('updateEvent error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteEvent = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const deleted = await db
      .delete(meetingsAndEvents)
      .where(eq(meetingsAndEvents.id, parsed))
      .run();
    if (!deleted.success) return c.json({ error: 'Event not found' }, 404);
    return c.json({ message: 'Event deleted successfully' });
  } catch (err: any) {
    console.error('deleteEvent error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
