import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { CheckCircle, Calendar, Users, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      date
      status
      totalPrice
      paymentMethod
      confirmationCode
      persons {
        adults
        children
      }
      activity {
        id
        title
        images
        description
      }
    }
  }
`;

const BookingConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(GET_BOOKING, {
        variables: { id },
        skip: !id,
    });

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (error || !data?.booking) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-red-500 mb-4">Booking not found or error loading details.</div>
            <button onClick={() => navigate('/')} className="underline text-black">Go Home</button>
        </div>
    );

    const { booking } = data;
    const activity = booking.activity || {}; // Fallback if federation fails (though it shouldn't)

    return (
        <div className="min-h-screen bg-white font-sans text-[#222222]">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 pb-14">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Header */}
                    <div className="bg-green-50 p-8 text-center border-b border-green-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
                        <p className="text-green-700">Thank you for your reservation via {booking.paymentMethod === 'CASH' ? 'Pay on Arrival' : 'Card'}.</p>
                    </div>

                    <div className="p-8">
                        {/* Order Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-8 mb-8 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Confirmation Code</div>
                                <div className="text-xl font-mono bg-gray-100 px-3 py-1 rounded inline-block">{booking.confirmationCode || booking.id.toUpperCase().slice(-6)}</div>
                            </div>
                            <div className="text-right sm:text-left">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Paid</div>
                                <div className="text-2xl font-bold">${booking.totalPrice?.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Trip Details */}
                        <h2 className="text-xl font-semibold mb-6">Your Trip Details</h2>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Activity Image */}
                            <div className="w-full md:w-1/3 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                                {activity.images?.[0] ? (
                                    <img src={activity.images[0]} alt={activity.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>

                            {/* Details List */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{activity.title || 'Activity Name Unavailable'}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} /> Marrakech, Morocco
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="mt-0.5 text-black" size={20} />
                                        <div>
                                            <div className="font-semibold">Date</div>
                                            <div className="text-gray-600">{new Date(Number(booking.date)).toDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Users className="mt-0.5 text-black" size={20} />
                                        <div>
                                            <div className="font-semibold">Guests</div>
                                            <div className="text-gray-600">
                                                {booking.persons.adults} Adults
                                                {booking.persons.children > 0 && `, ${booking.persons.children} Children`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/hosting/bookings')}
                                className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="border border-black text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingConfirmation;
