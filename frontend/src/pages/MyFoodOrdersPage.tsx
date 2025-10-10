import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyFoodOrders, useFoodOrder } from "@/hooks/useFoodOrders";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const getStatusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-blue-500";
    case "accepted":
      return "bg-yellow-500";
    case "preparing":
      return "bg-orange-500";
    case "ready":
      return "bg-green-500";
    case "delivered":
      return "bg-gray-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "placed":
      return "Order Placed";
    case "accepted":
      return "Order Accepted";
    case "preparing":
      return "Being Prepared";
    case "ready":
      return "Ready for Pickup/Delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const MyFoodOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const { data: orders = [], isLoading } = useMyFoodOrders();
  const { data: selectedOrder } = useFoodOrder(selectedOrderId);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [location.state]);

  if (isLoading) {
    return <div>Loading your orders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Food Orders</h1>
        <Button onClick={() => navigate("/menu")}>Order More Food</Button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-4">
              You haven't placed any food orders yet.
            </p>
            <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Total: ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    {order.roomNumber && (
                      <p className="text-sm text-gray-600">
                        Room: {order.roomNumber}
                      </p>
                    )}
                    {order.specialInstructions && (
                      <p className="text-sm text-gray-600">
                        Note: {order.specialInstructions}
                      </p>
                    )}
                    {order.estimatedDeliveryTime && (
                      <p className="text-sm text-gray-600">
                        Estimated delivery:{" "}
                        {new Date(
                          order.estimatedDeliveryTime
                        ).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Items:</h4>
                            {selectedOrder.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center border-b pb-2 mb-2"
                              >
                                <div>
                                  <p className="font-medium">
                                    {item.foodItem.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    ${parseFloat(item.unitPrice).toFixed(2)} ×{" "}
                                    {item.quantity}
                                  </p>
                                  {item.specialInstructions && (
                                    <p className="text-xs text-gray-500 italic">
                                      Note: {item.specialInstructions}
                                    </p>
                                  )}
                                </div>
                                <div className="font-medium">
                                  $
                                  {(
                                    parseFloat(item.unitPrice) * item.quantity
                                  ).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>
                                $
                                {parseFloat(selectedOrder.totalAmount).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm">
                              <strong>Status:</strong>{" "}
                              {getStatusText(selectedOrder.status)}
                            </p>
                            <p className="text-sm">
                              <strong>Ordered:</strong>{" "}
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleString()}
                            </p>
                            {selectedOrder.roomNumber && (
                              <p className="text-sm">
                                <strong>Room:</strong>{" "}
                                {selectedOrder.roomNumber}
                              </p>
                            )}
                            {selectedOrder.specialInstructions && (
                              <p className="text-sm">
                                <strong>Special Instructions:</strong>{" "}
                                {selectedOrder.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFoodOrdersPage;
