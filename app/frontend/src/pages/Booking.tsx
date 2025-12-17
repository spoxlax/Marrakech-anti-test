import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Star, MapPin, User, Share, Heart, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import DateCalendar from '../components/DateCalendar';

const GET_ACTIVITY_AND_REVIEWS = gql`
  query GetActivityAndReviews($id: ID!) {
    activity(id: $id) {
      id
      title
      description
      priceAdult
      priceChild
      duration
      maxParticipants
      category
      images
    }
    reviews(activityId: $id) {
      id
      rating
      comment
      createdAt
      user {
        firstName
        lastName
      }
    }
  }
`;

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

type Activity = {
  id: string;
  title: string;
  description: string;
  priceAdult: number;
  priceChild: number;
  duration: string;
  maxParticipants: number;
  category: string;
  images?: string[] | null;
};

const Booking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const { data, loading, error } = useQuery(GET_ACTIVITY_AND_REVIEWS, {
    variables: { id },
    skip: !id,
  });

  const activity: Activity | undefined = data?.activity ?? undefined;
  const reviews: Review[] = data?.reviews ?? [];

  const handleReserve = () => {
    if (!activity || !date) return;
    navigate('/checkout', {
      state: {
        activityId: activity.id,
        date: date.toISOString().split('T')[0],
        adults,
        children,
      }
    });
  };

  const calculateTotal = () => {
    if (!activity) return 0;
    return (adults * activity.priceAdult) + (children * activity.priceChild);
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(2)
    : 'New';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error || !activity) return <div className="text-center pt-20">Activity not found</div>;



  return (
    <div className="min-h-screen bg-white font-sans text-[#222222]">
      <Navbar />

      <main className="max-w-[1120px] mx-auto px-4 sm:px-10 py-8 pt-28 pb-14">

        {/* Header Section */}
        <section className="mb-6">
          <h1 className="text-[26px] font-semibold mb-2">{activity.title}</h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2 font-medium underline cursor-pointer">
              <Star size={14} className="fill-black" />
              <span>{averageRating} · {reviews.length} reviews</span>
              <span className="text-neutral-500 no-underline">·</span>
              <span>Marrakech, Morocco</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg underline font-medium text-sm transition">
                <Share size={16} /> Share
              </button>
              <button className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg underline font-medium text-sm transition">
                <Heart size={16} /> Save
              </button>
            </div>
          </div>
        </section>

        {/* Media Grid (Hero) */}
        <ImageGallery images={activity.images} title={activity.title} />

        {/* Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative mt-8">

          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="text-[22px] font-semibold mb-1">Activity hosted by Marrakech Travel</h2>
                <div className="text-neutral-500">
                  {activity.duration} · {activity.maxParticipants} Guests · {activity.category}
                </div>
              </div>
              <div className="bg-neutral-200 h-14 w-14 rounded-full flex items-center justify-center">
                <User size={28} className="text-neutral-500" />
              </div>
            </div>

            {/* Highlights */}
            <div className="border-b pb-6 space-y-4">
              <div className="flex gap-4">
                <Award size={24} className="text-neutral-700" />
                <div>
                  <div className="font-semibold">Top Rated</div>
                  <div className="text-neutral-500 text-sm">Guests say this is one of the most loved experiences.</div>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin size={24} className="text-neutral-700" />
                <div>
                  <div className="font-semibold">Great Location</div>
                  <div className="text-neutral-500 text-sm">100% of recent guests gave the location a 5-star rating.</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <div className="whitespace-pre-line text-neutral-700 leading-relaxed">
                {activity.description}
              </div>
              <div className="mt-4 flex gap-2 items-center font-semibold underline cursor-pointer">
                Show more <span className="rotate-90">›</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="py-6">
              <h2 className="text-[22px] font-semibold mb-4 flex items-center gap-2">
                <Star className="fill-black" size={20} /> {averageRating} · {reviews.length} reviews
              </h2>
              {reviews.length === 0 ? (
                <div className="text-gray-500">No reviews yet. Be the first to review!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 p-4 rounded-xl">
                      <div className="flex gap-3 mb-3 items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold bg-neutral-100">
                          {review.user?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{review.user?.firstName || 'User'} {review.user?.lastName || ''}</div>
                          <div className="text-xs text-gray-500">{new Date(Number(review.createdAt)).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        "{review.comment}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Reservation Card */}
          <div className="relative">
            <div className="sticky top-28 border border-gray-200 rounded-2xl shadow-sm p-6 bg-white">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-2xl font-bold">${activity.priceAdult}</span>
                  <span className="text-neutral-500 text-sm"> / adult</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold underline">
                  <Star size={14} className="fill-black" /> {averageRating}
                </div>
              </div>

              {/* Reservation Inputs */}
              <div className="space-y-4">
                {/* Date Calendar Section */}
                <DateCalendar
                  selectedDate={date}
                  onDateSelect={setDate}
                />

                {/* Guests Section */}
                <div className="border border-gray-300 rounded-xl p-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-3">Guests</label>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">Adults</div>
                        <div className="text-xs text-gray-500">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{adults}</span>
                        <button
                          onClick={() => setAdults(adults + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">Children</div>
                        <div className="text-xs text-gray-500">Ages 2-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-600 hover:text-gray-900 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={children === 0}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{children}</span>
                        <button
                          onClick={() => setChildren(children + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  disabled={!date}
                  className="w-full bg-[#FF385C] hover:bg-[#D90B3E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center"
                >
                  Reserve
                </button>
              </div>

              <p className="text-center text-gray-500 text-sm mt-4 mb-2">You won't be charged yet</p>

              <div className="space-y-3 text-gray-600 text-sm">
                <div className="flex justify-between">
                  <span className="underline">${activity.priceAdult} x {adults} adults</span>
                  <span>${activity.priceAdult * adults}</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between">
                    <span>${activity.priceChild} x {children} children</span>
                    <span>${activity.priceChild * children}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="underline">Service fee</span>
                  <span>$0</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg text-gray-800">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
