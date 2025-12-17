import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-[#222222]">
            <Navbar />
            <main className="max-w-[800px] mx-auto px-4 sm:px-10 py-12 pt-28 pb-14">
                <section className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-10">
                    <div className="max-w-xl">
                        <div className="text-sm font-semibold text-[#FF385C]">Support</div>
                        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mt-2">Contact us</h1>
                        <p className="text-gray-600 mt-4">
                            Have a question about a booking, hosting activities, or using the platform?
                            Send us a message and we’ll get back to you shortly.
                        </p>
                    </div>

                    <form className="space-y-4 mt-10">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                rows={4}
                                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#D90B3E] shadow-sm"
                            >
                                Send message
                            </button>
                        </div>
                    </form>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
