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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  useRooms,
  useRoomCategories,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useUpdateRoomStatus,
  type CreateRoomData,
} from "@/hooks/useRooms";

interface RoomFormData extends CreateRoomData {
  id?: string;
  status?: "available" | "booked" | "cleaning" | "out_of_service";
}

const statusColors = {
  available: "bg-green-100 text-green-800",
  booked: "bg-red-100 text-red-800",
  cleaning: "bg-yellow-100 text-yellow-800",
  out_of_service: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  available: "Available",
  booked: "Booked",
  cleaning: "Cleaning",
  out_of_service: "Out of Service",
};

export default function RoomsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomFormData | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: "",
    categoryId: "",
    floor: 1,
    notes: "",
  });

  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: categories, isLoading: categoriesLoading } =
    useRoomCategories();
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();
  const updateStatusMutation = useUpdateRoomStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await updateMutation.mutateAsync({
          id: editingRoom.id!,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      id: room.id,
      roomNumber: room.roomNumber,
      categoryId: room.categoryId,
      floor: room.floor,
      notes: room.notes || "",
      status: room.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting room:", error);
        alert("Failed to delete room. It may have existing bookings.");
      }
    }
  };

  const handleStatusChange = async (
    roomId: string,
    newStatus: "available" | "booked" | "cleaning" | "out_of_service"
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ id: roomId, status: newStatus });
    } catch (error) {
      console.error("Error updating room status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      categoryId: "",
      floor: 1,
      notes: "",
    });
    setEditingRoom(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "floor" ? parseInt(value, 10) || 1 : value,
    }));
  };

  if (roomsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rooms Management</h1>
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
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Edit Room" : "Add New Room"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Room Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} - ${category.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {editingRoom && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="out_of_service">
                        Out of Service
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about the room..."
                  rows={3}
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
                  {editingRoom ? "Update" : "Create"} Room
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
          <CardTitle>Rooms ({rooms?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {rooms && rooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">
                      {room.roomNumber}
                    </TableCell>
                    <TableCell>{room.category.name}</TableCell>
                    <TableCell>Floor {room.floor}</TableCell>
                    <TableCell>
                      <Select
                        value={room.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(room.id, newStatus as any)
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={statusColors[room.status]}>
                              {statusLabels[room.status]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="out_of_service">
                            Out of Service
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ${room.category.basePrice}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(room.id)}
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
              No rooms found. Create your first room to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
