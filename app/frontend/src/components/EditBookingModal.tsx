import React, { useState, useEffect } from 'react';
import { X, Loader, User, Calendar, DollarSign, Activity } from 'lucide-react';

interface EditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: any) => Promise<void>;
    booking: any;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ isOpen, onClose, onSave, booking }) => {
    const [formData, setFormData] = useState({
        date: '',
        adults: 0,
        children: 0,
        totalPrice: 0,
        status: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (booking) {
            setSaveError(null);
            setFormData({
                date: booking.date || '',
                adults: booking.persons?.adults || 0,
                children: booking.persons?.children || 0,
                totalPrice: booking.totalPrice || 0,
                status: booking.status || 'pending'
            });
        }
    }, [booking]);

    if (!isOpen || !booking) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);
        try {
            await onSave(booking.id, {
                date: formData.date,
                persons: {
                    adults: parseInt(formData.adults as any),
                    children: parseInt(formData.children as any)
                },
                totalPrice: parseFloat(formData.totalPrice as any),
                status: formData.status
            });
            onClose();
        } catch (error) {
            console.error(error);
            setSaveError("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Format date for input datetime-local if it's a timestamp string
    const formattedDate = formData.date && !isNaN(Number(formData.date))
        ? new Date(parseInt(formData.date)).toISOString().slice(0, 16)
        : formData.date;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Convert back to timestamp string for backend consistency
        const timestamp = new Date(e.target.value).getTime().toString();
        setFormData({ ...formData, date: timestamp });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Edit Booking</h2>

                {saveError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <Activity size={16} />
                        {saveError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="datetime-local"
                                value={formattedDate}
                                onChange={handleDateChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.adults}
                                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.children}
                                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                step="0.01"
                                value={formData.totalPrice}
                                onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving && <Loader size={16} className="animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookingModal;
