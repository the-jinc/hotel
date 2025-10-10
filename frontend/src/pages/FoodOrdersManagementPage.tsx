import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useFoodOrders,
  useUpdateFoodOrderStatus,
  useFoodOrder,
} from "@/hooks/useFoodOrders";
import { Clock, User, MapPin } from "lucide-react";

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
      return "New Order";
    case "accepted":
      return "Accepted";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case "placed":
      return "accepted";
    case "accepted":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return "delivered";
    default:
      return null;
  }
};

const getNextStatusText = (currentStatus: string) => {
  switch (currentStatus) {
    case "placed":
      return "Accept Order";
    case "accepted":
      return "Start Preparing";
    case "preparing":
      return "Mark as Ready";
    case "ready":
      return "Mark as Delivered";
    default:
      return null;
  }
};

const FoodOrdersManagementPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  // Get orders based on active tab
  const statusFilter =
    activeTab === "active" ? "placed,accepted,preparing,ready" : undefined;
  const { data: orders = [], isLoading, refetch } = useFoodOrders(statusFilter);
  const { data: selectedOrder } = useFoodOrder(selectedOrderId);
  const updateStatusMutation = useUpdateFoodOrderStatus();

  // Auto-refresh every 10 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: "cancelled",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const filteredOrders =
    activeTab === "active"
      ? orders.filter(
          (order) => !["delivered", "cancelled"].includes(order.status)
        )
      : orders.filter((order) =>
          ["delivered", "cancelled"].includes(order.status)
        );

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Food Orders Management</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-green-600">
            Auto-refreshing every 10s
          </Badge>
          <Button onClick={() => refetch()} variant="outline">
            Refresh Now
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="border-l-4"
                style={{
                  borderLeftColor: getStatusColor(order.status).replace(
                    "bg-",
                    "#"
                  ),
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>
                      {order.user?.firstName} {order.user?.lastName}
                    </span>
                  </div>

                  {order.roomNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>Room {order.roomNumber}</span>
                    </div>
                  )}

                  <div className="text-lg font-semibold">
                    Total: ${parseFloat(order.totalAmount).toFixed(2)}
                  </div>

                  {order.specialInstructions && (
                    <div className="bg-yellow-50 p-2 rounded text-sm">
                      <strong>Special Instructions:</strong>{" "}
                      {order.specialInstructions}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="flex-1"
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
                                      <p className="text-xs text-red-600 italic">
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
                                  {parseFloat(
                                    selectedOrder.totalAmount
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {getNextStatus(order.status) && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(
                            order.id,
                            getNextStatus(order.status)!
                          )
                        }
                        disabled={updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        {getNextStatusText(order.status)}
                      </Button>
                    )}
                  </div>

                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={updateStatusMutation.isPending}
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        Cancel Order
                      </Button>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                <p className="text-gray-600">
                  All caught up! No orders to process right now.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="space-y-4">
            {filteredOrders.map((order) => (
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
                      <p className="text-sm text-gray-600">
                        Customer: {order.user?.firstName} {order.user?.lastName}
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
                                  {parseFloat(
                                    selectedOrder.totalAmount
                                  ).toFixed(2)}
                                </span>
                              </div>
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

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">
                  No completed orders
                </h3>
                <p className="text-gray-600">
                  Completed orders will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodOrdersManagementPage;
