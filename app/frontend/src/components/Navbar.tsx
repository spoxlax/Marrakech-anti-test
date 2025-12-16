import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';
import { useAuth } from '../context/authCore';
import { Menu, User, Search, Globe } from 'lucide-react';

const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!) {
    searchSuggestions(query: $query)
  }
`;

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounced query for suggestions could be implemented, but for simplicity interacting directly
    const { data: suggestionsData } = useQuery(SEARCH_SUGGESTIONS, {
        variables: { query: searchQuery },
        skip: searchQuery.length < 2
    });

    const handleSearch = (q: string) => {
        if (!q.trim()) return;
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery);
        }
    };

    return (
        <nav className="fixed w-full bg-white z-50 border-b border-gray-200">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 cursor-pointer">
                        <span className="text-[#FF385C] text-2xl font-bold hidden md:block">airbnb-clone</span>
                        <span className="text-[#FF385C] text-2xl font-bold block md:hidden">A</span>
                    </Link>

                    {/* Search Bar (Centered) */}
                    <div className="hidden md:block w-full md:w-auto relative">
                        <div className="transition-all cursor-pointer border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer flex flex-row items-center justify-between bg-white relative z-10">
                            <input
                                type="text"
                                className="pl-6 pr-2 py-1 text-sm font-semibold outline-none text-gray-800 placeholder-gray-600 bg-transparent w-64"
                                placeholder="Start your search"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                            />
                            <div className="text-sm pl-2 pr-2 text-gray-600 flex flex-row items-center gap-3">
                                <button
                                    onClick={() => handleSearch(searchQuery)}
                                    className="p-2 bg-[#FF385C] rounded-full text-white hover:bg-[#d90b3e] transition"
                                >
                                    <Search size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchQuery.length >= 2 && suggestionsData?.searchSuggestions?.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 z-0 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Suggestions</div>
                                {suggestionsData.searchSuggestions.map((suggestion: string, index: number) => (
                                    <div
                                        key={index}
                                        className="px-6 py-3 hover:bg-neutral-50 cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-700"
                                        onClick={() => {
                                            setSearchQuery(suggestion);
                                            handleSearch(suggestion);
                                        }}
                                    >
                                        <div className="bg-gray-100 p-2 rounded-lg"><Search size={14} className="text-gray-500" /></div>
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <div className="flex flex-row items-center gap-3">
                            <Link to="/hosting" className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                                Switch to hosting
                            </Link>
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
                                            <Link to="/hosting/bookings" className="px-4 py-3 hover:bg-neutral-100">My Trips</Link>
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

