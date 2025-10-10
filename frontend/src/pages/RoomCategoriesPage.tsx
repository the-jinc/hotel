import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  useRoomCategories,
  useCreateRoomCategory,
  useUpdateRoomCategory,
  useDeleteRoomCategory,
  type CreateRoomCategoryData,
} from "@/hooks/useRooms";

interface CategoryFormData extends CreateRoomCategoryData {
  id?: string;
}

export default function RoomCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryFormData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: 1,
    amenities: "",
    images: "",
  });

  const { data: categories, isLoading } = useRoomCategories();
  const createMutation = useCreateRoomCategory();
  const updateMutation = useUpdateRoomCategory();
  const deleteMutation = useDeleteRoomCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id!,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || "",
      basePrice: category.basePrice,
      maxOccupancy: category.maxOccupancy,
      amenities: category.amenities || "",
      images: category.images || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this room category?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. It may have rooms assigned to it.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      maxOccupancy: 1,
      amenities: "",
      images: "",
    });
    setEditingCategory(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxOccupancy" ? parseInt(value, 10) || 1 : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading room categories...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Room Categories</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Deluxe King"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Category description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="99.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                  <Input
                    id="maxOccupancy"
                    name="maxOccupancy"
                    type="number"
                    min="1"
                    value={formData.maxOccupancy}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (JSON)</Label>
                <Textarea
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder='["WiFi", "TV", "AC", "Mini Bar"]'
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Images (JSON)</Label>
                <Textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder='["image1.jpg", "image2.jpg"]'
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1"
                >
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Max Occupancy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">${category.basePrice}</Badge>
                    </TableCell>
                    <TableCell>{category.maxOccupancy} guests</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No room categories found. Create your first category to get
              started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
