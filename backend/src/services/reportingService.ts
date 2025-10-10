import { eq, gte, lte, and, sql, desc, count, sum } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  bookings,
  bookingRooms,
  rooms,
  roomCategories,
  payments,
  foodOrders,
  foodOrderItems,
  foodItems,
  foodCategories,
  users,
} from "../db/schema.js";

export interface OccupancyReport {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
}

export interface RevenueReport {
  date: string;
  roomRevenue: number;
  foodRevenue: number;
  totalRevenue: number;
  bookingsCount: number;
  ordersCount: number;
}

export interface FoodSalesReport {
  categoryName: string;
  itemName: string;
  quantitySold: number;
  revenue: number;
  averageOrderValue: number;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  groupBy?: "day" | "week" | "month";
}

class ReportingService {
  async getOccupancyReport(filters: ReportFilters): Promise<OccupancyReport[]> {
    const { startDate, endDate, groupBy = "day" } = filters;

    // Get total rooms count
    const totalRoomsResult = await db.select({ count: count() }).from(rooms);
    const totalRooms = totalRoomsResult[0].count;

    // Get occupancy data with date grouping
    const dateFormat = this.getDateFormat(groupBy);

    const occupancyData = await db
      .select({
        date: sql`DATE_TRUNC('${sql.raw(groupBy)}', ${
          bookings.checkInDate
        })::date`.as("date"),
        occupiedRooms: count(sql`DISTINCT ${bookingRooms.roomId}`),
        totalRevenue: sum(
          sql`${bookingRooms.nightlyRate} * EXTRACT(epoch FROM (${bookings.checkOutDate} - ${bookings.checkInDate})) / 86400`
        ),
        bookingsCount: count(bookings.id),
      })
      .from(bookings)
      .leftJoin(bookingRooms, eq(bookings.id, bookingRooms.bookingId))
      .where(
        and(
          gte(bookings.checkInDate, new Date(startDate)),
          lte(bookings.checkInDate, new Date(endDate)),
          eq(bookings.status, "checked_in")
        )
      )
      .groupBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${bookings.checkInDate})::date`
      )
      .orderBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${bookings.checkInDate})::date`
      );

    return occupancyData.map((row) => {
      const occupancyRate = (Number(row.occupiedRooms) / totalRooms) * 100;
      const adr = Number(row.totalRevenue) / Number(row.bookingsCount) || 0;
      const revpar = adr * (occupancyRate / 100);

      return {
        date: row.date as string,
        totalRooms,
        occupiedRooms: Number(row.occupiedRooms),
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        adr: Math.round(adr * 100) / 100,
        revpar: Math.round(revpar * 100) / 100,
      };
    });
  }

  async getRevenueReport(filters: ReportFilters): Promise<RevenueReport[]> {
    const { startDate, endDate, groupBy = "day" } = filters;

    // Get room revenue
    const roomRevenueData = await db
      .select({
        date: sql`DATE_TRUNC('${sql.raw(groupBy)}', ${
          payments.createdAt
        })::date`.as("date"),
        revenue: sum(payments.amount),
        bookingsCount: count(sql`DISTINCT ${payments.bookingId}`),
      })
      .from(payments)
      .leftJoin(bookings, eq(payments.bookingId, bookings.id))
      .where(
        and(
          gte(payments.createdAt, new Date(startDate)),
          lte(payments.createdAt, new Date(endDate)),
          eq(payments.status, "completed")
        )
      )
      .groupBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${payments.createdAt})::date`
      )
      .orderBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${payments.createdAt})::date`
      );

    // Get food revenue
    const foodRevenueData = await db
      .select({
        date: sql`DATE_TRUNC('${sql.raw(groupBy)}', ${
          foodOrders.createdAt
        })::date`.as("date"),
        revenue: sum(foodOrders.totalAmount),
        ordersCount: count(foodOrders.id),
      })
      .from(foodOrders)
      .where(
        and(
          gte(foodOrders.createdAt, new Date(startDate)),
          lte(foodOrders.createdAt, new Date(endDate)),
          eq(foodOrders.status, "delivered")
        )
      )
      .groupBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${foodOrders.createdAt})::date`
      )
      .orderBy(
        sql`DATE_TRUNC('${sql.raw(groupBy)}', ${foodOrders.createdAt})::date`
      );

    // Merge the data by date
    const revenueMap = new Map<string, RevenueReport>();

    roomRevenueData.forEach((row) => {
      const date = row.date as string;
      revenueMap.set(date, {
        date,
        roomRevenue: Number(row.revenue) || 0,
        foodRevenue: 0,
        totalRevenue: Number(row.revenue) || 0,
        bookingsCount: Number(row.bookingsCount) || 0,
        ordersCount: 0,
      });
    });

    foodRevenueData.forEach((row) => {
      const date = row.date as string;
      const existing = revenueMap.get(date);
      if (existing) {
        existing.foodRevenue = Number(row.revenue) || 0;
        existing.totalRevenue += existing.foodRevenue;
        existing.ordersCount = Number(row.ordersCount) || 0;
      } else {
        revenueMap.set(date, {
          date,
          roomRevenue: 0,
          foodRevenue: Number(row.revenue) || 0,
          totalRevenue: Number(row.revenue) || 0,
          bookingsCount: 0,
          ordersCount: Number(row.ordersCount) || 0,
        });
      }
    });

    return Array.from(revenueMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  async getFoodSalesReport(filters: ReportFilters): Promise<FoodSalesReport[]> {
    const { startDate, endDate } = filters;

    const foodSalesData = await db
      .select({
        categoryName: foodCategories.name,
        itemName: foodItems.name,
        quantitySold: sum(foodOrderItems.quantity),
        revenue: sum(
          sql`${foodOrderItems.quantity} * ${foodOrderItems.unitPrice}`
        ),
        ordersCount: count(sql`DISTINCT ${foodOrderItems.orderId}`),
      })
      .from(foodOrderItems)
      .leftJoin(foodItems, eq(foodOrderItems.foodItemId, foodItems.id))
      .leftJoin(foodCategories, eq(foodItems.categoryId, foodCategories.id))
      .leftJoin(foodOrders, eq(foodOrderItems.orderId, foodOrders.id))
      .where(
        and(
          gte(foodOrders.createdAt, new Date(startDate)),
          lte(foodOrders.createdAt, new Date(endDate)),
          eq(foodOrders.status, "delivered")
        )
      )
      .groupBy(foodCategories.name, foodItems.name)
      .orderBy(
        desc(sum(sql`${foodOrderItems.quantity} * ${foodOrderItems.unitPrice}`))
      );

    return foodSalesData.map((row) => ({
      categoryName: row.categoryName || "Unknown",
      itemName: row.itemName || "Unknown",
      quantitySold: Number(row.quantitySold) || 0,
      revenue: Number(row.revenue) || 0,
      averageOrderValue: Number(row.revenue) / Number(row.ordersCount) || 0,
    }));
  }

  async getKPIs(filters: ReportFilters) {
    const { startDate, endDate } = filters;

    // Total Revenue
    const totalRevenueResult = await db
      .select({
        roomRevenue: sum(payments.amount),
      })
      .from(payments)
      .leftJoin(bookings, eq(payments.bookingId, bookings.id))
      .where(
        and(
          gte(payments.createdAt, new Date(startDate)),
          lte(payments.createdAt, new Date(endDate)),
          eq(payments.status, "completed")
        )
      );

    const foodRevenueResult = await db
      .select({
        foodRevenue: sum(foodOrders.totalAmount),
      })
      .from(foodOrders)
      .where(
        and(
          gte(foodOrders.createdAt, new Date(startDate)),
          lte(foodOrders.createdAt, new Date(endDate)),
          eq(foodOrders.status, "delivered")
        )
      );

    // Average Daily Rate and Revenue Per Available Room
    const totalRoomsResult = await db.select({ count: count() }).from(rooms);
    const totalRooms = totalRoomsResult[0].count;

    const occupancyResult = await db
      .select({
        totalNights: sum(
          sql`EXTRACT(epoch FROM (${bookings.checkOutDate} - ${bookings.checkInDate})) / 86400`
        ),
        totalRevenue: sum(
          sql`${bookingRooms.nightlyRate} * EXTRACT(epoch FROM (${bookings.checkOutDate} - ${bookings.checkInDate})) / 86400`
        ),
        totalBookings: count(bookings.id),
      })
      .from(bookings)
      .leftJoin(bookingRooms, eq(bookings.id, bookingRooms.bookingId))
      .where(
        and(
          gte(bookings.checkInDate, new Date(startDate)),
          lte(bookings.checkInDate, new Date(endDate)),
          eq(bookings.status, "checked_in")
        )
      );

    const roomRevenue = Number(totalRevenueResult[0]?.roomRevenue) || 0;
    const foodRevenue = Number(foodRevenueResult[0]?.foodRevenue) || 0;
    const totalRevenue = roomRevenue + foodRevenue;

    const totalNights = Number(occupancyResult[0]?.totalNights) || 1;
    const adr = Number(occupancyResult[0]?.totalRevenue) / totalNights || 0;
    const revpar =
      adr *
      (totalNights / (totalRooms * this.getDaysBetween(startDate, endDate)));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      roomRevenue: Math.round(roomRevenue * 100) / 100,
      foodRevenue: Math.round(foodRevenue * 100) / 100,
      adr: Math.round(adr * 100) / 100,
      revpar: Math.round(revpar * 100) / 100,
      totalBookings: Number(occupancyResult[0]?.totalBookings) || 0,
    };
  }

  private getDateFormat(groupBy: string): string {
    switch (groupBy) {
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "day";
    }
  }

  private getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const reportingService = new ReportingService();
