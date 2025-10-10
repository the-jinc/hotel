import React, { useState } from "react";
import { useSearchRooms, usePublicRoomCategories } from "../hooks/useRooms";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  CalendarIcon,
  UsersIcon,
  BedIcon,
  WifiIcon,
  CarIcon,
  CoffeeIcon,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface SearchFilters {
  checkinDate: string;
  checkoutDate: string;
  guests: number;
  categoryId?: string;
}

const RoomSearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    checkinDate: "",
    checkoutDate: "",
    guests: 1,
  });

  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const { addToCart } = useCartStore();

  // Get room categories for filter
  const { data: categories } = usePublicRoomCategories();

  // Search for available rooms
  const searchQuery = searchSubmitted
    ? {
        checkInDate: filters.checkinDate,
        checkOutDate: filters.checkoutDate,
        guestCount: filters.guests,
        categoryId: filters.categoryId,
      }
    : null;

  const { data: searchResult, isLoading, error } = useSearchRooms(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!filters.checkinDate || !filters.checkoutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (new Date(filters.checkinDate) >= new Date(filters.checkoutDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setSearchSubmitted(true);
  };

  const handleAddToCart = (room: any) => {
    const totalNights = Math.ceil(
      (new Date(filters.checkoutDate).getTime() -
        new Date(filters.checkinDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const booking = {
      id: `temp-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      categoryName: room.category.name,
      checkinDate: filters.checkinDate,
      checkoutDate: filters.checkoutDate,
      guests: filters.guests,
      pricePerNight: room.category.basePrice,
      totalNights,
      totalPrice: totalNights * room.category.basePrice,
    };

    addToCart(booking);
    toast.success("Room added to cart");
  };

  const filteredRooms = searchResult?.rooms?.filter((room: any) => {
    if (filters.categoryId && room.categoryId !== filters.categoryId)
      return false;
    if (room.category.maxOccupancy < filters.guests) return false;
    return true;
  });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <WifiIcon className="h-4 w-4" />;
      case "parking":
        return <CarIcon className="h-4 w-4" />;
      case "breakfast":
        return <CoffeeIcon className="h-4 w-4" />;
      default:
        return <BedIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Find Your Perfect Room
        </h1>
        <p className="text-muted-foreground text-center">
          Search and book available rooms for your stay
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Search Available Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <div>
              <Label htmlFor="checkin">Check-in Date</Label>
              <Input
                id="checkin"
                type="date"
                value={filters.checkinDate}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    checkinDate: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="checkout">Check-out Date</Label>
              <Input
                id="checkout"
                type="date"
                value={filters.checkoutDate}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    checkoutDate: e.target.value,
                  }))
                }
                min={
                  filters.checkinDate || new Date().toISOString().split("T")[0]
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="8"
                value={filters.guests}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    guests: parseInt(e.target.value),
                  }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Room Type</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={filters.categoryId || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    categoryId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">All Types</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Search Rooms
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searchSubmitted && (
        <div>
          {isLoading && (
            <div className="text-center py-8">
              <p>Searching for available rooms...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">
                Error searching for rooms. Please try again.
              </p>
            </div>
          )}

          {filteredRooms && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Available Rooms ({filteredRooms.length} found)
                </h2>
                <p className="text-muted-foreground">
                  {filters.checkinDate} to {filters.checkoutDate} •{" "}
                  {filters.guests} guest{filters.guests > 1 ? "s" : ""}
                </p>
              </div>

              {filteredRooms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No rooms available for your selected dates and
                      requirements.
                    </p>
                    <p className="text-sm">
                      Try adjusting your dates or guest count to see more
                      options.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRooms.map((room: any) => {
                    const totalNights = Math.ceil(
                      (new Date(filters.checkoutDate).getTime() -
                        new Date(filters.checkinDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const totalPrice = totalNights * room.category.basePrice;

                    return (
                      <Card key={room.id} className="overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <BedIcon className="h-16 w-16 text-blue-600" />
                        </div>

                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {room.category.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Room {room.roomNumber}
                              </p>
                            </div>
                            <Badge
                              variant={
                                room.status === "available"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                room.status === "available" &&
                                  "bg-green-100 text-green-800"
                              )}
                            >
                              {room.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {room.category.description}
                          </p>

                          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <UsersIcon className="h-4 w-4" />
                              <span>Up to {room.category.maxOccupancy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BedIcon className="h-4 w-4" />
                              <span>{room.category.bedType}</span>
                            </div>
                          </div>

                          {room.category.amenities &&
                            room.category.amenities.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">
                                  Amenities
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {room.category.amenities.map(
                                    (amenity: string, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                                      >
                                        {getAmenityIcon(amenity)}
                                        <span>{amenity}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  ${room.category.basePrice}/night
                                </p>
                                <p className="font-semibold">
                                  Total: ${totalPrice} ({totalNights} night
                                  {totalNights > 1 ? "s" : ""})
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAddToCart(room)}
                              className="w-full"
                              disabled={room.status !== "available"}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomSearchPage;
