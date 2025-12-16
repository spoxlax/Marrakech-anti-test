import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityCard, { type Activity } from '../components/ActivityCard';
import { useQuery, gql } from '@apollo/client';
import { Palmtree, Tent, Mountain, Umbrella, Camera, Coffee, Anchor } from 'lucide-react';

const GET_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      title
      description
      priceAdult
      priceChild
      vendorId
      duration
      images
    }
  }
`;

const categories = [
    { label: 'Beach', icon: Umbrella },
    { label: 'Camping', icon: Tent },
    { label: 'Hiking', icon: Mountain },
    { label: 'Tours', icon: Camera },
    { label: 'Relax', icon: Coffee },
    { label: 'Sailing', icon: Anchor },
    { label: 'Desert', icon: Palmtree },
];

const Home: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('Beach');
    const { loading, error, data } = useQuery(GET_ACTIVITIES);

    const activities: Activity[] = data?.activities || [];

    // Mock sort for "Most Popular" (first 4) and "New" (next 4)
    const popularActivities = [...activities].slice(0, 4);
    const newActivities = [...activities].slice(4, 8); // Assuming there are enough
    const allActivities = activities;

    return (
        <div className="min-h-screen bg-white font-sans text-[#222222]">
            <Navbar />

            {/* Category Bar */}
            <div className="pt-24 pb-4 px-4 sm:px-8 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 border-b border-gray-100 sticky top-20 bg-white z-40 overflow-x-auto scrollbar-hide">
                <div className="flex flex-row items-center justify-between overflow-x-auto pt-4 pb-2 min-w-full gap-8">
                    {categories.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => setSelectedCategory(item.label)}
                            className={`
                                flex flex-col items-center justify-center gap-2 p-3 border-b-2 hover:text-neutral-800 transition cursor-pointer min-w-[60px]
                                ${selectedCategory === item.label ? 'border-neutral-800 text-neutral-800' : 'border-transparent text-neutral-500'}
                            `}
                        >
                            <item.icon size={26} />
                            <div className="font-medium text-xs">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-8 space-y-12">

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-3">
                                <div className="bg-gray-200 rounded-xl aspect-square"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div className="text-red-500 text-center">Error loading activities</div>}

                {!loading && !error && (
                    <>
                        {/* Most Popular Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Most Popular Experiences</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {popularActivities.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </section>

                        {/* New Activities Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">New this week</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {newActivities.length > 0 ? newActivities.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                )) : (
                                    <p className="text-gray-500">No new activities just yet.</p>
                                )}
                            </div>
                        </section>

                        {/* All Activities Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">All Activities in Marrakech</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                                {allActivities.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Home;
