import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { CalendarCheck } from 'lucide-react';

const ADMIN_BOOKINGS = gql`
  query AdminBookings {
    vendorBookings {
      id
      activityId
      date
      persons {
        adults
        children
      }
      totalPrice
      status
      customerInfo {
        firstName
        lastName
        email
      }
      activity {
        title
      }
    }
  }
`;

const AdminBookings: React.FC = () => {
    const { loading, error, data } = useQuery(ADMIN_BOOKINGS);

    if (loading) return <div className="p-8">Loading booking data...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading bookings: {error.message}</div>;

    const bookings = data?.vendorBookings || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Booking Request Management</h1>
                    <p className="text-gray-500 text-sm">View and manage bookings for your listings.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <th className="px-6 py-4">Activity</th>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking: any) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {booking.activity?.title || 'Unknown Activity'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {booking.customerInfo?.firstName || 'Guest'} {booking.customerInfo?.lastName || ''}
                                    </div>
                                    <div className="text-xs text-gray-500">{booking.customerInfo?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
                                     `}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">${booking.totalPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                        <CalendarCheck size={40} className="text-gray-300" />
                        <p>No bookings found for your activities.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
