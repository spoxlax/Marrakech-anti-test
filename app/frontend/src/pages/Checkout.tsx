import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, gql, useQuery } from '@apollo/client';
import { ChevronLeft, CreditCard, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

const GET_ACTIVITY_AND_USER = gql`
  query GetActivityAndUser($id: ID!) {
    activity(id: $id) {
      id
      title
      priceAdult
      priceChild
      images
    }
    me {
      id
      email
      firstName
      lastName
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      paymentMethod
    }
  }
`;

const Checkout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { activityId, date, adults, children } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');

    const [formState, setFormState] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        country: 'Morocco'
    });

    // Fetch activity details AND user details if logged in
    const { data, loading: dataLoading } = useQuery(GET_ACTIVITY_AND_USER, {
        variables: { id: activityId },
        skip: !activityId,
        onCompleted: (data) => {
            if (data?.me) {
                setFormState(prev => ({
                    ...prev,
                    firstName: data.me.firstName || '',
                    lastName: data.me.lastName || '',
                    email: data.me.email || ''
                }));
            }
        }
    });

    const [createBooking, { loading: bookingLoading, error: bookingError }] = useMutation(CREATE_BOOKING);

    useEffect(() => {
        if (!activityId || !date) {
            navigate('/'); // Redirect if invalid state
        }
    }, [activityId, date, navigate]);

    if (dataLoading || !data?.activity) {
        return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
    }

    const activity = data.activity;
    const totalAdultsPrice = activity.priceAdult * adults;
    const totalChildrenPrice = activity.priceChild * children;
    const totalPrice = totalAdultsPrice + totalChildrenPrice;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: result } = await createBooking({
                variables: {
                    input: {
                        activityId: activity.id,
                        vendorId: activity.id,
                        date: date,
                        persons: {
                            adults: Number(adults),
                            children: Number(children)
                        },
                        totalPrice: totalPrice,
                        paymentMethod: paymentMethod, // Pass selected method
                        customerInfo: {
                            firstName: formState.firstName,
                            lastName: formState.lastName,
                            email: formState.email,
                            phone: formState.phone
                        }
                    }
                }
            });

            if (result?.createBooking?.id) {
                // Navigate to confirmation page
                navigate(`/booking/success/${result.createBooking.id}`);
            }
        } catch (err: any) {
            console.error("Booking failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-[#222222]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-10 py-12">
                <div className="flex items-center gap-2 mb-8 text-gray-500 hover:text-gray-800 transition-colors w-max">
                    <ChevronLeft size={20} />
                    <button onClick={() => navigate(-1)} className="font-medium">Back</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left Column: Form */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-2xl font-semibold mb-6">Confirm and pay</h2>
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Your trip</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm">Date</div>
                                            <div className="text-gray-500 text-sm">{new Date(date).toLocaleDateString()}</div>
                                        </div>
                                        <button className="underline font-semibold text-sm" onClick={() => navigate(-1)}>Edit</button>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm">Guests</div>
                                            <div className="text-gray-500 text-sm">{adults} adults{children > 0 ? `, ${children} children` : ''}</div>
                                        </div>
                                        <button className="underline font-semibold text-sm" onClick={() => navigate(-1)}>Edit</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Contact Info */}
                            <section>
                                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none"
                                        value={formState.firstName}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none"
                                        value={formState.lastName}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none md:col-span-2"
                                        value={formState.email}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number (e.g. +212...)"
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none md:col-span-2"
                                        value={formState.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </section>

                            {/* Payment */}
                            <section>
                                <h3 className="text-xl font-semibold mb-4">Pay with</h3>

                                <div className="mb-4 space-y-3">
                                    <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="CARD"
                                                checked={paymentMethod === 'CARD'}
                                                onChange={() => setPaymentMethod('CARD')}
                                                className="w-4 h-4 text-black focus:ring-black"
                                            />
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={20} />
                                                <span className="font-medium">Credit or debit card</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="CASH"
                                                checked={paymentMethod === 'CASH'}
                                                onChange={() => setPaymentMethod('CASH')}
                                                className="w-4 h-4 text-black focus:ring-black"
                                            />
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs font-bold">$</div>
                                                <span className="font-medium">Pay on Arrival</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">No upfront payment</span>
                                    </label>
                                </div>

                                {paymentMethod === 'CARD' && (
                                    <div className="border border-gray-300 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-4 space-y-4 bg-white">
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="Card Number"
                                                className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    placeholder="Expiration (MM/YY)"
                                                    className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    placeholder="CVV"
                                                    className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-black outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold mb-4">Cancellation policy</h3>
                                <p className="text-gray-600 text-sm">Free cancellation until 24 hours before the experience start time. After that, cancel before the experience starts to get a full refund minus the service fee.</p>
                            </section>

                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="w-full bg-[#FF385C] hover:bg-[#D90B3E] text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                                {bookingLoading ? 'Processing...' : (paymentMethod === 'CASH' ? 'Confirm Reservation' : `Confirm and pay $${totalPrice.toFixed(2)}`)}
                            </button>
                            {bookingError && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                                    {bookingError.message}
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="hidden lg:block">
                        <div className="sticky top-32 border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
                            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={activity.images?.[0] || 'https://via.placeholder.com/150'} alt={activity.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Experience hosted by Antigravity</div>
                                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-relaxed">{activity.title}</h3>
                                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                                        <Star size={12} className="fill-black" /> 5.0 <span className="text-gray-400 font-normal">(Mock Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-4">Price details</h3>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                    <span>${activity.priceAdult} x {adults} adults</span>
                                    <span>${totalAdultsPrice.toFixed(2)}</span>
                                </div>
                                {children > 0 && (
                                    <div className="flex justify-between">
                                        <span>${activity.priceChild} x {children} children</span>
                                        <span>${totalChildrenPrice.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-black font-semibold pt-4 border-t border-gray-100 mt-4">
                                    <span>Total (USD)</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
