import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-[#222222]">
            <Navbar />
            <main className="max-w-[1120px] mx-auto px-4 sm:px-10 py-12 pt-28 pb-14">
                <section className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
                    <div className="max-w-2xl">
                        <div className="text-sm font-semibold text-[#FF385C]">About</div>
                        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">About Wanderlust</h1>
                        <p className="text-gray-600 text-lg mt-4">
                            Wanderlust is a modern platform for discovering and booking authentic activities around the world,
                            inspired by the simplicity and trust of Airbnb.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mt-10">
                        <div className="rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">For Travelers</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Browse curated experiences, compare options, and book instantly with secure checkout and clear pricing.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">For Hosts</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Create and manage activities, track bookings, and grow your business with real‑time insights.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-2">For Admins</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Monitor platform health, manage users and content, and maintain a safe marketplace.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
