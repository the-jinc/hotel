import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  foodOrders,
  foodOrderItems,
  foodItems,
  users,
  type FoodOrder,
  type NewFoodOrder,
  type NewFoodOrderItem,
} from "../db/schema.js";

export interface CreateOrderData {
  userId: string;
  items: {
    foodItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  specialInstructions?: string;
  roomNumber?: string;
}

export class FoodOrderService {
  static async getAll(): Promise<any[]> {
    return await db
      .select({
        id: foodOrders.id,
        userId: foodOrders.userId,
        totalAmount: foodOrders.totalAmount,
        status: foodOrders.status,
        specialInstructions: foodOrders.specialInstructions,
        roomNumber: foodOrders.roomNumber,
        estimatedDeliveryTime: foodOrders.estimatedDeliveryTime,
        createdAt: foodOrders.createdAt,
        updatedAt: foodOrders.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(foodOrders)
      .leftJoin(users, eq(foodOrders.userId, users.id))
      .orderBy(desc(foodOrders.createdAt));
  }

  static async getById(id: string): Promise<any | null> {
    const orderResult = await db
      .select({
        id: foodOrders.id,
        userId: foodOrders.userId,
        totalAmount: foodOrders.totalAmount,
        status: foodOrders.status,
        specialInstructions: foodOrders.specialInstructions,
        roomNumber: foodOrders.roomNumber,
        estimatedDeliveryTime: foodOrders.estimatedDeliveryTime,
        createdAt: foodOrders.createdAt,
        updatedAt: foodOrders.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(foodOrders)
      .leftJoin(users, eq(foodOrders.userId, users.id))
      .where(eq(foodOrders.id, id))
      .limit(1);

    if (!orderResult[0]) return null;

    const orderItemsResult = await db
      .select({
        id: foodOrderItems.id,
        quantity: foodOrderItems.quantity,
        unitPrice: foodOrderItems.unitPrice,
        specialInstructions: foodOrderItems.specialInstructions,
        foodItem: {
          id: foodItems.id,
          name: foodItems.name,
          description: foodItems.description,
          price: foodItems.price,
          image: foodItems.image,
        },
      })
      .from(foodOrderItems)
      .leftJoin(foodItems, eq(foodOrderItems.foodItemId, foodItems.id))
      .where(eq(foodOrderItems.orderId, id));

    return {
      ...orderResult[0],
      items: orderItemsResult,
    };
  }

  static async getByUserId(userId: string): Promise<any[]> {
    return await db
      .select({
        id: foodOrders.id,
        userId: foodOrders.userId,
        totalAmount: foodOrders.totalAmount,
        status: foodOrders.status,
        specialInstructions: foodOrders.specialInstructions,
        roomNumber: foodOrders.roomNumber,
        estimatedDeliveryTime: foodOrders.estimatedDeliveryTime,
        createdAt: foodOrders.createdAt,
        updatedAt: foodOrders.updatedAt,
      })
      .from(foodOrders)
      .where(eq(foodOrders.userId, userId))
      .orderBy(desc(foodOrders.createdAt));
  }

  static async getByStatus(statuses: string[]): Promise<any[]> {
    const validStatuses = statuses.filter((status) =>
      [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ].includes(status)
    ) as (
      | "placed"
      | "accepted"
      | "preparing"
      | "ready"
      | "delivered"
      | "cancelled"
    )[];

    return await db
      .select({
        id: foodOrders.id,
        userId: foodOrders.userId,
        totalAmount: foodOrders.totalAmount,
        status: foodOrders.status,
        specialInstructions: foodOrders.specialInstructions,
        roomNumber: foodOrders.roomNumber,
        estimatedDeliveryTime: foodOrders.estimatedDeliveryTime,
        createdAt: foodOrders.createdAt,
        updatedAt: foodOrders.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(foodOrders)
      .leftJoin(users, eq(foodOrders.userId, users.id))
      .where(inArray(foodOrders.status, validStatuses))
      .orderBy(desc(foodOrders.createdAt));
  }

  static async create(data: CreateOrderData): Promise<any> {
    return await db.transaction(async (tx) => {
      // Calculate total amount
      const itemIds = data.items.map((item) => item.foodItemId);
      const foodItemsData = await tx
        .select()
        .from(foodItems)
        .where(inArray(foodItems.id, itemIds));

      let totalAmount = 0;
      const orderItemsData: NewFoodOrderItem[] = [];

      for (const orderItem of data.items) {
        const foodItem = foodItemsData.find(
          (fi) => fi.id === orderItem.foodItemId
        );
        if (!foodItem) {
          throw new Error(`Food item ${orderItem.foodItemId} not found`);
        }

        const itemTotal = Number(foodItem.price) * orderItem.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          orderId: "", // Will be set after creating the order
          foodItemId: orderItem.foodItemId,
          quantity: orderItem.quantity,
          unitPrice: foodItem.price,
          specialInstructions: orderItem.specialInstructions,
        });
      }

      // Create the order
      const orderResult = await tx
        .insert(foodOrders)
        .values({
          userId: data.userId,
          totalAmount: totalAmount.toFixed(2),
          specialInstructions: data.specialInstructions,
          roomNumber: data.roomNumber,
          updatedAt: new Date(),
        })
        .returning();

      const order = orderResult[0];

      // Create order items
      const orderItemsWithOrderId = orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await tx.insert(foodOrderItems).values(orderItemsWithOrderId);

      return order;
    });
  }

  static async updateStatus(
    id: string,
    status: string
  ): Promise<FoodOrder | null> {
    // Validate status transition
    const validStatuses = [
      "placed",
      "accepted",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const result = await db
      .update(foodOrders)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(foodOrders.id, id))
      .returning();

    return result[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(foodOrders)
      .where(eq(foodOrders.id, id))
      .returning();

    return result.length > 0;
  }
}
