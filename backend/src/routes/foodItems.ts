import { Hono } from "hono";
import { FoodItemService } from "../services/foodItemService.js";
import { jwtAuth } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/rbac.js";

const app = new Hono();

// Public routes - get available items
app.get("/", async (c) => {
  try {
    const categoryId = c.req.query("category_id");

    let items;
    if (categoryId) {
      items = await FoodItemService.getAvailableByCategory(categoryId);
    } else {
      items = await FoodItemService.getAllAvailable();
    }

    return c.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching food items:", error);
    return c.json({ success: false, error: "Failed to fetch items" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await FoodItemService.getById(id);

    if (!item) {
      return c.json({ success: false, error: "Item not found" }, 404);
    }

    return c.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching food item:", error);
    return c.json({ success: false, error: "Failed to fetch item" }, 500);
  }
});

// Protected routes - require authentication
app.use("/*", jwtAuth);

// Admin/Manager only routes
app.get("/admin/all", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const items = await FoodItemService.getWithCategory();
    return c.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching all food items:", error);
    return c.json({ success: false, error: "Failed to fetch items" }, 500);
  }
});

app.post("/", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const body = await c.req.json();
    const {
      categoryId,
      name,
      description,
      price,
      image,
      isAvailable = true,
      preparationTime,
      allergens,
      ingredients,
      isVegetarian = false,
      isVegan = false,
      isGlutenFree = false,
      sortOrder = 0,
    } = body;

    if (!categoryId || !name || !price) {
      return c.json(
        { success: false, error: "categoryId, name, and price are required" },
        400
      );
    }

    const item = await FoodItemService.create({
      categoryId,
      name,
      description,
      price: price.toString(),
      image,
      isAvailable,
      preparationTime,
      allergens,
      ingredients,
      isVegetarian,
      isVegan,
      isGlutenFree,
      sortOrder,
    });

    return c.json({ success: true, data: item }, 201);
  } catch (error) {
    console.error("Error creating food item:", error);
    return c.json({ success: false, error: "Failed to create item" }, 500);
  }
});

app.put("/:id", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const {
      categoryId,
      name,
      description,
      price,
      image,
      isAvailable,
      preparationTime,
      allergens,
      ingredients,
      isVegetarian,
      isVegan,
      isGlutenFree,
      sortOrder,
    } = body;

    const updateData: any = {};
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price.toString();
    if (image !== undefined) updateData.image = image;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (preparationTime !== undefined)
      updateData.preparationTime = preparationTime;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (isVegetarian !== undefined) updateData.isVegetarian = isVegetarian;
    if (isVegan !== undefined) updateData.isVegan = isVegan;
    if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const item = await FoodItemService.update(id, updateData);

    if (!item) {
      return c.json({ success: false, error: "Item not found" }, 404);
    }

    return c.json({ success: true, data: item });
  } catch (error) {
    console.error("Error updating food item:", error);
    return c.json({ success: false, error: "Failed to update item" }, 500);
  }
});

app.delete("/:id", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await FoodItemService.delete(id);

    if (!deleted) {
      return c.json({ success: false, error: "Item not found" }, 404);
    }

    return c.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return c.json({ success: false, error: "Failed to delete item" }, 500);
  }
});

export default app;
