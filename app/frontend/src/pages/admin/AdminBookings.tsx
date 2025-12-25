import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { CalendarCheck, Search, Filter, Camera, Trash2, Edit } from 'lucide-react';
import PhotoUploadModal from '../../components/PhotoUploadModal';
import EditBookingModal from '../../components/EditBookingModal';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';

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
        professionalPhotos
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

const ADD_BOOKING_PHOTOS = gql`
  mutation AddBookingPhotos($bookingId: ID!, $photoUrls: [String!]!) {
    addBookingPhotos(bookingId: $bookingId, photoUrls: $photoUrls) {
        id
        professionalPhotos
    }
}
`;

const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
}
`;

const UPDATE_BOOKING_DETAILS = gql`
  mutation UpdateBookingDetails($id: ID!, $input: UpdateBookingInput!) {
    updateBookingDetails(id: $id, input: $input) {
        id
        date
      persons {
            adults
            children
        }
        totalPrice
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
    persons?: {
        adults?: number | null;
        children?: number | null;
    } | null;
    activity?: {
        title?: string | null;
    } | null;
    vendor?: {
        id: string;
        role: string;
    } | null;
    professionalPhotos?: string[];
};

const AdminBookings: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'VENDOR'>('ALL');

    // Modals state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const { loading, error, data, refetch } = useQuery(ADMIN_BOOKINGS, {
        variables: { search: searchTerm },
        fetchPolicy: 'network-only'
    });

    const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS);
    const [addPhotos] = useMutation(ADD_BOOKING_PHOTOS);
    const [deleteBooking] = useMutation(DELETE_BOOKING);
    const [updateDetails] = useMutation(UPDATE_BOOKING_DETAILS);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateStatus({ variables: { id, status: newStatus } });
            refetch();
            setToast({ message: 'Status updated successfully', type: 'success' });
        } catch (e) {
            console.error("Failed to update status", e);
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    // --- Photo Upload Handlers ---
    const openUploadModal = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setIsUploadModalOpen(true);
    };

    const handlePhotosUploaded = async (photoUrls: string[]) => {
        if (!selectedBookingId) return;
        console.log('Uploading photos for booking:', selectedBookingId);
        console.log('Photo URLs:', photoUrls);
        try {
            await addPhotos({ variables: { bookingId: selectedBookingId, photoUrls } });
            refetch();
            setToast({ message: 'Photos added successfully!', type: 'success' });
        } catch (err: any) {
            console.error("Mutation Error Full Object:", JSON.stringify(err, null, 2));
            if (err.networkError) {
                console.error("Network Error:", err.networkError);
                // @ts-ignore
                if (err.networkError.result) {
                    // @ts-ignore
                    console.error("Network Error Result:", err.networkError.result);
                }
            }
            if (err.graphQLErrors) {
                console.error("GraphQL Errors:", err.graphQLErrors);
            }
            setToast({ message: 'Failed to link photos to booking', type: 'error' });
        }
    };

    // --- Delete Handler ---
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
            try {
                await deleteBooking({ variables: { id } });
                refetch();
                setToast({ message: 'Booking deleted successfully', type: 'success' });
            } catch (err) {
                console.error(err);
                setToast({ message: 'Failed to delete booking', type: 'error' });
            }
        }
    };

    // --- Edit Handler ---
    const openEditModal = (booking: any) => {
        setSelectedBookingForEdit(booking);
        setIsEditModalOpen(true);
    };

    const handleEditSave = async (id: string, updates: any) => {
        try {
            await updateDetails({ variables: { id, input: updates } });
            refetch();
            setToast({ message: 'Booking updated successfully', type: 'success' });
        } catch (err) {
            throw err; // Modal handles alert
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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Booking Request Management</h1>
                    <p className="text-gray-500 text-sm">View and manage bookings for your listings.</p>
                </div>
                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-black focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-black focus:outline-none cursor-pointer"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as 'ALL' | 'ADMIN' | 'VENDOR')}
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
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
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
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium">
                                                {new Date(parseInt(booking.date)).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {(booking.persons?.adults || 0) + (booking.persons?.children || 0)} Guests • ${booking.totalPrice}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                className={`text - xs font - medium px - 2 py - 1 rounded - full border - none focus: ring - 2 focus: ring - black cursor - pointer
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                    }
`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openUploadModal(booking.id)}
                                                    className="p-1.5 text-gray-500 hover:text-[#FF385C] hover:bg-pink-50 rounded transition-colors relative"
                                                    title="Upload Photos"
                                                >
                                                    <Camera size={18} />
                                                    {booking.professionalPhotos && booking.professionalPhotos.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-[8px] text-white">
                                                            {booking.professionalPhotos.length}
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(booking)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Booking"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Booking"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
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

            {/* Modals */}
            <PhotoUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handlePhotosUploaded}
                bookingId={selectedBookingId || ''}
            />
            <EditBookingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditSave}
                booking={selectedBookingForEdit}
            />
        </div>
    );
};

export default AdminBookings;
