import React from 'react';
import { useQuery, gql } from '@apollo/client';

const VENDOR_BOOKINGS = gql`
  query VendorBookings {
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
    }
  }
`;

type VendorBookingRow = {
    id: string;
    date: string;
    status: string;
    totalPrice: number;
    customerInfo?: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
    } | null;
};

const HostingBookings: React.FC = () => {
    const { loading, error, data } = useQuery(VENDOR_BOOKINGS);

    if (loading) return <div className="p-8">Loading bookings...</div>;
    // Note: If vendorBookings resolver is not implemented yet or fails, this will show an error.
    // Assuming it was part of the original schema as viewed earlier.
    if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

    const bookings: VendorBookingRow[] = data?.vendorBookings || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Reservations</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
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
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#FF385C] hover:underline text-sm font-medium">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        No bookings found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostingBookings;
