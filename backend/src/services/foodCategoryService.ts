import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  foodCategories,
  type FoodCategory,
  type NewFoodCategory,
} from "../db/schema.js";

export class FoodCategoryService {
  static async getAll(): Promise<FoodCategory[]> {
    return await db
      .select()
      .from(foodCategories)
      .orderBy(desc(foodCategories.sortOrder), foodCategories.name);
  }

  static async getById(id: string): Promise<FoodCategory | null> {
    const category = await db
      .select()
      .from(foodCategories)
      .where(eq(foodCategories.id, id))
      .limit(1);

    return category[0] || null;
  }

  static async create(data: NewFoodCategory): Promise<FoodCategory> {
    const result = await db
      .insert(foodCategories)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  static async update(
    id: string,
    data: Partial<NewFoodCategory>
  ): Promise<FoodCategory | null> {
    const result = await db
      .update(foodCategories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(foodCategories.id, id))
      .returning();

    return result[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(foodCategories)
      .where(eq(foodCategories.id, id))
      .returning();

    return result.length > 0;
  }

  static async getActive(): Promise<FoodCategory[]> {
    return await db
      .select()
      .from(foodCategories)
      .where(eq(foodCategories.isActive, true))
      .orderBy(desc(foodCategories.sortOrder), foodCategories.name);
  }
}
