import { db } from "../db/index.js";
import {
  rooms,
  roomCategories,
  bookings,
  bookingRooms,
  type NewRoom,
  type Room,
} from "../db/schema.js";
import { eq, and, or, sql } from "drizzle-orm";

export interface RoomWithCategory extends Room {
  category: {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    maxOccupancy: number;
    amenities: string | null;
    images: string | null;
  };
}

export interface RoomAvailabilityQuery {
  checkInDate: Date;
  checkOutDate: Date;
  guestCount?: number;
}

export class RoomService {
  static async getAllRooms(): Promise<RoomWithCategory[]> {
    return (await db.query.rooms.findMany({
      with: {
        category: true,
      },
      orderBy: (rooms, { asc }) => [asc(rooms.roomNumber)],
    })) as RoomWithCategory[];
  }

  static async getRoomById(id: string): Promise<RoomWithCategory | null> {
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
      with: {
        category: true,
      },
    });
    return (room as RoomWithCategory) || null;
  }

  static async getRoomsByCategory(
    categoryId: string
  ): Promise<RoomWithCategory[]> {
    return (await db.query.rooms.findMany({
      where: eq(rooms.categoryId, categoryId),
      with: {
        category: true,
      },
      orderBy: (rooms, { asc }) => [asc(rooms.roomNumber)],
    })) as RoomWithCategory[];
  }

  static async createRoom(data: NewRoom): Promise<RoomWithCategory> {
    // Check if room number already exists
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.roomNumber, data.roomNumber),
    });

    if (existingRoom) {
      throw new Error("Room number already exists");
    }

    // Verify category exists
    const category = await db.query.roomCategories.findFirst({
      where: eq(roomCategories.id, data.categoryId),
    });

    if (!category) {
      throw new Error("Room category not found");
    }

    const [newRoom] = await db.insert(rooms).values(data).returning();

    return (await this.getRoomById(newRoom.id)) as RoomWithCategory;
  }

  static async updateRoom(
    id: string,
    updates: Partial<NewRoom>
  ): Promise<RoomWithCategory | null> {
    // If updating room number, check for duplicates
    if (updates.roomNumber) {
      const existingRoom = await db.query.rooms.findFirst({
        where: and(
          eq(rooms.roomNumber, updates.roomNumber),
          sql`${rooms.id} != ${id}`
        ),
      });

      if (existingRoom) {
        throw new Error("Room number already exists");
      }
    }

    // If updating category, verify it exists
    if (updates.categoryId) {
      const category = await db.query.roomCategories.findFirst({
        where: eq(roomCategories.id, updates.categoryId),
      });

      if (!category) {
        throw new Error("Room category not found");
      }
    }

    const [updatedRoom] = await db
      .update(rooms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rooms.id, id))
      .returning();

    if (!updatedRoom) {
      return null;
    }

    return (await this.getRoomById(updatedRoom.id)) as RoomWithCategory;
  }

  static async deleteRoom(id: string): Promise<boolean> {
    // Check if room has any bookings
    const roomWithBookings = await db.query.rooms.findFirst({
      where: eq(rooms.id, id),
      with: {
        bookingRooms: {
          with: {
            booking: true,
          },
        },
      },
    });

    if (
      roomWithBookings?.bookingRooms &&
      roomWithBookings.bookingRooms.length > 0
    ) {
      throw new Error("Cannot delete room with existing bookings");
    }

    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return result.length > 0;
  }

  static async updateRoomStatus(
    id: string,
    status: "available" | "booked" | "cleaning" | "out_of_service"
  ): Promise<RoomWithCategory | null> {
    return await this.updateRoom(id, { status });
  }

  static async getAvailableRooms(
    query: RoomAvailabilityQuery
  ): Promise<RoomWithCategory[]> {
    const { checkInDate, checkOutDate, guestCount } = query;

    // Get all rooms that are not booked during the specified period
    const availableRooms = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        categoryId: rooms.categoryId,
        status: rooms.status,
        floor: rooms.floor,
        notes: rooms.notes,
        createdAt: rooms.createdAt,
        updatedAt: rooms.updatedAt,
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
      .leftJoin(roomCategories, eq(rooms.categoryId, roomCategories.id))
      .leftJoin(bookingRooms, eq(rooms.id, bookingRooms.roomId))
      .leftJoin(
        bookings,
        and(
          eq(bookingRooms.bookingId, bookings.id),
          // Check for date overlap: booking overlaps if checkout > checkin and checkin < checkout
          sql`${bookings.checkOutDate} > ${checkInDate} AND ${bookings.checkInDate} < ${checkOutDate}`,
          // Only consider confirmed or checked-in bookings
          or(
            eq(bookings.status, "confirmed"),
            eq(bookings.status, "checked_in")
          )
        )
      )
      .where(
        and(
          eq(rooms.status, "available"),
          sql`${bookings.id} IS NULL`, // No conflicting bookings
          guestCount
            ? sql`${roomCategories.maxOccupancy} >= ${guestCount}`
            : undefined
        )
      )
      .groupBy(rooms.id, roomCategories.id);

    return availableRooms as RoomWithCategory[];
  }
}
