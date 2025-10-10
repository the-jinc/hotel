import { db } from "../db/index.js";
import {
  roomCategories,
  type NewRoomCategory,
  type RoomCategory,
} from "../db/schema.js";
import { eq } from "drizzle-orm";

export class RoomCategoryService {
  static async getAllCategories(): Promise<RoomCategory[]> {
    return await db.query.roomCategories.findMany({
      orderBy: (roomCategories, { asc }) => [asc(roomCategories.name)],
    });
  }

  static async getCategoryById(id: string): Promise<RoomCategory | null> {
    const category = await db.query.roomCategories.findFirst({
      where: eq(roomCategories.id, id),
    });
    return category || null;
  }

  static async createCategory(data: NewRoomCategory): Promise<RoomCategory> {
    const [newCategory] = await db
      .insert(roomCategories)
      .values(data)
      .returning();
    return newCategory;
  }

  static async updateCategory(
    id: string,
    updates: Partial<NewRoomCategory>
  ): Promise<RoomCategory | null> {
    const [updatedCategory] = await db
      .update(roomCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(roomCategories.id, id))
      .returning();

    return updatedCategory || null;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    // Check if category has rooms
    const categoryWithRooms = await db.query.roomCategories.findFirst({
      where: eq(roomCategories.id, id),
      with: {
        rooms: true,
      },
    });

    if (categoryWithRooms?.rooms && categoryWithRooms.rooms.length > 0) {
      throw new Error("Cannot delete category with existing rooms");
    }

    const result = await db
      .delete(roomCategories)
      .where(eq(roomCategories.id, id));
    return result.length > 0;
  }
}
