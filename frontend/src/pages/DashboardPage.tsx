import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import {
  Users,
  Bed,
  Calendar,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  useKPIs,
  useOccupancyReport,
  useRevenueReport,
  useFoodSalesReport,
  type ReportFilters,
} from "@/hooks/useReports";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Date range state for reports (default to last 30 days)
  const [dateRange, setDateRange] = useState<ReportFilters>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      groupBy: "day" as const,
    };
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Redirect guests to their bookings page
  if (user.role === "guest") {
    return <Navigate to="/my-bookings" replace />;
  }

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager" || user.role === "admin";

  // Fetch data for managers and admins
  const { data: kpis, isLoading: kpisLoading } = useKPIs(dateRange);
  const { data: occupancyData } = useOccupancyReport(dateRange);
  const { data: revenueData } = useRevenueReport(dateRange);
  const { data: foodSalesData, isLoading: foodSalesLoading } =
    useFoodSalesReport(dateRange);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!occupancyData || !revenueData) return [];

    const dataMap = new Map();

    occupancyData.forEach((item) => {
      dataMap.set(item.date, {
        date: item.date,
        occupancyRate: item.occupancyRate,
        adr: item.adr,
        revpar: item.revpar,
      });
    });

    revenueData.forEach((item) => {
      const existing = dataMap.get(item.date) || { date: item.date };
      dataMap.set(item.date, {
        ...existing,
        roomRevenue: item.roomRevenue,
        foodRevenue: item.foodRevenue,
        totalRevenue: item.totalRevenue,
      });
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [occupancyData, revenueData]);

  // Food sales pie chart data
  const foodSalesPieData = useMemo(() => {
    if (!foodSalesData) return [];
    return foodSalesData.slice(0, 5).map((item) => ({
      name: item.itemName,
      value: item.revenue,
      quantity: item.quantitySold,
    }));
  }, [foodSalesData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isManager ? "Management Dashboard" : "Staff Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector for Managers */}
        {isManager && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group By
                  </label>
                  <select
                    value={dateRange.groupBy}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        groupBy: e.target.value as "day" | "week" | "month",
                      }))
                    }
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards for Managers */}
        {isManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading
                        ? "..."
                        : `$${kpis?.totalRevenue?.toLocaleString() || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Bed className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Room Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading
                        ? "..."
                        : `$${kpis?.roomRevenue?.toLocaleString() || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <UtensilsCrossed className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Food Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading
                        ? "..."
                        : `$${kpis?.foodRevenue?.toLocaleString() || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">ADR</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading ? "..." : `$${kpis?.adr?.toFixed(2) || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">RevPAR</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading
                        ? "..."
                        : `$${kpis?.revpar?.toFixed(2) || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpisLoading ? "..." : `${kpis?.totalBookings || 0}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section for Managers */}
        {isManager && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="roomRevenue"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      name="Room Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="foodRevenue"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      name="Food Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Occupancy Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Occupancy & ADR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="occupancyRate"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Occupancy Rate (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adr"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="ADR ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Food Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Top Food Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={foodSalesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => `${name}: $${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {foodSalesPieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Food Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Food Sales Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden">
                  {foodSalesLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {foodSalesData?.slice(0, 10).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {item.itemName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.categoryName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${item.revenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantitySold} sold
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Booking Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/staff/bookings">Manage Bookings</a>
              </Button>
              {isAdmin && (
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin/rooms">Room Management</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Food Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Food Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/staff/food-orders">Manage Orders</a>
              </Button>
              {isAdmin && (
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin/food-items">Menu Management</a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Admin Functions */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <a href="/admin/users">User Management</a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin/audit-logs">Audit Logs</a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin/backups">Backup Management</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
