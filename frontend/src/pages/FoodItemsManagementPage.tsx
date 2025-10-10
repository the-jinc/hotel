import { useState } from "react";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useFoodItemsAdmin,
  useCreateFoodItem,
  useUpdateFoodItem,
  useDeleteFoodItem,
  type FoodItemWithCategory,
} from "@/hooks/useFoodItems";
import { useFoodCategoriesAdmin } from "@/hooks/useFoodCategories";

interface FoodItemFormData {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  allergens: string;
  ingredients: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  sortOrder: number;
}

const FoodItemsManagementPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItemWithCategory | null>(
    null
  );
  const [formData, setFormData] = useState<FoodItemFormData>({
    categoryId: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    isAvailable: true,
    preparationTime: 0,
    allergens: "",
    ingredients: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    sortOrder: 0,
  });

  const { data: items = [], isLoading } = useFoodItemsAdmin();
  const { data: categories = [] } = useFoodCategoriesAdmin();
  const createMutation = useCreateFoodItem();
  const updateMutation = useUpdateFoodItem();
  const deleteMutation = useDeleteFoodItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving food item:", error);
    }
  };

  const handleEdit = (item: FoodItemWithCategory) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || "",
      price: parseFloat(item.price),
      image: item.image || "",
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime || 0,
      allergens: item.allergens || "",
      ingredients: item.ingredients || "",
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      sortOrder: item.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      isAvailable: true,
      preparationTime: 0,
      allergens: "",
      ingredients: "",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      sortOrder: 0,
    });
    setEditingItem(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return <div>Loading food items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Food Items Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preparationTime">
                    Preparation Time (minutes)
                  </Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="0"
                    value={formData.preparationTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preparationTime: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) =>
                    setFormData({ ...formData, ingredients: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="allergens">Allergens</Label>
                <Input
                  id="allergens"
                  value={formData.allergens}
                  onChange={(e) =>
                    setFormData({ ...formData, allergens: e.target.value })
                  }
                  placeholder="e.g., Nuts, Dairy, Gluten"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isAvailable">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isVegetarian: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isVegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVegan"
                    checked={formData.isVegan}
                    onChange={(e) =>
                      setFormData({ ...formData, isVegan: e.target.checked })
                    }
                  />
                  <Label htmlFor="isVegan">Vegan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGlutenFree"
                    checked={formData.isGlutenFree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isGlutenFree: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isGlutenFree">Gluten Free</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name}</TableCell>
                  <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.isAvailable ? "default" : "secondary"}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.isVegetarian && (
                        <Badge variant="outline" className="text-xs">
                          V
                        </Badge>
                      )}
                      {item.isVegan && (
                        <Badge variant="outline" className="text-xs">
                          VE
                        </Badge>
                      )}
                      {item.isGlutenFree && (
                        <Badge variant="outline" className="text-xs">
                          GF
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Food Item
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{item.name}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodItemsManagementPage;
