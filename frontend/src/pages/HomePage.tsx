import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicRoomCategories } from "@/hooks/useRooms";
import { Calendar, Users, Search } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: categories } = usePublicRoomCategories();

  const [searchData, setSearchData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guestCount: 1,
    categoryId: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !searchData.checkInDate ||
      !searchData.checkOutDate ||
      !searchData.guestCount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams({
      checkInDate: searchData.checkInDate,
      checkOutDate: searchData.checkOutDate,
      guestCount: searchData.guestCount.toString(),
      ...(searchData.categoryId &&
        searchData.categoryId !== "all" && {
          categoryId: searchData.categoryId,
        }),
    });

    navigate(`/search?${searchParams.toString()}`);
  };

  // Set minimum date to today
  const today = format(new Date(), "yyyy-MM-dd");

  // Set minimum checkout date to day after checkin
  const minCheckoutDate = searchData.checkInDate
    ? format(
        new Date(
          new Date(searchData.checkInDate).getTime() + 24 * 60 * 60 * 1000
        ),
        "yyyy-MM-dd"
      )
    : today;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Our Hotel
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience luxury and comfort in the heart of the city. Book your
            perfect stay with us.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Search className="h-6 w-6" />
              Find Your Perfect Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="checkInDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Check-in Date
                  </Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={searchData.checkInDate}
                    onChange={(e) =>
                      handleInputChange("checkInDate", e.target.value)
                    }
                    min={today}
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="checkOutDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Check-out Date
                  </Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={searchData.checkOutDate}
                    onChange={(e) =>
                      handleInputChange("checkOutDate", e.target.value)
                    }
                    min={minCheckoutDate}
                    required
                  />
                </div>

                {/* Guest Count */}
                <div className="space-y-2">
                  <Label
                    htmlFor="guestCount"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Guests
                  </Label>
                  <Select
                    value={searchData.guestCount.toString()}
                    onValueChange={(value) =>
                      handleInputChange("guestCount", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Room Type (Optional)</Label>
                  <Select
                    value={searchData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any room type</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} - ${category.basePrice}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <Button type="submit" size="lg" className="px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Search Available Rooms
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and quick reservation process with instant confirmation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-600">
                Round-the-clock assistance to make your stay comfortable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
              <p className="text-gray-600">
                Competitive pricing with no hidden fees or charges.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
