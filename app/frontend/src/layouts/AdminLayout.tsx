import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, Settings, LogOut, Menu, X, CalendarCheck } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Activities', path: '/admin/activities', icon: Map },
        { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck }, // Admin Bookings
        { label: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-[#222222]">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed w-64 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <Link to="/" className="text-xl font-bold text-[#FF385C]">
                        Marrakech Travel
                    </Link>
                    <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-rose-50 text-[#FF385C]'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                `}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-0 w-full px-4">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
                    <button
                        className="p-2 -ml-2 text-gray-600 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                            AD
                        </div>
                        <span className="text-sm font-medium hidden sm:block">Admin User</span>
                    </div>
                </header>

                <main className="p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
