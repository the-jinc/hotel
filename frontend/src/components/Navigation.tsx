import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  User,
  Calendar,
  Settings,
  LogOut,
  ShoppingCart,
  Building,
  Menu,
} from "lucide-react";

export default function Navigation() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { selectedRooms, getFoodItemCount } = useCartStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isStaff =
    user && ["admin", "manager", "receptionist"].includes(user.role);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Hotel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>

            <Link
              to="/menu"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Menu
            </Link>

            {isAuthenticated && !isStaff && (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  to="/my-food-orders"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  My Orders
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Indicators */}
            {selectedRooms.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/checkout")}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Room Cart
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {selectedRooms.length}
                </Badge>
              </Button>
            )}

            {getFoodItemCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/menu")}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Food Cart
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {getFoodItemCount()}
                </Badge>
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  {!isStaff && (
                    <DropdownMenuItem
                      onClick={() => navigate("/my-food-orders")}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      My Food Orders
                    </DropdownMenuItem>
                  )}
                  {isStaff && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Staff Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/search")}>
                    Search Rooms
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                      My Bookings
                    </DropdownMenuItem>
                  )}
                  {isStaff && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      Staff Dashboard
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
