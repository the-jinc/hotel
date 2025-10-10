import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  useAllBookings,
  useUpdateBookingStatus,
  type BookingWithDetails,
} from "@/hooks/useBookings";
import {
  Search,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DoorOpen,
  LogOut,
  Filter,
  Phone,
  Mail,
} from "lucide-react";

export default function StaffBookingManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);

  const { data: bookings, isLoading, error } = useAllBookings();
  const updateStatusMutation = useUpdateBookingStatus();

  // Filter bookings based on search and status
  const filteredBookings =
    bookings?.filter((booking) => {
      const matchesSearch =
        !searchTerm ||
        booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.user.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  // Group bookings by status for dashboard
  const bookingStats =
    bookings?.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId, status: newStatus });
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending_payment":
        return <Clock className="h-4 w-4" />;
      case "checked_in":
        return <DoorOpen className="h-4 w-4" />;
      case "checked_out":
        return <LogOut className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Bookings
          </h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <div className="text-sm text-muted-foreground">
            Total Bookings: {bookings?.length || 0}
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="checkin">Check-in/out</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(bookingStats).map(([status, count]) => (
                <Card key={status}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {status.replace("_", " ")}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-full ${getStatusColor(status)}`}
                      >
                        {getStatusIcon(status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest booking activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.slice(0, 5).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(booking.checkInDate),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(booking.checkOutDate),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell>{booking.rooms.length}</TableCell>
                        <TableCell>${booking.totalAmount}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by guest name, email, or booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending_payment">
                          Pending Payment
                        </SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked_in">Checked In</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          #{booking.id.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {format(new Date(booking.checkInDate), "MMM dd")}{" "}
                              -{" "}
                              {format(
                                new Date(booking.checkOutDate),
                                "MMM dd, yyyy"
                              )}
                            </p>
                            <p className="text-muted-foreground">
                              {booking.guestCount} guests
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {booking.rooms.map((room, index) => (
                              <p key={room.id}>
                                Room {room.roomNumber}
                                {index < booking.rooms.length - 1 && ", "}
                              </p>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${booking.totalAmount}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Booking Details</DialogTitle>
                                  <DialogDescription>
                                    Booking #
                                    {booking.id.slice(-8).toUpperCase()}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedBooking && (
                                  <BookingDetailsModal
                                    booking={selectedBooking}
                                    onStatusUpdate={handleStatusUpdate}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in/Check-out */}
          <TabsContent value="checkin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Check-ins */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Check-ins</CardTitle>
                  <CardDescription>Guests checking in today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings
                      .filter(
                        (booking) =>
                          format(
                            new Date(booking.checkInDate),
                            "yyyy-MM-dd"
                          ) === format(new Date(), "yyyy-MM-dd") &&
                          booking.status === "confirmed"
                      )
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex justify-between items-center p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rooms:{" "}
                              {booking.rooms
                                .map((r) => r.roomNumber)
                                .join(", ")}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={updateStatusMutation.isPending}
                              >
                                <DoorOpen className="h-4 w-4 mr-2" />
                                Check In
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Check-in
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to check in{" "}
                                  {booking.user.firstName}{" "}
                                  {booking.user.lastName}? This will mark the
                                  booking as checked in and the guest will be
                                  able to access their room.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleStatusUpdate(booking.id, "checked_in")
                                  }
                                >
                                  Check In
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    {filteredBookings.filter(
                      (booking) =>
                        format(new Date(booking.checkInDate), "yyyy-MM-dd") ===
                          format(new Date(), "yyyy-MM-dd") &&
                        booking.status === "confirmed"
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No check-ins scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Check-outs */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Check-outs</CardTitle>
                  <CardDescription>Guests checking out today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings
                      .filter(
                        (booking) =>
                          format(
                            new Date(booking.checkOutDate),
                            "yyyy-MM-dd"
                          ) === format(new Date(), "yyyy-MM-dd") &&
                          booking.status === "checked_in"
                      )
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex justify-between items-center p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {booking.user.firstName} {booking.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rooms:{" "}
                              {booking.rooms
                                .map((r) => r.roomNumber)
                                .join(", ")}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={updateStatusMutation.isPending}
                              >
                                <LogOut className="h-4 w-4 mr-2" />
                                Check Out
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Check-out
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to check out{" "}
                                  {booking.user.firstName}{" "}
                                  {booking.user.lastName}? This will mark the
                                  booking as completed and the room will become
                                  available for new bookings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleStatusUpdate(
                                      booking.id,
                                      "checked_out"
                                    )
                                  }
                                >
                                  Check Out
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    {filteredBookings.filter(
                      (booking) =>
                        format(new Date(booking.checkOutDate), "yyyy-MM-dd") ===
                          format(new Date(), "yyyy-MM-dd") &&
                        booking.status === "checked_in"
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <LogOut className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No check-outs scheduled for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Check-ins</CardTitle>
                <CardDescription>
                  Confirmed bookings for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings
                    .filter((booking) => {
                      const checkInDate = new Date(booking.checkInDate);
                      const today = new Date();
                      const sevenDaysFromNow = new Date(today);
                      sevenDaysFromNow.setDate(today.getDate() + 7);

                      return (
                        checkInDate >= today &&
                        checkInDate <= sevenDaysFromNow &&
                        booking.status === "confirmed" &&
                        format(checkInDate, "yyyy-MM-dd") !==
                          format(today, "yyyy-MM-dd")
                      ); // Exclude today's check-ins
                    })
                    .sort(
                      (a, b) =>
                        new Date(a.checkInDate).getTime() -
                        new Date(b.checkInDate).getTime()
                    )
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Check-in:{" "}
                            {format(
                              new Date(booking.checkInDate),
                              "MMM dd, yyyy"
                            )}{" "}
                            • Rooms:{" "}
                            {booking.rooms.map((r) => r.roomNumber).join(", ")}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {format(new Date(booking.checkInDate), "MMM dd")}
                        </Badge>
                      </div>
                    ))}
                  {filteredBookings.filter((booking) => {
                    const checkInDate = new Date(booking.checkInDate);
                    const today = new Date();
                    const sevenDaysFromNow = new Date(today);
                    sevenDaysFromNow.setDate(today.getDate() + 7);

                    return (
                      checkInDate >= today &&
                      checkInDate <= sevenDaysFromNow &&
                      booking.status === "confirmed" &&
                      format(checkInDate, "yyyy-MM-dd") !==
                        format(today, "yyyy-MM-dd")
                    );
                  }).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming check-ins in the next 7 days</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({
  booking,
  onStatusUpdate,
}: {
  booking: BookingWithDetails;
  onStatusUpdate: (bookingId: string, status: string) => void;
}) {
  const availableTransitions = getAvailableStatusTransitions(booking.status);

  function getAvailableStatusTransitions(currentStatus: string) {
    switch (currentStatus) {
      case "pending_payment":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["checked_in", "cancelled"];
      case "checked_in":
        return ["checked_out"];
      default:
        return [];
    }
  }

  return (
    <div className="space-y-6">
      {/* Guest Information */}
      <div>
        <h3 className="font-semibold mb-3">Guest Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="font-medium">
              {booking.user.firstName} {booking.user.lastName}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {booking.user.email}
            </p>
          </div>
          {booking.user.phone && (
            <div>
              <Label className="text-sm text-muted-foreground">Phone</Label>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {booking.user.phone}
              </p>
            </div>
          )}
          <div>
            <Label className="text-sm text-muted-foreground">Guests</Label>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {booking.guestCount}
            </p>
          </div>
        </div>
      </div>

      {/* Stay Information */}
      <div>
        <h3 className="font-semibold mb-3">Stay Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Check-in</Label>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.checkInDate), "PPP")}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Check-out</Label>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.checkOutDate), "PPP")}
            </p>
          </div>
        </div>
      </div>

      {/* Room Information */}
      <div>
        <h3 className="font-semibold mb-3">Room Information</h3>
        <div className="space-y-2">
          {booking.rooms.map((room) => (
            <div
              key={room.id}
              className="flex justify-between items-center p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">Room {room.roomNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {room.category.name}
                </p>
              </div>
              <p className="text-sm font-medium">${room.nightlyRate}/night</p>
            </div>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div>
          <h3 className="font-semibold mb-3">Special Requests</h3>
          <p className="text-sm text-muted-foreground">
            {booking.specialRequests}
          </p>
        </div>
      )}

      {/* Payment Information */}
      <div>
        <h3 className="font-semibold mb-3">Payment Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Amount</span>
            <span className="font-medium">${booking.totalAmount}</span>
          </div>
          {booking.payments.map((payment) => (
            <div key={payment.id} className="flex justify-between text-sm">
              <span>{payment.paymentMethod.replace("_", " ")}</span>
              <span>{payment.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {availableTransitions.map((status) => (
          <AlertDialog key={status}>
            <AlertDialogTrigger asChild>
              <Button
                variant={status === "cancelled" ? "destructive" : "default"}
              >
                {status === "checked_in" && (
                  <DoorOpen className="h-4 w-4 mr-2" />
                )}
                {status === "checked_out" && (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {status === "cancelled" && <XCircle className="h-4 w-4 mr-2" />}
                {status === "confirmed" && (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {status
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirm{" "}
                  {status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {status === "checked_in" &&
                    `Are you sure you want to check in ${booking.user.firstName} ${booking.user.lastName}? This will mark the booking as checked in.`}
                  {status === "checked_out" &&
                    `Are you sure you want to check out ${booking.user.firstName} ${booking.user.lastName}? This will mark the booking as completed.`}
                  {status === "cancelled" &&
                    `Are you sure you want to cancel this booking for ${booking.user.firstName} ${booking.user.lastName}? This action cannot be undone.`}
                  {status === "confirmed" &&
                    `Are you sure you want to confirm this booking for ${booking.user.firstName} ${booking.user.lastName}?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onStatusUpdate(booking.id, status)}
                  className={
                    status === "cancelled"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : ""
                  }
                >
                  {status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}
