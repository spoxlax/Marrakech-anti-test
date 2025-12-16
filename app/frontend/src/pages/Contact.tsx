import React from 'react';
import Navbar from '../components/Navbar';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact us</h1>
                    <p className="text-gray-600 mb-6">
                        Have a question about a booking, hosting activities, or using the platform?
                        Send us a message and we’ll get back to you shortly.
                    </p>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                rows={4}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm"
                            >
                                Send message
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default Contact;

