import React from 'react';
import { Users, Map, ShoppingBag, ArrowUpRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    // Mock Data for now
    const stats = [
        { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Activities', value: '156', change: '+5%', icon: Map, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Bookings', value: '3,892', change: '+18%', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, Admin.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                                <ArrowUpRight size={12} />
                                {stat.change}
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Mockup */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold">Recent Registrations</h3>
                </div>
                <div className="p-6 text-center text-gray-500 text-sm">
                    Graph or table placeholder
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
