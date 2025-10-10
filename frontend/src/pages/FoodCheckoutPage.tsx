import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/store/cartStore";
import { useCreateFoodOrder } from "@/hooks/useFoodOrders";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const FoodCheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    foodItems: cartItems,
    clearFoodCart,
    getFoodTotalPrice,
  } = useCartStore();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = useCreateFoodOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      // Redirect to login
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        specialInstructions,
        roomNumber: roomNumber || undefined,
      };

      await createOrderMutation.mutateAsync(orderData);

      // Clear the cart and redirect
      clearFoodCart();
      navigate("/my-orders", {
        state: { message: "Your order has been placed successfully!" },
      });
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">
              Add some delicious items to your cart first!
            </p>
            <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 italic">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>${getFoodTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="roomNumber">Room Number (optional)</Label>
                <Input
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 101, 205A"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for pickup at restaurant
                </p>
              </div>

              <div>
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any dietary requirements, delivery preferences, or special requests..."
                  rows={4}
                />
              </div>

              {user && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/menu")}
                  className="flex-1"
                >
                  Back to Menu
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createOrderMutation.isPending}
                  className="flex-1"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodCheckoutPage;
