import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Calendar,
  Building,
  Users,
  BedDouble,
  LogOut,
  Hotel,
  UtensilsCrossed,
  ChefHat,
  ClipboardList,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "receptionist"],
    },
    {
      label: "Bookings",
      href: "/staff/bookings",
      icon: Calendar,
      roles: ["admin", "manager", "receptionist"],
    },
    {
      label: "Food Orders",
      href: "/staff/food-orders",
      icon: ClipboardList,
      roles: ["admin", "manager", "receptionist"],
    },
    {
      label: "Room Management",
      href: "/admin/rooms",
      icon: BedDouble,
      roles: ["admin", "manager"],
    },
    {
      label: "Room Categories",
      href: "/admin/room-categories",
      icon: Building,
      roles: ["admin"],
    },
    {
      label: "Food Categories",
      href: "/admin/food-categories",
      icon: UtensilsCrossed,
      roles: ["admin", "manager"],
    },
    {
      label: "Food Items",
      href: "/admin/food-items",
      icon: ChefHat,
      roles: ["admin", "manager"],
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-logs",
      icon: Shield,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <Hotel className="h-8 w-8 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900">Hotel</span>
          <span className="text-xs text-gray-500">Staff Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col gap-3">
          {/* User Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {user.role}
              </Badge>
            </div>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start h-8 px-2 text-gray-600"
              asChild
            >
              <Link to="/">
                <Hotel className="h-4 w-4 mr-2" />
                View Public Site
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="justify-start h-8 px-2 text-gray-600 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
