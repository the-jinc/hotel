import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBooking } from "@/hooks/useBookings";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;

  const { data: booking, isLoading, error } = useBooking(bookingId);

  useEffect(() => {
    if (!bookingId) {
      navigate("/");
    }
  }, [bookingId, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Booking Error
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't load your booking details. Please contact support.
          </p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your reservation. Your booking has been successfully
            processed.
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Booking Details
                </CardTitle>
                <CardDescription>
                  Confirmation #{booking.id.slice(-8).toUpperCase()}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="font-medium mb-2">Guest Information</h3>
              <div className="text-sm text-muted-foreground">
                <p>
                  {booking.user.firstName} {booking.user.lastName}
                </p>
                <p>{booking.user.email}</p>
                {booking.user.phone && <p>{booking.user.phone}</p>}
              </div>
            </div>

            <Separator />

            {/* Stay Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Stay Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.checkInDate), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.checkOutDate), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Guests</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guestCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Room Details */}
            <div>
              <h3 className="font-medium mb-3">Room Details</h3>
              <div className="space-y-3">
                {booking.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{room.category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {room.roomNumber} • ${room.nightlyRate}/night
                      </p>
                      {room.category.description && (
                        <p className="text-sm text-muted-foreground">
                          {room.category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Special Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialRequests}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="font-medium mb-3">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-sm font-medium">
                    ${booking.totalAmount}
                  </span>
                </div>
                {booking.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {payment.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                    <Badge
                      variant={
                        payment.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/my-bookings">View All Bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>

        {/* Important Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Check-in time is 3:00 PM. Early check-in may be available upon
              request.
            </p>
            <p>
              • Check-out time is 11:00 AM. Late check-out may incur additional
              charges.
            </p>
            <p>• Please bring a valid photo ID at check-in.</p>
            <p>• A confirmation email has been sent to {booking.user.email}</p>
            <p>
              • For any changes or cancellations, please contact our front desk.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
