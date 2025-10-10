import { db } from "../db/index.js";
import {
  bookings,
  bookingRooms,
  payments,
  rooms,
  roomCategories,
  users,
} from "../db/schema.js";
import { eq, and, or, sql } from "drizzle-orm";
import { AvailabilityService } from "./availabilityService.js";
import { bookingOperationsTotal, databaseQueryDuration } from "../metrics.js";

export interface CreateBookingData {
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  roomIds: string[];
  specialRequests?: string;
}

export interface BookingWithDetails {
  id: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  status: string;
  guestCount: number;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  rooms: Array<{
    id: string;
    roomNumber: string;
    nightlyRate: string;
    category: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
}

export interface PaymentData {
  bookingId: string;
  amount: string;
  paymentMethod: "credit_card" | "debit_card" | "cash" | "bank_transfer";
  transactionId?: string;
}

export class BookingService {
  static async createBooking(
    data: CreateBookingData
  ): Promise<BookingWithDetails> {
    const startTime = Date.now();

    try {
      // Start a transaction
      const result = await db.transaction(async (tx) => {
        const {
          userId,
          checkInDate,
          checkOutDate,
          guestCount,
          roomIds,
          specialRequests,
        } = data;

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkIn >= checkOut) {
          throw new Error("Check-out date must be after check-in date");
        }

        if (checkIn < new Date()) {
          throw new Error("Check-in date cannot be in the past");
        }

        // Check if all rooms are still available
        const unavailableRoomIds = await tx
          .select({ roomId: bookingRooms.roomId })
          .from(bookingRooms)
          .innerJoin(bookings, eq(bookings.id, bookingRooms.bookingId))
          .where(
            and(
              // Booking is not cancelled
              or(
                eq(bookings.status, "confirmed"),
                eq(bookings.status, "checked_in"),
                eq(bookings.status, "pending_payment")
              ),
              // Date overlap check
              and(
                sql`${checkIn} < ${bookings.checkOutDate}`,
                sql`${checkOut} > ${bookings.checkInDate}`
              ),
              // Check if any of our requested rooms are in this list
              sql`${bookingRooms.roomId} = ANY(${roomIds})`
            )
          );

        if (unavailableRoomIds.length > 0) {
          throw new Error(
            "One or more selected rooms are no longer available for the selected dates"
          );
        }

        // Get room details with categories for pricing
        const roomDetails = await tx
          .select({
            id: rooms.id,
            roomNumber: rooms.roomNumber,
            categoryId: rooms.categoryId,
            basePrice: roomCategories.basePrice,
            categoryName: roomCategories.name,
            categoryDescription: roomCategories.description,
          })
          .from(rooms)
          .innerJoin(roomCategories, eq(rooms.categoryId, roomCategories.id))
          .where(sql`${rooms.id} = ANY(${roomIds})`);

        if (roomDetails.length !== roomIds.length) {
          throw new Error("One or more rooms not found");
        }

        // Calculate total amount
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalAmount = roomDetails.reduce(
          (sum, room) => sum + parseFloat(room.basePrice) * nights,
          0
        );

        // Create the booking
        const [newBooking] = await tx
          .insert(bookings)
          .values({
            userId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalAmount: totalAmount.toString(),
            status: "pending_payment",
            guestCount,
            specialRequests,
          })
          .returning();

        // Create booking room relationships
        const bookingRoomData = roomDetails.map((room) => ({
          bookingId: newBooking.id,
          roomId: room.id,
          nightlyRate: room.basePrice,
        }));

        await tx.insert(bookingRooms).values(bookingRoomData);

        // Return the booking with details
        return await this.getBookingById(newBooking.id, tx);
      });

      // Record successful booking creation
      bookingOperationsTotal.labels("create", "success").inc();
      databaseQueryDuration
        .labels("create_booking", "bookings")
        .observe((Date.now() - startTime) / 1000);

      return result;
    } catch (error) {
      // Record failed booking creation
      bookingOperationsTotal.labels("create", "error").inc();
      throw error;
    }
  }

