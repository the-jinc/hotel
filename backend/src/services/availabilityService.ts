import { db } from "../db/index.js";
import { rooms, roomCategories, bookings, bookingRooms } from "../db/schema.js";
import { sql, eq, and, or, notInArray } from "drizzle-orm";

export interface AvailabilityQuery {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  categoryId?: string;
}

export interface AvailableRoom {
  id: string;
  roomNumber: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    maxOccupancy: number;
    amenities: string | null;
    images: string | null;
  };
  status: string;
  floor: number;
}

export class AvailabilityService {
  static async searchAvailableRooms(
    query: AvailabilityQuery
  ): Promise<AvailableRoom[]> {
    const { checkInDate, checkOutDate, guestCount, categoryId } = query;

    // Parse dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new Error("Check-out date must be after check-in date");
    }

    if (checkIn < new Date()) {
      throw new Error("Check-in date cannot be in the past");
    }

    // Find rooms that are NOT booked for the given date range
    // A room is unavailable if there's a confirmed booking that overlaps with the requested dates
    const unavailableRoomIds = await db
      .select({ roomId: bookingRooms.roomId })
      .from(bookingRooms)
      .innerJoin(bookings, eq(bookings.id, bookingRooms.bookingId))
      .where(
        and(
          // Booking is confirmed (not cancelled or pending)
          or(
            eq(bookings.status, "confirmed"),
            eq(bookings.status, "checked_in"),
            eq(bookings.status, "pending_payment")
          ),
          // Date overlap check:
          // New booking overlaps if: checkIn < existing_checkOut AND checkOut > existing_checkIn
          and(
            sql`${checkIn} < ${bookings.checkOutDate}`,
            sql`${checkOut} > ${bookings.checkInDate}`
          )
        )
      );

    const unavailableIds = unavailableRoomIds.map((row) => row.roomId);

    // Build the query for available rooms
    let whereConditions = and(
      eq(rooms.status, "available"), // Room must be available (not cleaning, out of service)
      // Exclude unavailable rooms
      unavailableIds.length > 0
        ? notInArray(rooms.id, unavailableIds)
        : undefined
    );

    // Add category filter if specified
    if (categoryId) {
      whereConditions = and(whereConditions, eq(rooms.categoryId, categoryId));
    }

    // Get available rooms with their categories
    const availableRooms = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        categoryId: rooms.categoryId,
        status: rooms.status,
        floor: rooms.floor,
        category: {
          id: roomCategories.id,
          name: roomCategories.name,
          description: roomCategories.description,
          basePrice: roomCategories.basePrice,
          maxOccupancy: roomCategories.maxOccupancy,
          amenities: roomCategories.amenities,
          images: roomCategories.images,
        },
      })
      .from(rooms)
      .innerJoin(roomCategories, eq(rooms.categoryId, roomCategories.id))
      .where(
        and(
          whereConditions,
          // Check if category can accommodate the guest count
          sql`${roomCategories.maxOccupancy} >= ${guestCount}`
        )
      )
      .orderBy(roomCategories.basePrice, rooms.roomNumber);

    return availableRooms;
  }

  static async getRoomDetails(roomId: string): Promise<AvailableRoom | null> {
    const room = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        categoryId: rooms.categoryId,
        status: rooms.status,
        floor: rooms.floor,
        category: {
          id: roomCategories.id,
          name: roomCategories.name,
          description: roomCategories.description,
          basePrice: roomCategories.basePrice,
          maxOccupancy: roomCategories.maxOccupancy,
          amenities: roomCategories.amenities,
          images: roomCategories.images,
        },
      })
      .from(rooms)
      .innerJoin(roomCategories, eq(rooms.categoryId, roomCategories.id))
      .where(eq(rooms.id, roomId))
      .limit(1);

    return room[0] || null;
  }

  static async getAllRoomCategories() {
    return await db
      .select()
      .from(roomCategories)
      .orderBy(roomCategories.basePrice);
  }

  static calculateTotalPrice(
    basePrice: string,
    checkInDate: string,
    checkOutDate: string
  ): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return parseFloat(basePrice) * nights;
  }
}
