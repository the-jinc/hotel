import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { reviews, roomTypes, users } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export const getAllReviews = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const allReviews = await db.select().from(reviews).all();
    return c.json(allReviews);
  } catch (err: any) {
    console.error("getAllReviews error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getReviewById = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    const { id } = c.req.param();
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: "Invalid id" }, 400);

    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parsed))
      .get();

    if (!review) return c.json({ error: "Review not found" }, 404);
    return c.json(review);
  } catch (err: any) {
    console.error("getReviewById error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const createReview = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { rating, comment, roomTypeId } = await c.req.json();

  if (!rating || !comment || !roomTypeId) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    // Basic validation for room type existence
    const roomType = await db
      .select()
      .from(roomTypes)
      .where(eq(roomTypes.id, roomTypeId))
      .get();
    if (!roomType) return c.json({ error: "Invalid room type" }, 400);

    const newReview = await db
      .insert(reviews)
      .values({
        userId: user.sub,
        rating,
        comment,
        roomTypeId,
      })
      .returning()
      .get();
    return c.json(newReview, 201);
  } catch (err: any) {
    console.error("createReview error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const updateReview = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { id } = c.req.param();
  const { rating, comment, isVisible } = await c.req.json();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: "Invalid id" }, 400);

    const updatedReview = await db
      .update(reviews)
      .set({
        rating,
        comment,
        isVisible,
      })
      .where(and(eq(reviews.id, parsed), eq(reviews.userId, user.sub)))
      .returning()
      .get();

    if (!updatedReview)
      return c.json({ error: "Review not found or not authorized" }, 404);
    return c.json(updatedReview);
  } catch (err: any) {
    console.error("updateReview error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deleteReview = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const user = c.get("jwtPayload");
  const { id } = c.req.param();
  try {
    const parsed = parseInt(id);
    if (Number.isNaN(parsed)) return c.json({ error: "Invalid id" }, 400);

    const deleted = await db
      .delete(reviews)
      .where(and(eq(reviews.id, parsed), eq(reviews.userId, user.sub)))
      .run();
    if (!deleted.success)
      return c.json({ error: "Review not found or not authorized" }, 404);
    return c.json({ message: "Review deleted successfully" });
  } catch (err: any) {
    console.error("deleteReview error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Public reviews (visible) with user name and room type name
export const getPublicReviews = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  try {
    // Fetch visible reviews and join manually (simple approach due to sqlite + drizzle limitations in D1)
    const all = await db.select().from(reviews).all();
    const visible = all.filter((r) => (r as any).isVisible);

    // Fetch related users & room types once
    const userRows = await db.select().from(users).all();
    const roomRows = await db.select().from(roomTypes).all();

    const userMap = new Map(userRows.map((u) => [(u as any).id, u]));
    const roomMap = new Map(roomRows.map((r) => [(r as any).id, r]));

    // Latest first
    visible.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    const payload = visible.slice(0, 12).map((r) => {
      const u: any = userMap.get((r as any).userId) || {};
      const room: any = roomMap.get((r as any).roomTypeId) || {};
      return {
        id: (r as any).id,
        rating: (r as any).rating,
        comment: (r as any).comment,
        userName: u.name || "Guest",
        userImage: null, // placeholder for future avatar feature
        roomTypeName: room.type || "Room",
        createdAt: (r as any).createdAt,
      };
    });

    return c.json(payload);
  } catch (err: any) {
    console.error("getPublicReviews error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};
