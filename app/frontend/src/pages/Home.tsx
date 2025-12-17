import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityCard, { type Activity } from '../components/ActivityCard';
import { useQuery, gql } from '@apollo/client';
import { Palmtree, Tent, Mountain, Camera, Grid, Car, ChevronLeft, ChevronRight } from 'lucide-react';

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
      category
    }
  }
`;

const categories = [
    { label: 'All', icon: Grid },
    { label: 'Camping', icon: Tent },
    { label: 'Camel Tours', icon: Palmtree },
    { label: 'Quad Tours', icon: Mountain },
    { label: 'Buggy Tours', icon: Car },
    { label: 'Hiking', icon: Mountain },
    { label: 'Tours', icon: Camera },
];

const sliderImages = [
    {
        url: 'https://images.pexels.com/photos/2403205/pexels-photo-2403205.jpeg',
        title: 'Desert sunsets',
        subtitle: 'Camel rides and golden-hour views',
    },
    {
        url: 'https://images.pexels.com/photos/3185485/pexels-photo-3185485.jpeg',
        title: 'Off-road adventures',
        subtitle: 'Quads, dunes, and wide open spaces',
    },
    {
        url: 'https://images.pexels.com/photos/2403204/pexels-photo-2403204.jpeg',
        title: 'Camp under the stars',
        subtitle: 'Dinner, music, and stargazing',
    },
    {
        url: 'https://images.pexels.com/photos/804128/pexels-photo-804128.jpeg',
        title: 'Sunrise buggy rides',
        subtitle: 'Thrills with panoramic viewpoints',
    },
];

const Home: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeSlide, setActiveSlide] = useState(0);
    const { loading, error, data } = useQuery(GET_ACTIVITIES);

    const activities: Activity[] = data?.activities || [];

    const filteredActivities = selectedCategory === 'All'
        ? activities
        : activities.filter(a => a.category === selectedCategory);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % sliderImages.length);
        }, 3000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    const goPrev = () => {
        setActiveSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    };

    const goNext = () => {
        setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-[#222222]">
            <Navbar />

            <div className="pt-24 px-4 sm:px-8 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2">
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm">
                    <div className="relative aspect-[16/10] sm:aspect-[21/9]">
                        {sliderImages.map((item, index) => (
                            <div
                                key={item.url}
                                className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                            </div>
                        ))}

                        <div className="absolute left-6 right-6 bottom-6 sm:left-8 sm:right-8 sm:bottom-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-[#FF385C]" />
                                Marrakech experiences
                            </div>
                            <div className="mt-3">
                                <div className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
                                    {sliderImages[activeSlide].title}
                                </div>
                                <div className="text-white/90 text-sm sm:text-base mt-1">
                                    {sliderImages[activeSlide].subtitle}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={goPrev}
                            aria-label="Previous slide"
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label="Next slide"
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition"
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {sliderImages.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setActiveSlide(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={`h-2 w-2 rounded-full transition ${i === activeSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Bar */}
            <div className="pb-4 px-4 sm:px-8 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 border-b border-gray-100 sticky top-20 bg-white z-40 overflow-x-auto scrollbar-hide shadow-sm">
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

            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-8 pb-14">

                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[22px] sm:text-[26px] font-semibold leading-tight">
                            {selectedCategory === 'All' ? 'All experiences' : selectedCategory}
                        </h1>
                        <div className="text-sm text-neutral-500 mt-1">
                            {loading ? 'Loading listings…' : `${filteredActivities.length} listing${filteredActivities.length === 1 ? '' : 's'}`}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold hover:border-black hover:bg-neutral-50 transition"
                    >
                        Sort
                    </button>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-3">
                                <div className="bg-gray-200 rounded-xl aspect-square"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div className="text-red-500 text-center py-10">Error loading activities: {error.message}</div>}

                {!loading && !error && (
                    <>
                        {filteredActivities.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                                {filteredActivities.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-2xl font-bold mb-4">No activities found</div>
                                <p className="text-gray-500">Try selecting a different category.</p>
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className="mt-6 px-6 py-2 border border-black rounded-lg hover:bg-gray-100 transition"
                                >
                                    Show all activities
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Home;
