import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchRooms, type AvailabilityQuery } from "@/hooks/useRooms";
import { useCartStore } from "@/store/cartStore";
import { Calendar, Users, MapPin, ShoppingCart } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSearchCriteria, addSelectedRoom, selectedRooms } = useCartStore();

  const [query, setQuery] = useState<AvailabilityQuery | null>(null);

  // Parse search parameters
  useEffect(() => {
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const guestCount = searchParams.get("guestCount");
    const categoryId = searchParams.get("categoryId");

    if (checkInDate && checkOutDate && guestCount) {
      const searchQuery = {
        checkInDate,
        checkOutDate,
        guestCount: parseInt(guestCount),
        categoryId: categoryId || undefined,
      };
      setQuery(searchQuery);

      // Update cart store with search criteria
      setSearchCriteria(checkInDate, checkOutDate, parseInt(guestCount));
    }
  }, [searchParams, setSearchCriteria]);

  const { data: searchResults, isLoading, error } = useSearchRooms(query);

  const handleSelectRoom = (room: any) => {
    if (!query) return;

    // Check if room is already selected
    const isSelected = selectedRooms.some(
      (selected) => selected.id === room.id
    );
    if (isSelected) return;

    addSelectedRoom({
      id: room.id,
      roomNumber: room.roomNumber,
      categoryName: room.category.name,
      categoryDescription: room.category.description || "",
      basePrice: parseFloat(room.category.basePrice),
    });
  };

  const handleViewDetails = (room: any) => {
    navigate(`/rooms/${room.category.id}`);
  };

  const handleProceedToCheckout = () => {
    if (selectedRooms.length === 0) return;
    navigate("/checkout");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const parseAmenities = (amenities: string | null): string[] => {
    if (!amenities) return [];
    try {
      return JSON.parse(amenities);
    } catch {
      return amenities.split(",").map((a) => a.trim());
    }
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Search
          </h1>
          <p className="text-gray-600 mb-4">
            Please provide valid search criteria.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for available rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Search Error</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error
              ? error.message
              : "An error occurred while searching"}
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Results
        </h1>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(query.checkInDate)} -{" "}
                  {formatDate(query.checkOutDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {query.guestCount}{" "}
                  {query.guestCount === 1 ? "Guest" : "Guests"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {searchResults?.totalResults || 0} rooms found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {!searchResults?.rooms?.length ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            No Rooms Available
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, no rooms are available for your selected dates and guest
            count.
          </p>
          <Button onClick={() => navigate("/")}>Try Different Dates</Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {searchResults.rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="md:flex">
                {/* Room Image Placeholder */}
                <div className="md:w-1/3 bg-gray-200 h-48 md:h-auto flex items-center justify-center">
                  <span className="text-gray-500">Room Image</span>
                </div>

                {/* Room Details */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {room.category.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            Room {room.roomNumber} • Floor {room.floor}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Up to {room.category.maxOccupancy} guests</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="mb-3">
                        {room.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${room.totalPrice}
                      </div>
                      <div className="text-sm text-gray-600">
                        for {room.nights}{" "}
                        {room.nights === 1 ? "night" : "nights"}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${room.category.basePrice}/night
                      </div>
                    </div>
                  </div>

                  {room.category.description && (
                    <p className="text-gray-600 mb-4">
                      {room.category.description}
                    </p>
                  )}

                  {/* Amenities */}
                  {room.category.amenities && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {parseAmenities(room.category.amenities).map(
                          (amenity, index) => (
                            <Badge key={index} variant="outline">
                              {amenity}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(room)}
                    >
                      View Details
                    </Button>

                    <Button
                      onClick={() => handleSelectRoom(room)}
                      className="flex items-center gap-2"
                      disabled={selectedRooms.some(
                        (selected) => selected.id === room.id
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {selectedRooms.some((selected) => selected.id === room.id)
                        ? "Selected"
                        : "Select Room"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Rooms Summary & Checkout */}
      {selectedRooms.length > 0 && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {selectedRooms.length} Room{selectedRooms.length > 1 ? "s" : ""}{" "}
                Selected
              </h3>
              <p className="text-green-600">
                Ready to proceed with your booking
              </p>
            </div>
            <Button
              onClick={handleProceedToCheckout}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Back to Search */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate("/")}>
          Modify Search
        </Button>
      </div>
    </div>
  );
}
