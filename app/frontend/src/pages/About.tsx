import React from 'react';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">About Wanderlust</h1>
                    <p className="text-gray-600 text-lg mb-6">
                        Wanderlust is a modern platform for discovering and booking authentic activities around the world,
                        inspired by the simplicity and trust of Airbnb.
                    </p>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-2">For Travelers</h2>
                            <p className="text-gray-600 text-sm">
                                Browse curated experiences, compare options, and book instantly with secure checkout and clear pricing.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-2">For Hosts</h2>
                            <p className="text-gray-600 text-sm">
                                Create and manage activities, track bookings, and grow your business with real‑time insights.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-2">For Admins</h2>
                            <p className="text-gray-600 text-sm">
                                Monitor platform health, manage users and content, and maintain a safe marketplace.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default About;

