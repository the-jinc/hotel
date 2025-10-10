import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useMyBookings,
  useCancelBooking,
  type BookingWithDetails,
} from "@/hooks/useBookings";
import {
  Calendar,
  Users,
  MapPin,
  Eye,
  XCircle,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";

export default function MyBookingsPage() {
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);

  const { data: bookings, isLoading, error } = useMyBookings();
  const cancelBookingMutation = useCancelBooking();

  const handleCancelBooking = async (bookingId: string) => {
    if (
      confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone."
      )
    ) {
      try {
        await cancelBookingMutation.mutateAsync(bookingId);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Failed to cancel booking. Please contact support.");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelBooking = (booking: BookingWithDetails) => {
    return (
      ["pending_payment", "confirmed"].includes(booking.status) &&
      new Date(booking.checkInDate) > new Date()
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Bookings
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <div className="text-sm text-muted-foreground">
            {bookings?.length || 0} booking{bookings?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                When you make a booking, it will appear here.
              </p>
              <Button asChild>
                <a href="/">Search for rooms</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          Booking #{booking.id.slice(-8).toUpperCase()}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booked on{" "}
                        {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${booking.totalAmount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total amount
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(booking.checkInDate),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(booking.checkOutDate),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.guestCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Room Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {booking.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{room.category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Room {room.roomNumber}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            ${room.nightlyRate}/night
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Special Requests</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>
                            Booking #{booking.id.slice(-8).toUpperCase()}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedBooking && (
                          <BookingDetailsModal booking={selectedBooking} />
                        )}
                      </DialogContent>
                    </Dialog>

                    {canCancelBooking(booking) && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelBookingMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Guest Booking Details Modal Component
function BookingDetailsModal({ booking }: { booking: BookingWithDetails }) {
  return (
    <div className="space-y-6">
      {/* Stay Information */}
      <div>
        <h3 className="font-semibold mb-3">Stay Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Check-in Date</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.checkInDate), "PPPP")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check-out Date</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.checkOutDate), "PPPP")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Number of Guests</p>
            <p className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              {booking.guestCount}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check-in Time</p>
            <p className="font-medium">3:00 PM</p>
          </div>
        </div>
      </div>

      {/* Room Information */}
      <div>
        <h3 className="font-semibold mb-3">Room Information</h3>
        <div className="space-y-3">
          {booking.rooms.map((room) => (
            <div key={room.id} className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{room.category.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Room {room.roomNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${room.nightlyRate}</p>
                  <p className="text-sm text-muted-foreground">per night</p>
                </div>
              </div>
              {room.category.description && (
                <p className="text-sm text-muted-foreground">
                  {room.category.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div>
          <h3 className="font-semibold mb-3">Special Requests</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{booking.specialRequests}</p>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div>
        <h3 className="font-semibold mb-3">Payment Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Total Amount</span>
            <span className="text-xl font-bold">${booking.totalAmount}</span>
          </div>
          {booking.payments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {payment.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="text-right">
                <p className="font-medium">${payment.amount}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {payment.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Information */}
      <div>
        <h3 className="font-semibold mb-3">Important Information</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Check-in time is 3:00 PM. Early check-in may be available upon
            request.
          </p>
          <p>
            • Check-out time is 11:00 AM. Late check-out may incur additional
            charges.
          </p>
          <p>• Please bring a valid photo ID at check-in.</p>
          <p>• For any changes or assistance, please contact our front desk.</p>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="font-semibold mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">info@hotel.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
