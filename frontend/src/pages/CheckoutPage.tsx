import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore, type SelectedRoom } from "@/store/cartStore";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import { format, differenceInDays } from "date-fns";
import {
  CalendarDays,
  Users,
  MapPin,
  CreditCard,
  Banknote,
  Building,
} from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    checkInDate,
    checkOutDate,
    guestCount,
    selectedRooms,
    specialRequests,
    setSpecialRequests,
    clearCart,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "debit_card" | "cash" | "bank_transfer"
  >("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);

  const createBookingMutation = useCreateBooking();
  const processPaymentMutation = useProcessPayment();

  // Calculate totals
  const nights =
    checkInDate && checkOutDate
      ? differenceInDays(new Date(checkOutDate), new Date(checkInDate))
      : 0;
  const subtotal = selectedRooms.reduce(
    (total: number, room: SelectedRoom) => total + room.basePrice * nights,
    0
  );
  const tax = subtotal * 0.12; // 12% tax
  const total = subtotal + tax;

  // Redirect if cart is empty
  if (!checkInDate || !checkOutDate || selectedRooms.length === 0) {
    navigate("/search");
    return null;
  }

  const handleBooking = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Create the booking
      const booking = await createBookingMutation.mutateAsync({
        checkInDate: checkInDate!,
        checkOutDate: checkOutDate!,
        guestCount: guestCount!,
        roomIds: selectedRooms.map((room: SelectedRoom) => room.id),
        specialRequests: specialRequests || undefined,
      });

      // Process the payment
      await processPaymentMutation.mutateAsync({
        bookingId: booking.id,
        amount: total.toString(),
        paymentMethod,
      });

      // Clear the cart and redirect to success
      clearCart();
      navigate("/booking-success", {
        state: { bookingId: booking.id },
      });
    } catch (error) {
      console.error("Booking failed:", error);
      // Error will be shown via the mutation error state
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stay Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Check-in
                    </Label>
                    <p className="font-medium">
                      {format(new Date(checkInDate!), "PPP")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Check-out
                    </Label>
                    <p className="font-medium">
                      {format(new Date(checkOutDate!), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {guestCount} guest{guestCount! > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {nights} night{nights > 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Selected Rooms */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRooms.map((room: SelectedRoom) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{room.categoryName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Room {room.roomNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {room.categoryDescription}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${room.basePrice}/night</p>
                      <p className="text-sm text-muted-foreground">
                        ${room.basePrice * nights} total
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
                <CardDescription>
                  Any special requests or requirements for your stay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., High floor room, early check-in, extra pillows..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label
                      htmlFor="credit_card"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit_card" id="debit_card" />
                    <Label
                      htmlFor="debit_card"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label
                      htmlFor="bank_transfer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Building className="h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label
                      htmlFor="cash"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Banknote className="h-4 w-4" />
                      Cash (Pay at Hotel)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {selectedRooms.map((room: SelectedRoom) => (
                    <div key={room.id} className="flex justify-between text-sm">
                      <span>
                        {room.categoryName} × {nights} nights
                      </span>
                      <span>${room.basePrice * nights}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={
                    isProcessing ||
                    createBookingMutation.isPending ||
                    processPaymentMutation.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {isProcessing
                    ? "Processing..."
                    : `Complete Booking - $${total.toFixed(2)}`}
                </Button>

                {(createBookingMutation.error ||
                  processPaymentMutation.error) && (
                  <div className="text-red-600 text-sm">
                    {createBookingMutation.error?.message ||
                      processPaymentMutation.error?.message}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  By completing this booking, you agree to our terms and
                  conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
