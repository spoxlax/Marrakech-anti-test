import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/authCore';
import { Menu, User, Globe } from 'lucide-react';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full bg-white z-50 border-b border-gray-200">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 cursor-pointer">
                        <span className="text-[#FF385C] text-2xl font-bold hidden md:block">Marrakech Travel</span>
                        <span className="text-[#FF385C] text-2xl font-bold block md:hidden">MT</span>
                    </Link>

                    {/* User Menu */}
                    <div className="relative">
                        <div className="flex flex-row items-center gap-3">
                            <div
                                onClick={() => {
                                    if (user?.role === 'admin') {
                                        navigate('/admin');
                                    } else if (user?.role === 'vendor') {
                                        navigate('/hosting');
                                    } else {
                                        navigate('/login');
                                    }
                                }}
                                className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                            >
                                Switch to hosting
                            </div>
                            <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                                <Globe size={18} />
                            </div>
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
                            >
                                <Menu size={18} />
                                <div className="hidden md:block">
                                    <div className='bg-gray-500 rounded-full text-white p-1 overflow-hidden'>
                                        <User size={18} className="text-white relative top-[2px]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isMenuOpen && (
                            <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm z-50">
                                <div className="flex flex-col cursor-pointer">
                                    {user ? (
                                        <>
                                            <div className="px-4 py-3 hover:bg-neutral-100 font-semibold cursor-default">
                                                Welcome, {user.firstName}
                                            </div>
                                            {user.role === 'vendor' && (
                                                <Link to="/hosting/bookings" className="px-4 py-3 hover:bg-neutral-100">My Trips</Link>
                                            )}
                                            {user.role === 'admin' && (
                                                <Link to="/admin" className="px-4 py-3 hover:bg-neutral-100">Admin Dashboard</Link>
                                            )}
                                            <Link to="/saved" className="px-4 py-3 hover:bg-neutral-100">Wishlists</Link>
                                            <hr />
                                            <div onClick={logout} className="px-4 py-3 hover:bg-neutral-100 text-red-500">
                                                Logout
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login" className="px-4 py-3 hover:bg-neutral-100 font-semibold">Login</Link>
                                            <Link to="/register" className="px-4 py-3 hover:bg-neutral-100">Sign up</Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

