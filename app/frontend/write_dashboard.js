const fs = require('fs');
const content = `import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Users,
  Map as MapIcon,
  ShoppingBag,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface User {
  id: string;
  role: string;
  email: string;
}

interface Activity {
  id: string;
  title: string;
  status: string;
  priceAdult: number;
}

interface Booking {
  id: string;
  date: string;
  totalPrice: number;
  status: string;
  activity: {
    title: string;
  };
}

interface DashboardData {
  users: User[];
  activities: Activity[];
  allBookings: Booking[];
}

// GraphQL Query to fetch all necessary data
const GET_DASHBOARD_DATA = gql\`
  query GetDashboardData {
    users {
      id
      role
      email
    }
    activities {
      id
      title
      status
      priceAdult
    }
    allBookings {
      id
      date
      totalPrice
      status
      activity {
        title
      }
    }
  }
\`;

const COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#484848'];

const AdminDashboard: React.FC = () => {
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_DATA, {
    pollInterval: 30000, // Poll every 30 seconds for real-time updates
  });

  const stats = useMemo(() => {
    if (!data) return null;

    const totalUsers = data.users.length;
    const vendors = data.users.filter((u) => u.role === 'vendor').length;
    const totalActivities = data.activities.length;
    const pendingActivities = data.activities.filter((a) => a.status === 'PENDING').length;
    const totalBookings = data.allBookings?.length || 0;
    const totalRevenue = data.allBookings?.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;

    return {
      totalUsers,
      vendors,
      totalActivities,
      pendingActivities,
      totalBookings,
      totalRevenue
    };
  }, [data]);

  const chartsData = useMemo(() => {
    if (!data) return null;

    // Revenue over time (simplified grouping by date string)
    const revenueMap: Record<string, number> = {};
    data.allBookings?.forEach((b) => {
      const timestamp = isNaN(Number(b.date)) ? b.date : Number(b.date);
      const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[date] = (revenueMap[date] || 0) + b.totalPrice;
    });

    const revenueData = Object.entries(revenueMap)
      .map(([name, value]) => ({ name, value }))
      .slice(-7); // Last 7 data points

    // Booking Status Distribution
    const statusMap: Record<string, number> = {};
    data.allBookings?.forEach((b) => {
      const status = b.status || 'UNKNOWN';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    return { revenueData, statusData };
  }, [data]);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
      Error loading dashboard: {error.message}
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your platform's performance.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100">
            Live Data
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={\`$\${stats?.totalRevenue.toLocaleString()}\`}
          icon={DollarSign}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings.toString() || '0'}
          icon={ShoppingBag}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          label="Active Activities"
          value={stats?.totalActivities.toString() || '0'}
          subValue={\`\${stats?.pendingActivities} Pending\`}
          icon={MapIcon}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers.toString() || '0'}
          subValue={\`\${stats?.vendors} Vendors\`}
          icon={Users}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartsData?.revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value: number) => \`$\${value}\`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [\`$\${value}\`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FF5A5F"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FF5A5F', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-6">Booking Status</h3>
          <div className="h-80 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData?.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartsData?.statusData.map((_, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {chartsData?.statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="capitalize">{entry.name.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Activities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Pending Activities</h3>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {stats?.pendingActivities} Needs Review
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.activities
              .filter((a) => a.status === 'PENDING')
              .slice(0, 5)
              .map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <MapIcon size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">\${activity.priceAdult} / person</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            {stats?.pendingActivities === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
                All activities reviewed!
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.allBookings && [...data.allBookings]
              .sort((a, b) => {
                const dateA = new Date(isNaN(Number(a.date)) ? a.date : Number(a.date)).getTime();
                const dateB = new Date(isNaN(Number(b.date)) ? b.date : Number(b.date)).getTime();
                return dateB - dateA;
              })
              .slice(0, 5)
              .map((booking) => {
                const bookingDate = new Date(isNaN(Number(booking.date)) ? booking.date : Number(booking.date));
                return (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-50 p-2 rounded-lg">
                        <ShoppingBag size={18} className="text-rose-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{booking.activity?.title || 'Unknown Activity'}</p>
                        <p className="text-xs text-gray-500">
                          {bookingDate.toLocaleDateString()} • \${booking.totalPrice}
                        </p>
                      </div>
                    </div>
                    <span className={\`text-xs px-2 py-1 rounded-full \${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }\`}>
                      {booking.status}
                    </span>
                  </div>
                )
              })
            }
            {(!data?.allBookings || data.allBookings.length === 0) && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No bookings yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Stat Cards
interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
      {subValue && (
        <p className="text-xs font-medium text-gray-500 mt-2">
          {subValue}
        </p>
      )}
    </div>
    <div className={\`p-3 rounded-lg \${bg} \${color}\`}>
      <Icon size={24} />
    </div>
  </div>
);

export default AdminDashboard;
`;

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
