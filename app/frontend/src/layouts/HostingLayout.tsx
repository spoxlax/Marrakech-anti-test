import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, CalendarCheck, Settings, LogOut, Menu, X, PlusCircle, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/authCore';

const HostingLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.permissions?.includes('*')) return true;
        return user.permissions?.includes(permission);
    };

    // Diagnostic logging for permission troubleshooting
    useEffect(() => {
        if (user) {
            console.group('Sidebar Permission Diagnostics');
            console.log('User Identity:', { id: user.userId, role: user.role, email: user.email });
            console.log('Raw Permissions:', user.permissions);

            const checks = [
                { label: 'Activities View', perm: 'activities:view', result: hasPermission('activities:view') },
                { label: 'Bookings View', perm: 'bookings:view', result: hasPermission('bookings:view') },
                { label: 'Employees View', perm: 'employees:view', result: hasPermission('employees:view') },
                { label: 'Settings View', perm: 'settings:view', result: hasPermission('settings:view') },
            ];
            console.table(checks);
            console.groupEnd();
        }
    }, [user]);

    const mainNavItems = [
        { label: 'Dashboard', path: '/hosting', icon: LayoutDashboard, permission: 'activities:view' },
        { label: 'My Listings', path: '/hosting/listings', icon: List, permission: 'activities:view' },
        { label: 'Bookings', path: '/hosting/bookings', icon: CalendarCheck, permission: 'bookings:view' },
    ];

    // Unified management items - rely on permissions rather than just role
    const managementNavItems = [
        { label: 'Team', path: '/hosting/team', icon: Users, permission: 'employees:view' },
        { label: 'Profiles', path: '/hosting/profiles', icon: Shield, permission: 'settings:view' },
    ];

    const settingsItem = { label: 'Settings', path: '/hosting/settings', icon: Settings };

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

                <div className="p-4">
                    {hasPermission('activities:create') && (
                        <Link to="/hosting/create" className="flex items-center justify-center gap-2 w-full bg-[#FF385C] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#d90b3e] transition-colors">
                            <PlusCircle size={18} />
                            Create Activity
                        </Link>
                    )}
                </div>

                <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto">
                    <nav className="p-2 space-y-1">
                        {mainNavItems.filter(item => hasPermission(item.permission)).map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/hosting' && location.pathname.startsWith(item.path));
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

                    {managementNavItems.some(item => hasPermission(item.permission)) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 px-2">
                            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Management
                            </h3>
                            <nav className="space-y-1">
                                {managementNavItems.filter(item => hasPermission(item.permission)).map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
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
                        </div>
                    )}

                    <div className="mt-auto p-2 border-t border-gray-100">
                        <Link
                            to={settingsItem.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                ${location.pathname.startsWith(settingsItem.path)
                                    ? 'bg-rose-50 text-[#FF385C]'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                            `}
                        >
                            <settingsItem.icon size={20} />
                            {settingsItem.label}
                        </Link>

                        <button
                            onClick={() => {
                                setIsSidebarOpen(false);
                                navigate('/');
                                // Switch to traveling usually just redirects to home or customer view
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors mt-1"
                        >
                            <LogOut size={20} />
                            Switch to Traveling
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-4 left-0 w-full px-4 hidden"> {/* Hidden because we moved logout/settings logic? Keeping original structure logic */}
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                        Switch to Traveling
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
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">HOST MODE</span>
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                            H
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default HostingLayout;
