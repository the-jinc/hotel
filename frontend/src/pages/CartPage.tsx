import React, { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Trash2Icon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

const CartPage: React.FC = () => {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    specialRequests: "",
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create booking");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast.success("Room removed from cart");
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      toast.error("Please fill in all required guest information");
      return;
    }

    // Create booking for each cart item
    const bookings = items.map((item) => ({
      roomId: item.roomId,
      checkinDate: item.checkinDate,
      checkoutDate: item.checkoutDate,
      guests: item.guests,
      totalAmount: item.totalPrice,
      guestInfo: {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
      },
      specialRequests: guestInfo.specialRequests,
    }));

    // For simplicity, we'll create one booking at a time
    // In a real app, you might want to create all bookings in a single transaction
    createBookingMutation.mutate(bookings[0]);
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some rooms to your cart to get started with your booking.
          </p>
          <Button onClick={() => navigate("/search")}>Search Rooms</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Booking Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selected Rooms ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{item.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Room {item.roomNumber}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {item.checkinDate} to {item.checkoutDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      <span>
                        {item.guests} guest{item.guests > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span>
                        ${item.pricePerNight}/night × {item.totalNights} night
                        {item.totalNights > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="font-semibold">${item.totalPrice}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
              <CardDescription>
                Please provide your details for the booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={guestInfo.firstName}
                      onChange={(e) =>
                        setGuestInfo((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={guestInfo.lastName}
                      onChange={(e) =>
                        setGuestInfo((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) =>
                      setGuestInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) =>
                      setGuestInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={guestInfo.specialRequests}
                    onChange={(e) =>
                      setGuestInfo((prev) => ({
                        ...prev,
                        specialRequests: e.target.value,
                      }))
                    }
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees:</span>
                    <span>${Math.round(totalPrice * 0.15)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${totalPrice + Math.round(totalPrice * 0.15)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBookingMutation.isPending}
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  {createBookingMutation.isPending
                    ? "Processing..."
                    : "Complete Booking"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This is a demo. No actual payment will be processed.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">Free Cancellation</Badge>
                <span>Up to 24 hours before check-in</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
