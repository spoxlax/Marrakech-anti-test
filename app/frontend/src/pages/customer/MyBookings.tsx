import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Camera } from 'lucide-react';

const GET_MY_BOOKINGS = gql`
  query MyBookings {
    myBookings {
      id
      date
      status
      totalPrice
      paymentMethod
      confirmationCode
      activity {
        id
        title
        images
        city
      }
    }
  }
`;

type MyBooking = {
    id: string;
    date: string;
    status: string;
    totalPrice: number;
    paymentMethod: string;
    confirmationCode: string;
    activity: {
        id: string;
        title: string;
        images: string[];
        city: string;
    };
    professionalPhotos: string[];
};

const MyBookings: React.FC = () => {
    const { loading, error, data } = useQuery(GET_MY_BOOKINGS);
    const navigate = useNavigate();

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 h-48 rounded-xl animate-pulse" />
            ))}
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-red-600">
            Error loading bookings: {error.message}
        </div>
    );

    const bookings = data?.myBookings as MyBooking[] | undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Bookings</h1>
                <span className="text-gray-500 text-sm">{bookings?.length || 0} trips</span>
            </div>

            <div className="space-y-4">
                {(!bookings || bookings.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                        <p className="text-gray-500 mt-1 mb-6">Time to dust off your luggage!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black hover:bg-neutral-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
                        >
                            Explore Activities
                        </button>
                    </div>
                )}

                {bookings?.map((booking) => (
                    <div
                        key={booking.id}
                        onClick={() => navigate(`/my-bookings/${booking.id}`)}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <div className="flex flex-col sm:flex-row">
                            {/* Image */}
                            <div className="sm:w-48 h-48 sm:h-auto relative bg-gray-100 flex-shrink-0">
                                <img
                                    src={booking.activity?.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={booking.activity?.title}
                                    className="w-full h-full object-cover"
                                />
                                {booking.professionalPhotos?.length > 0 && (
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                                        <Camera size={12} className="text-[#FF385C]" />
                                        <span>Photos Ready</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            {booking.activity.city || 'Marrakech'}
                                        </div>
                                        <span className={`
                                            px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}
                                        `}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#FF385C] transition-colors line-clamp-1">
                                        {booking.activity?.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={16} />
                                            <span>{new Date(parseInt(booking.date)).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span>•</span>
                                            <span>{booking.confirmationCode}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Total: </span>
                                        <span className="font-semibold text-gray-900">${booking.totalPrice}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                        View Details <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyBookings;
