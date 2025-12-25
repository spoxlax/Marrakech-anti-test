import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LayoutDashboard, Heart, Settings } from 'lucide-react';

const CustomerLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans text-[#222222]">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-6 sm:px-12 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-28">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold">My Account</h2>
                                <p className="text-gray-500 text-sm">Manage your trips and details.</p>
                            </div>

                            <nav className="space-y-2">
                                <NavLink
                                    to="/my-bookings"
                                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <LayoutDashboard size={20} />
                                    <span className="font-medium">My Bookings</span>
                                </NavLink>
                                {/* Future: Wishlist, Profile settings */}
                                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                                    <Heart size={20} />
                                    <span className="font-medium">Wishlist</span>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                                    <Settings size={20} />
                                    <span className="font-medium">Account Settings</span>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CustomerLayout;
