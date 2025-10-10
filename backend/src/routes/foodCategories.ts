import { Hono } from "hono";
import { FoodCategoryService } from "../services/foodCategoryService.js";
import { jwtAuth } from "../middleware/auth.js";
import { roleMiddleware } from "../middleware/rbac.js";

const app = new Hono();

// Public routes - get active categories
app.get("/", async (c) => {
  try {
    const categories = await FoodCategoryService.getActive();
    return c.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching food categories:", error);
    return c.json({ success: false, error: "Failed to fetch categories" }, 500);
  }
});

// Protected routes - require authentication
app.use("/*", jwtAuth);

// Admin/Manager only routes
app.get("/all", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const categories = await FoodCategoryService.getAll();
    return c.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching all food categories:", error);
    return c.json({ success: false, error: "Failed to fetch categories" }, 500);
  }
});

app.get("/:id", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const id = c.req.param("id");
    const category = await FoodCategoryService.getById(id);

    if (!category) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching food category:", error);
    return c.json({ success: false, error: "Failed to fetch category" }, 500);
  }
});

app.post("/", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, isActive = true, sortOrder = 0 } = body;

    if (!name) {
      return c.json({ success: false, error: "Name is required" }, 400);
    }

    const category = await FoodCategoryService.create({
      name,
      description,
      isActive,
      sortOrder,
    });

    return c.json({ success: true, data: category }, 201);
  } catch (error) {
    console.error("Error creating food category:", error);
    return c.json({ success: false, error: "Failed to create category" }, 500);
  }
});

app.put("/:id", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, description, isActive, sortOrder } = body;

    const category = await FoodCategoryService.update(id, {
      name,
      description,
      isActive,
      sortOrder,
    });

    if (!category) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    return c.json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating food category:", error);
    return c.json({ success: false, error: "Failed to update category" }, 500);
  }
});

app.delete("/:id", roleMiddleware(["admin", "manager"]), async (c) => {
  try {
    const id = c.req.param("id");
    const deleted = await FoodCategoryService.delete(id);

    if (!deleted) {
      return c.json({ success: false, error: "Category not found" }, 404);
    }

    return c.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting food category:", error);
    return c.json({ success: false, error: "Failed to delete category" }, 500);
  }
});

export default app;
