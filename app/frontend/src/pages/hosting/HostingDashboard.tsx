import React from 'react';

const HostingDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Hosting Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Coming Soon</h3>
                    <p className="text-2xl font-bold mt-2">$0.00</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Bookings</h3>
                    <p className="text-2xl font-bold mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Overall Rating</h3>
                    <p className="text-2xl font-bold mt-2">New</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 border-dashed text-center text-gray-500">
                <p>Welcome to your hosting dashboard! Create your first activity to get started.</p>
            </div>
        </div>
    );
};

export default HostingDashboard;
