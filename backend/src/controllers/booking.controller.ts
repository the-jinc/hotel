import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { bookings, roomTypes } from "../schema";
import { eq, and } from "drizzle-orm";

export const getUserBookings = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  try {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, user.sub))
      .all();
    return c.json(userBookings);
  } catch (err: any) {
    console.error('getUserBookings error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getBookingById = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { id } = c.req.param();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const booking = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, parsed), eq(bookings.userId, user.sub)))
      .get();

    if (!booking) return c.json({ error: 'Booking not found' }, 404);
    return c.json(booking);
  } catch (err: any) {
    console.error('getBookingById error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const createBooking = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { roomTypeId, checkIn, checkOut, nights, roomPrice, totalPrice } =
    await c.req.json();

  if (
    !roomTypeId ||
    !checkIn ||
    !checkOut ||
    !nights ||
    !roomPrice ||
    !totalPrice
  ) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    // Basic validation for room type existence
    const roomType = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.id, roomTypeId))
      .get();
    if (!roomType) return c.json({ error: 'Invalid room type' }, 400);

    const newBooking = await db
      .insert(bookings)
      .values({
        userId: user.sub,
        roomTypeId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights,
        roomPrice,
        totalPrice,
        status: 'pending',
      })
      .returning()
      .get();
    return c.json(newBooking, 201);
  } catch (err: any) {
    console.error('createBooking error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateBooking = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { id } = c.req.param();
  const { checkIn, checkOut, nights, roomPrice, totalPrice, status } =
    await c.req.json();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const updatedBooking = await db
      .update(bookings)
      .set({
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        nights,
        roomPrice,
        totalPrice,
        status,
      })
      .where(and(eq(bookings.id, parsed), eq(bookings.userId, user.sub)))
      .returning()
      .get();

    if (!updatedBooking) return c.json({ error: 'Booking not found or not authorized' }, 404);
    return c.json(updatedBooking);
  } catch (err: any) {
    console.error('updateBooking error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const cancelBooking = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { id } = c.req.param();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: 'Invalid id' }, 400);

    const deleted = await db
      .delete(bookings)
      .where(and(eq(bookings.id, parsed), eq(bookings.userId, user.sub)))
      .run();
    if (!deleted.success) return c.json({ error: 'Booking not found or not authorized' }, 404);
    return c.json({ message: 'Booking cancelled successfully' });
  } catch (err: any) {
    console.error('cancelBooking error', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
