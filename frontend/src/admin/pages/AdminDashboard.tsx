import { useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  HomeIcon,
  CalendarIcon,
  StarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import useBookingStore from '../../store/bookingStore';
import useRoomStore from '../../store/roomStore';
import useReviewStore from '../../store/reviewStore';
import useUserStore from '../../store/userStore';
import StatCard from '../../components/StatCard';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import RecentBookingsTable from '../../components/RecentBookingsTable';
import RecentReviewsTable from '../../components/RecentReviewsTable';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const {
    bookings,
    total: totalBookings,
    fetchBookings,
    loading: bookingsLoading
  } = useBookingStore();

  const {
    rooms,
    total: totalRooms,
    fetchRooms,
    loading: roomsLoading
  } = useRoomStore();

  const {
    reviews,
    fetchReviews,
    loading: reviewsLoading
  } = useReviewStore();

  const {
    users,
    total: totalUsers,
    fetchUsers,
    loading: usersLoading
  } = useUserStore();

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchReviews();
    fetchUsers();
  }, [fetchBookings, fetchRooms, fetchReviews, fetchUsers]);

  if (bookingsLoading || roomsLoading || reviewsLoading || usersLoading) {
    return <LoadingSpinner fullPage />;
  }

  // Calculate metrics
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Chart data
  const bookingTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Bookings',
        data: [65, 59, 80, 81, 56, 55, 40], // Replace with real data
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
      }
    ]
  };

  const roomOccupancyData = {
    labels: rooms.slice(0, 5).map(room => room.type),
    datasets: [
      {
        data: rooms.slice(0, 5).map(room => room.quantity),
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(129, 140, 248, 0.7)',
          'rgba(165, 180, 252, 0.7)',
          'rgba(199, 210, 254, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={CurrencyDollarIcon}
          trend="up"
          change="12%"
          color="indigo"
        />
        <StatCard 
          title="Total Bookings" 
          value={totalBookings} 
          icon={CalendarIcon}
          trend="up"
          change="8%"
          color="blue"
        />
        <StatCard 
          title="Total Rooms" 
          value={totalRooms} 
          icon={HomeIcon}
          trend="stable"
          color="green"
        />
        <StatCard 
          title="Average Rating" 
          value={averageRating} 
          icon={StarIcon}
          trend="up"
          change="5%"
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Booking Trends</h2>
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Last 7 months</span>
            </div>
          </div>
          <div className="h-80">
            <LineChart data={bookingTrendsData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Room Distribution</h2>
            <div className="flex items-center">
              <HomeIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">By Type</span>
            </div>
          </div>
          <div className="h-80">
            <PieChart data={roomOccupancyData} />
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Last 5 bookings</span>
            </div>
          </div>
          <RecentBookingsTable bookings={bookings.slice(0, 5)} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Reviews</h2>
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Last 5 reviews</span>
            </div>
          </div>
          <RecentReviewsTable reviews={reviews.slice(0, 5)} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg">
          <div className="flex items-center">
            <UsersIcon className="h-10 w-10 text-indigo-600 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-indigo-800">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <HomeIcon className="h-10 w-10 text-green-600 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-green-800">Available Rooms</h3>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.reduce((sum, room) => sum + room.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <StarIcon className="h-10 w-10 text-yellow-600 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Total Reviews</h3>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}