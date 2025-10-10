import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoomCategories } from "@/hooks/useRooms";
import { useCartStore } from "@/store/cartStore";
import { format, differenceInDays } from "date-fns";
import {
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Users,
  Bed,
  Bath,
  MapPin,
  Calendar,
  Star,
  ArrowLeft,
} from "lucide-react";

export default function RoomDetailsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { data: categories, isLoading } = useRoomCategories();
  const {
    checkInDate,
    checkOutDate,
    guestCount,
    selectedRooms,
    addSelectedRoom,
    removeSelectedRoom,
  } = useCartStore();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const category = categories?.find((cat) => cat.id === categoryId);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The room category you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/search")}>Back to Search</Button>
      </div>
    );
  }

  // Check if we have search criteria
  const hasSearchCriteria = checkInDate && checkOutDate && guestCount;
  const nights = hasSearchCriteria
    ? differenceInDays(new Date(checkOutDate!), new Date(checkInDate!))
    : 1;

  // Check if any rooms from this category are already selected
  const selectedRoomsFromCategory = selectedRooms.filter(
    (room) => room.categoryName === category.name
  );
  // Note: Individual room selection is handled on the search page
  const availableRooms: any[] = [];

  const handleAddRoom = (room: any) => {
    if (!hasSearchCriteria) {
      navigate("/search");
      return;
    }

    addSelectedRoom({
      id: room.id,
      roomNumber: room.roomNumber,
      categoryName: category.name,
      categoryDescription: category.description || "",
      basePrice: parseFloat(category.basePrice),
    });
  };

  const handleRemoveRoom = (roomId: string) => {
    removeSelectedRoom(roomId);
  };

  const handleProceedToCheckout = () => {
    if (selectedRooms.length === 0) return;
    navigate("/checkout");
  };

  // Mock amenities based on category
  const getAmenitiesForCategory = (categoryName: string) => {
    const baseAmenities = [
      { icon: Wifi, name: "Free WiFi" },
      { icon: Tv, name: "Smart TV" },
      { icon: Wind, name: "Air Conditioning" },
    ];

    if (
      categoryName.toLowerCase().includes("suite") ||
      categoryName.toLowerCase().includes("luxury")
    ) {
      return [
        ...baseAmenities,
        { icon: Coffee, name: "Coffee Machine" },
        { icon: Car, name: "Valet Parking" },
        { icon: Bath, name: "Jacuzzi" },
      ];
    }

    if (categoryName.toLowerCase().includes("deluxe")) {
      return [
        ...baseAmenities,
        { icon: Coffee, name: "Mini Bar" },
        { icon: Bath, name: "Rain Shower" },
      ];
    }

    return baseAmenities;
  };

  const amenities = getAmenitiesForCategory(category.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{category.name}</h1>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {category.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Up to {category.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>King bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>City view</span>
                </div>
              </div>
            </div>

            {/* Room Image Placeholder */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Room Image Placeholder</p>
            </div>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <amenity.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Rooms */}
            {hasSearchCriteria && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Rooms</CardTitle>
                  <CardDescription>
                    For {format(new Date(checkInDate!), "MMM dd")} -{" "}
                    {format(new Date(checkOutDate!), "MMM dd")}({nights} night
                    {nights > 1 ? "s" : ""})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableRooms.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No rooms available for the selected dates
                    </p>
                  ) : (
                    availableRooms.map((room: any) => (
                      <div
                        key={room.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">
                            Room {room.roomNumber}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ${category.basePrice}/night • Total: $
                            {parseFloat(category.basePrice) * nights}
                          </p>
                          <Badge
                            variant={
                              room.status === "available"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {room.status}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleAddRoom(room)}
                          disabled={room.status !== "available"}
                        >
                          Select Room
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected Rooms */}
            {selectedRoomsFromCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRoomsFromCategory.map((room) => (
                    <div
                      key={room.id}
                      className="flex justify-between items-center p-4 border rounded-lg bg-green-50"
                    >
                      <div>
                        <h4 className="font-medium">Room {room.roomNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${room.basePrice}/night • Total: $
                          {room.basePrice * nights}
                        </p>
                        <Badge className="mt-1 bg-green-100 text-green-800">
                          Selected
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveRoom(room.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSearchCriteria ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Check-in</span>
                        <span>
                          {format(new Date(checkInDate!), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Check-out</span>
                        <span>
                          {format(new Date(checkOutDate!), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Guests</span>
                        <span>{guestCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nights</span>
                        <span>{nights}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Price per night</span>
                        <span className="font-medium">
                          ${category.basePrice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total ({nights} nights)</span>
                        <span className="font-medium">
                          ${parseFloat(category.basePrice) * nights}
                        </span>
                      </div>
                    </div>

                    {selectedRooms.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between font-medium">
                            <span>Selected Rooms ({selectedRooms.length})</span>
                            <span>
                              $
                              {selectedRooms.reduce(
                                (total, room) =>
                                  total + room.basePrice * nights,
                                0
                              )}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={handleProceedToCheckout}
                          className="w-full"
                          size="lg"
                        >
                          Proceed to Checkout
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Select your dates and number of guests to see available
                      rooms and pricing.
                    </p>
                    <Button
                      onClick={() => navigate("/search")}
                      className="w-full"
                    >
                      Search Availability
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
