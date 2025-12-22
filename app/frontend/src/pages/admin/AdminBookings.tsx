import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { CalendarCheck, Search, Filter } from 'lucide-react';

const ADMIN_BOOKINGS = gql`
  query AdminBookings($search: String) {
    allBookings(search: $search) {
      id
      activityId
      date
      confirmationCode
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
        phone
      }
      activity {
        title
      }
      vendor {
        id
        role
      }
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

type AdminBookingRow = {
    id: string;
    date: string;
    status: string;
    confirmationCode?: string;
    totalPrice: number;
    customerInfo?: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    activity?: {
        title?: string | null;
    } | null;
    vendor?: {
        id: string;
        role: string;
    } | null;
};

const AdminBookings: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'VENDOR'>('ALL');

    const { loading, error, data, refetch } = useQuery(ADMIN_BOOKINGS, {
        variables: { search: searchTerm },
        fetchPolicy: 'network-only' // Ensure fresh data for search
    });

    const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateStatus({ variables: { id, status: newStatus } });
            refetch();
        } catch (e) {
            console.error("Failed to update status", e);
            alert("Failed to update status");
        }
    };

    let bookings: AdminBookingRow[] = data?.allBookings || [];

    // Client-side filtering for vendor role since it's a resolved field
    if (filterRole !== 'ALL') {
        bookings = bookings.filter(b =>
            filterRole === 'ADMIN' ? b.vendor?.role === 'admin' : b.vendor?.role === 'vendor'
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Booking Request Management</h1>
                    <p className="text-gray-500 text-sm">View and manage bookings for your listings.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search code, name, email..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-black focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-black focus:outline-none cursor-pointer"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as any)}
                        >
                            <option value="ALL">All Listings</option>
                            <option value="ADMIN">Admin Listings</option>
                            <option value="VENDOR">Vendor Listings</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading && bookings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">Loading booking data...</div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500 text-sm">Error loading bookings: {error.message}</div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Activity</th>
                                    <th className="px-6 py-4">Guest</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                                            {booking.confirmationCode || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {booking.activity?.title || 'Unknown Activity'}
                                            <div className="text-xs text-gray-400 mt-1">
                                                by {booking.vendor?.role || 'unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {booking.customerInfo?.firstName || 'Guest'} {booking.customerInfo?.lastName || ''}
                                            </div>
                                            <div className="text-xs text-gray-500">{booking.customerInfo?.email}</div>
                                            <div className="text-xs text-gray-500">{booking.customerInfo?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-black cursor-pointer
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                                                `}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">${booking.totalPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.length === 0 && (
                            <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                <CalendarCheck size={40} className="text-gray-300" />
                                <p>No bookings found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
