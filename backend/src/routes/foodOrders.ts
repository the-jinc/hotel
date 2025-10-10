import { Hono } from "hono";
import { FoodOrderService } from "../services/foodOrderService.js";
import { jwtAuth } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/rbac.js";

const app = new Hono();

// All routes require authentication
app.use("/*", jwtAuth);

// Guest routes - create order and view own orders
app.post("/", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const { items, specialInstructions, roomNumber } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json(
        {
          success: false,
          error: "Items array is required and cannot be empty",
        },
        400
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.foodItemId || !item.quantity || item.quantity <= 0) {
        return c.json(
          {
            success: false,
            error: "Each item must have foodItemId and positive quantity",
          },
          400
        );
      }
    }

    const order = await FoodOrderService.create({
      userId: user.id,
      items,
      specialInstructions,
      roomNumber,
    });

    return c.json({ success: true, data: order }, 201);
  } catch (error) {
    console.error("Error creating food order:", error);
    return c.json({ success: false, error: "Failed to create order" }, 500);
  }
});

app.get("/my-orders", async (c) => {
  try {
    const user = c.get("user");
    const orders = await FoodOrderService.getByUserId(user.id);
    return c.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return c.json({ success: false, error: "Failed to fetch orders" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const order = await FoodOrderService.getById(id);

    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    // Guests can only view their own orders, staff can view all
    if (user.role === "guest" && order.userId !== user.id) {
      return c.json({ success: false, error: "Access denied" }, 403);
    }

    return c.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ success: false, error: "Failed to fetch order" }, 500);
  }
});

// Staff routes - view and manage all orders
app.get(
  "/",
  roleMiddleware(["admin", "manager", "receptionist"]),
  async (c) => {
    try {
      const status = c.req.query("status");

      let orders;
      if (status) {
        const statuses = status.split(",");
        orders = await FoodOrderService.getByStatus(statuses);
      } else {
        orders = await FoodOrderService.getAll();
      }

      return c.json({ success: true, data: orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return c.json({ success: false, error: "Failed to fetch orders" }, 500);
    }
  }
);

app.post(
  "/:id/status",
  roleMiddleware(["admin", "manager", "receptionist"]),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const { status } = body;

      if (!status) {
        return c.json({ success: false, error: "Status is required" }, 400);
      }

      const validStatuses = [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return c.json(
          {
            success: false,
            error: `Invalid status. Valid statuses: ${validStatuses.join(
              ", "
            )}`,
          },
          400
        );
      }

      const order = await FoodOrderService.updateStatus(id, status);

      if (!order) {
        return c.json({ success: false, error: "Order not found" }, 404);
      }

      return c.json({ success: true, data: order });
    } catch (error) {
      console.error("Error updating order status:", error);
      return c.json(
        { success: false, error: "Failed to update order status" },
        500
      );
    }
  }
);

// Admin only - delete orders
app.delete("/:id", roleMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await FoodOrderService.delete(id);

    if (!deleted) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    return c.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return c.json({ success: false, error: "Failed to delete order" }, 500);
  }
});

export default app;
