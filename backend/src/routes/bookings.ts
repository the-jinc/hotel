import { Hono } from "hono";
import { BookingService } from "../services/bookingService.js";
import { jwtAuth } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/rbac.js";
import { createAuditMiddleware } from "../middleware/audit.js";

const bookings = new Hono();

// Create a new booking (Authenticated users)
bookings.post("/", jwtAuth, createAuditMiddleware.bookings(), async (c) => {
  try {
    const user = c.get("user");
    const { checkInDate, checkOutDate, guestCount, roomIds, specialRequests } =
      await c.req.json();

    if (!checkInDate || !checkOutDate || !guestCount || !roomIds?.length) {
      return c.json(
        { success: false, message: "Missing required fields" },
        400
      );
    }

    const booking = await BookingService.createBooking({
      userId: user.id,
      checkInDate,
      checkOutDate,
      guestCount,
      roomIds,
      specialRequests,
    });

    return c.json(
      {
        success: true,
        message: "Booking created successfully",
        data: booking,
      },
      201
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create booking",
      },
      400
    );
  }
});

// Process payment for a booking (Authenticated users)
bookings.post("/:id/payment", jwtAuth, async (c) => {
  try {
    const user = c.get("user");
    const bookingId = c.req.param("id");
    const { amount, paymentMethod, transactionId } = await c.req.json();

    if (!amount || !paymentMethod) {
      return c.json(
        { success: false, message: "Missing required payment fields" },
        400
      );
    }

    // Verify the booking belongs to the user (unless admin/manager)
    if (user.role === "guest") {
      const existingBooking = await BookingService.getBookingById(bookingId);
      if (existingBooking.userId !== user.id) {
        return c.json({ success: false, message: "Unauthorized" }, 403);
      }
    }

    const booking = await BookingService.processPayment({
      bookingId,
      amount,
      paymentMethod,
      transactionId,
    });

    return c.json({
      success: true,
      message: "Payment processed successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process payment",
      },
      400
    );
  }
});

// Get user's bookings (Authenticated users)
bookings.get("/my-bookings", jwtAuth, async (c) => {
  try {
    const user = c.get("user");
    const userBookings = await BookingService.getUserBookings(user.id);
    return c.json({
      success: true,
      data: userBookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return c.json({ success: false, message: "Failed to fetch bookings" }, 500);
  }
});

// Get all bookings (Admin/Manager/Receptionist only)
bookings.get(
  "/",
  jwtAuth,
  roleMiddleware(["admin", "manager", "receptionist"]),
  async (c) => {
    try {
      const allBookings = await BookingService.getAllBookings();
      return c.json({
        success: true,
        data: allBookings,
      });
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      return c.json(
        { success: false, message: "Failed to fetch bookings" },
        500
      );
    }
  }
);

// Get specific booking details (Owner or Staff)
bookings.get("/:id", jwtAuth, async (c) => {
  try {
    const user = c.get("user");
    const bookingId = c.req.param("id");

    const booking = await BookingService.getBookingById(bookingId);

    // Check if user can access this booking
    if (user.role === "guest" && booking.userId !== user.id) {
      return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    return c.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch booking",
      },
      404
    );
  }
});

// Cancel booking (Owner or Staff)
bookings.put(
  "/:id/cancel",
  jwtAuth,
  createAuditMiddleware.bookings(),
  async (c) => {
    try {
      const user = c.get("user");
      const bookingId = c.req.param("id");

      // Guests can only cancel their own bookings
      const userId = user.role === "guest" ? user.id : undefined;

      const booking = await BookingService.cancelBooking(bookingId, userId);
      return c.json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to cancel booking",
        },
        400
      );
    }
  }
);

// Update booking status (Staff only)
bookings.put(
  "/:id/status",
  jwtAuth,
  roleMiddleware(["admin", "manager", "receptionist"]),
  createAuditMiddleware.bookings(),
  async (c) => {
    try {
      const bookingId = c.req.param("id");
      const { status } = await c.req.json();

      if (!status) {
        return c.json({ success: false, message: "Status is required" }, 400);
      }

      const validStatuses = [
        "pending_payment",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return c.json({ success: false, message: "Invalid status" }, 400);
      }

      const updatedBooking = await BookingService.updateBookingStatus(
        bookingId,
        status
      );
      return c.json({
        success: true,
        message: "Booking status updated successfully",
        data: updatedBooking,
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      return c.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to update booking status",
        },
        400
      );
    }
  }
);

export default bookings;
