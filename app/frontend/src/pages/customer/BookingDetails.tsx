import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Download, CheckCircle, Clock, XCircle, ArrowLeft, Camera, Users } from 'lucide-react';

const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($id: ID!) {
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
      customerInfo {
          firstName
          lastName
          email
          phone
      }
      activity {
        id
        title
        images
        city
        description
      }
      professionalPhotos
    }
  }
`;

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loading, error, data } = useQuery(GET_BOOKING_DETAILS, {
        variables: { id }
    });

    if (loading) return <div className="p-8 text-center">Loading booking details...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const booking = data?.booking;
    if (!booking) return <div className="p-8">Booking not found</div>;

    const bookingDate = new Date(parseInt(booking.date));

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to My Bookings
                </button>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{booking.activity.title}</h1>
                        <div className="flex items-center gap-2 text-gray-500">
                            <MapPin size={18} />
                            {booking.activity.city || 'Marrakech'}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`
                            px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-2
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}
                        `}>
                            {booking.status}
                        </span>
                        <div className="text-sm text-gray-500">
                            Code: <span className="font-mono font-semibold text-gray-900">{booking.confirmationCode}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Professional Photos Section */}
                    {booking.professionalPhotos?.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-pink-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#FF385C] text-white rounded-full flex items-center justify-center">
                                        <Camera size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Your Photos are Ready!</h2>
                                        <p className="text-xs text-gray-500">Professional shots from your trip.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {booking.professionalPhotos.map((photo: string, index: number) => (
                                    <div key={index} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in">
                                        <img src={photo} alt={`Memory ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <a
                                                href={photo}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                title="Download Original"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={20} className="text-black" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            <Camera size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="font-medium">No photos yet</h3>
                            <p className="text-sm mt-1">If your guide took photos, they will appear here soon.</p>
                        </div>
                    )}

                    {/* Itinerary / Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold mb-4">Trip Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Date & Time</div>
                                    <div className="font-semibold text-gray-900">
                                        {bookingDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {bookingDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Guests</div>
                                    <div className="font-semibold text-gray-900">
                                        {booking.persons.adults} Adults
                                        {booking.persons.children > 0 && `, ${booking.persons.children} Children`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Payment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold mb-4">Payment Summary</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">Method</span>
                            <span className="font-medium">{booking.paymentMethod === 'CARD' ? 'Credit Card' : 'Pay on Arrival'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg">${booking.totalPrice}</span>
                        </div>
                    </div>

                    {/* Customer Info (Read Only) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-bold mb-4">Traveler Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-gray-500">Name</div>
                                <div className="font-medium">{booking.customerInfo?.firstName} {booking.customerInfo?.lastName}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Email</div>
                                <div className="font-medium">{booking.customerInfo?.email}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Phone</div>
                                <div className="font-medium">{booking.customerInfo?.phone || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