  static async processPayment(data: PaymentData): Promise<BookingWithDetails> {
    return await db.transaction(async (tx) => {
      const { bookingId, amount, paymentMethod, transactionId } = data;

      // Get the booking
      const booking = await tx.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "pending_payment") {
        throw new Error("Booking is not pending payment");
      }

      if (parseFloat(amount) !== parseFloat(booking.totalAmount)) {
        throw new Error("Payment amount does not match booking total");
      }

      // Create payment record
      await tx.insert(payments).values({
        bookingId,
        amount,
        paymentMethod,
        transactionId:
          transactionId ||
          `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "completed",
      });

      // Update booking status to confirmed
      await tx
        .update(bookings)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId));

      // Return updated booking
      return await this.getBookingById(bookingId, tx);
    });
  }

  static async getBookingById(
    bookingId: string,
    transaction?: any
  ): Promise<BookingWithDetails> {
    const dbInstance = transaction || db;

    const booking = await dbInstance.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        bookingRooms: {
          with: {
            room: {
              with: {
                category: {
                  columns: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Transform the data structure
    return {
      id: booking.id,
      userId: booking.userId,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      totalAmount: booking.totalAmount,
      status: booking.status,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      user: booking.user,
      rooms: booking.bookingRooms.map((br: any) => ({
        id: br.room.id,
        roomNumber: br.room.roomNumber,
        nightlyRate: br.nightlyRate,
        category: br.room.category,
      })),
      payments: booking.payments.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  static async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        bookingRooms: {
          with: {
            room: {
              with: {
                category: {
                  columns: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    return userBookings.map((booking) => ({
      id: booking.id,
      userId: booking.userId,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      totalAmount: booking.totalAmount,
      status: booking.status,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      user: booking.user,
      rooms: booking.bookingRooms.map((br) => ({
        id: br.room.id,
        roomNumber: br.room.roomNumber,
        nightlyRate: br.nightlyRate,
        category: br.room.category,
      })),
      payments: booking.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    }));
  }

  static async getAllBookings(): Promise<BookingWithDetails[]> {
    const allBookings = await db.query.bookings.findMany({
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        bookingRooms: {
          with: {
            room: {
              with: {
                category: {
                  columns: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    return allBookings.map((booking) => ({
      id: booking.id,
      userId: booking.userId,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      totalAmount: booking.totalAmount,
      status: booking.status,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      user: booking.user,
      rooms: booking.bookingRooms.map((br) => ({
        id: br.room.id,
        roomNumber: br.room.roomNumber,
        nightlyRate: br.nightlyRate,
        category: br.room.category,
      })),
      payments: booking.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    }));
  }

  static async cancelBooking(
    bookingId: string,
    userId?: string
  ): Promise<BookingWithDetails> {
    return await db.transaction(async (tx) => {
      const booking = await tx.query.bookings.findFirst({
        where: userId
          ? and(eq(bookings.id, bookingId), eq(bookings.userId, userId))
          : eq(bookings.id, bookingId),
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.status === "checked_out") {
        throw new Error("Cannot cancel a completed booking");
      }

      // Update booking status
      await tx
        .update(bookings)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId));

      return await this.getBookingById(bookingId, tx);
    });
  }

  static async updateBookingStatus(
    bookingId: string,
    newStatus:
      | "pending_payment"
      | "confirmed"
      | "checked_in"
      | "checked_out"
      | "cancelled"
  ): Promise<BookingWithDetails> {
    const validStatuses = [
      "pending_payment",
      "confirmed",
      "checked_in",
      "checked_out",
      "cancelled",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid status");
    }

    return await db.transaction(async (tx) => {
      const booking = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) {
        throw new Error("Booking not found");
      }

      const currentBooking = booking[0];

      // Basic status transition validation
      // In a real system, you'd want more sophisticated rules
      if (currentBooking.status === "cancelled" && newStatus !== "cancelled") {
        throw new Error("Cannot change status of cancelled booking");
      }

      if (
        currentBooking.status === "checked_out" &&
        newStatus !== "checked_out"
      ) {
        throw new Error("Cannot change status of completed booking");
      }

      await tx
        .update(bookings)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId));

      return await this.getBookingById(bookingId, tx);
    });
  }
}
