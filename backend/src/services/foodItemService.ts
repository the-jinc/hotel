import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  foodItems,
  foodCategories,
  type FoodItem,
  type NewFoodItem,
} from "../db/schema.js";

export class FoodItemService {
  static async getAll(): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .orderBy(desc(foodItems.sortOrder), foodItems.name);
  }

  static async getById(id: string): Promise<FoodItem | null> {
    const item = await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.id, id))
      .limit(1);

    return item[0] || null;
  }

  static async getByCategory(categoryId: string): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.categoryId, categoryId))
      .orderBy(desc(foodItems.sortOrder), foodItems.name);
  }

  static async getAvailableByCategory(categoryId: string): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .where(
        and(
          eq(foodItems.categoryId, categoryId),
          eq(foodItems.isAvailable, true)
        )
      )
      .orderBy(desc(foodItems.sortOrder), foodItems.name);
  }

  static async getAllAvailable(): Promise<FoodItem[]> {
    return await db
      .select()
      .from(foodItems)
      .where(eq(foodItems.isAvailable, true))
      .orderBy(desc(foodItems.sortOrder), foodItems.name);
  }

  static async create(data: NewFoodItem): Promise<FoodItem> {
    const result = await db
      .insert(foodItems)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  static async update(
    id: string,
    data: Partial<NewFoodItem>
  ): Promise<FoodItem | null> {
    const result = await db
      .update(foodItems)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(foodItems.id, id))
      .returning();

    return result[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(foodItems)
      .where(eq(foodItems.id, id))
      .returning();

    return result.length > 0;
  }

  static async getWithCategory() {
    return await db
      .select({
        id: foodItems.id,
        name: foodItems.name,
        description: foodItems.description,
        price: foodItems.price,
        image: foodItems.image,
        isAvailable: foodItems.isAvailable,
        preparationTime: foodItems.preparationTime,
        allergens: foodItems.allergens,
        ingredients: foodItems.ingredients,
        isVegetarian: foodItems.isVegetarian,
        isVegan: foodItems.isVegan,
        isGlutenFree: foodItems.isGlutenFree,
        sortOrder: foodItems.sortOrder,
        createdAt: foodItems.createdAt,
        updatedAt: foodItems.updatedAt,
        category: {
          id: foodCategories.id,
          name: foodCategories.name,
          description: foodCategories.description,
        },
      })
      .from(foodItems)
      .leftJoin(foodCategories, eq(foodItems.categoryId, foodCategories.id))
      .orderBy(desc(foodItems.sortOrder), foodItems.name);
  }
}
