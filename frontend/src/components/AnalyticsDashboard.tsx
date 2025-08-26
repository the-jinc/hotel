import React, { useState, useEffect } from "react";
import useBookingStore from "../store/bookingStore";
import useRoomStore from "../store/roomStore";
import useUserStore from "../store/userStore";
import useReviewStore from "../store/reviewStore"; // Assuming this store exists
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOffice2Icon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

// A function to format numbers as currency
const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

// Helper to calculate total revenue from bookings
const calculateTotalRevenue = (bookings) => 
  bookings.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0);

// Helper to calculate average review score
const calculateAvgRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(2);
};

// Helper to count bookings this week
const countBookingsThisWeek = (bookings) => {
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfWeek(now);
  return bookings.filter(booking => isWithinInterval(new Date(booking.checkInDate), { start, end })).length;
};

// Helper to generate chart data
const processChartData = (bookings) => {
  const revenueByDay = {};
  const bookingsByStatus = { 'Confirmed': 0, 'Pending': 0, 'Cancelled': 0 };
  const revenueByRoomType = {};

  bookings.forEach(booking => {
    const dateObject = new Date(booking.checkInDate);
    if (dateObject.getTime()) {
      const date = format(dateObject, 'yyyy-MM-dd');
      if (!revenueByDay[date]) {
        revenueByDay[date] = 0;
      }
      revenueByDay[date] += parseFloat(booking.totalPrice);
    }
    bookingsByStatus[booking.status]++;
    if (booking.roomType) {
      const roomTypeName = booking.roomType.type;
      if (!revenueByRoomType[roomTypeName]) {
        revenueByRoomType[roomTypeName] = 0;
      }
      revenueByRoomType[roomTypeName] += parseFloat(booking.totalPrice);
    }
  });

  const dailyRevenueChartData = Object.keys(revenueByDay).map(date => ({
    date,
    revenue: revenueByDay[date],
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const statusPieChartData = Object.keys(bookingsByStatus).map(status => ({
    name: status,
    value: bookingsByStatus[status],
  })).filter(item => item.value > 0);

  const roomTypeBarChartData = Object.keys(revenueByRoomType).map(roomType => ({
    name: roomType,
    revenue: revenueByRoomType[roomType],
  }));

  return { dailyRevenueChartData, statusPieChartData, roomTypeBarChartData };
};

export default function AnalyticsDashboard() {
  const { bookings, total: totalBookings, loading: bookingsLoading, error: bookingsError, fetchBookings } = useBookingStore();
  const { rooms, total: totalRooms, loading: roomsLoading, error: roomsError, fetchRooms } = useRoomStore();
  const { users, total: totalUsers, loading: usersLoading, error: usersError, fetchUsers } = useUserStore();
  const { reviews, loading: reviewsLoading, error: reviewsError, fetchReviews } = useReviewStore(); // Assuming useReviewStore exists

  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookingsThisWeek: 0,
    avgBookingValue: 0,
    avgReviewRating: 0,
    dailyRevenueChartData: [],
    statusPieChartData: [],
    roomTypeBarChartData: [],
  });

  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchUsers();
    fetchReviews();
  }, [fetchBookings, fetchRooms, fetchUsers, fetchReviews]);

  // Recalculate analytics whenever the relevant data changes
  useEffect(() => {
    if (bookings.length > 0 || reviews.length > 0) {
      const totalRevenue = calculateTotalRevenue(bookings);
      const totalBookingsThisWeek = countBookingsThisWeek(bookings);
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
      const avgReviewRating = calculateAvgRating(reviews);
      const { dailyRevenueChartData, statusPieChartData, roomTypeBarChartData } = processChartData(bookings);

      setAnalytics({
        totalRevenue,
        totalBookingsThisWeek,
        avgBookingValue,
        avgReviewRating,
        dailyRevenueChartData,
        statusPieChartData,
        roomTypeBarChartData,
      });
    }
  }, [bookings, totalBookings, reviews]);

  const loading = bookingsLoading || roomsLoading || usersLoading || reviewsLoading;
  const error = bookingsError || roomsError || usersError || reviewsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <CurrencyDollarIcon className="h-10 w-10 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <BookOpenIcon className="h-10 w-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <BuildingOffice2Icon className="h-10 w-10 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <UsersIcon className="h-10 w-10 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <StarIcon className="h-10 w-10 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Avg. Review Score</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.avgReviewRating}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <BookOpenIcon className="h-10 w-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Bookings This Week</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalBookingsThisWeek}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyRevenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusPieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {analytics.statusPieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} bookings`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg col-span-full">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Room Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.roomTypeBarChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis formatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
