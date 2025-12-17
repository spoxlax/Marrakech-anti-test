import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityCard, { type Activity } from '../components/ActivityCard';
import { useQuery, gql } from '@apollo/client';
import { Palmtree, Tent, Mountain, Camera, Grid, Car, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';

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

const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($query: String!) {
    searchSuggestions(query: $query)
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
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeSlide, setActiveSlide] = useState(0);
    const [whereQuery, setWhereQuery] = useState('');
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [openPanel, setOpenPanel] = useState<'where' | 'when' | 'who' | null>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

    const { loading, error, data } = useQuery(GET_ACTIVITIES);
    const { data: suggestionsData } = useQuery(SEARCH_SUGGESTIONS, {
        variables: { query: whereQuery },
        skip: whereQuery.trim().length < 2,
    });

    const activities: Activity[] = data?.activities || [];

    const filteredActivities = selectedCategory === 'All'
        ? activities
        : activities.filter(a => a.category === selectedCategory);

    const guestCount = adults + children;
    const guestLabel = useMemo(() => {
        if (guestCount <= 0) return 'Add guests';
        return `${guestCount} guest${guestCount === 1 ? '' : 's'}`;
    }, [guestCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                setOpenPanel(null);
            }
        };

        if (openPanel) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openPanel]);

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

    const handleSearch = (queryOverride?: string) => {
        const q = (queryOverride ?? whereQuery).trim();
        const params = new URLSearchParams();

        if (q) params.set('q', q);
        if (searchDate) params.set('date', searchDate.toISOString().split('T')[0]);
        params.set('adults', String(adults));
        params.set('children', String(children));
        params.set('guests', String(guestCount));

        setOpenPanel(null);
        navigate(params.toString() ? `/search?${params.toString()}` : '/search');
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

                <div className="relative z-50 -mt-5 sm:-mt-7 pb-6" ref={searchBarRef}>
                    <div className="mx-auto max-w-4xl">
                        <div className="relative">
                            <div className="bg-white border border-gray-200 shadow-md rounded-3xl md:rounded-full">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div
                                        className={`flex-1 px-6 py-4 md:py-3 rounded-t-3xl md:rounded-full transition ${openPanel === 'where' ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                                        onClick={() => setOpenPanel('where')}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setOpenPanel('where');
                                        }}
                                    >
                                        <div className="text-[10px] font-bold uppercase text-gray-500">Where</div>
                                        <input
                                            value={whereQuery}
                                            onChange={(e) => {
                                                setWhereQuery(e.target.value);
                                                if (openPanel !== 'where') setOpenPanel('where');
                                            }}
                                            onFocus={() => setOpenPanel('where')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSearch();
                                            }}
                                            placeholder="Search activities"
                                            className="w-full bg-transparent outline-none text-sm font-medium text-gray-900 placeholder-gray-500"
                                        />
                                    </div>

                                    <div className="hidden md:block h-8 w-px bg-gray-200" />

                                    <button
                                        type="button"
                                        onClick={() => setOpenPanel('when')}
                                        className={`flex-1 px-6 py-4 md:py-3 text-left transition ${openPanel === 'when' ? 'bg-neutral-100' : 'hover:bg-neutral-50'} md:rounded-full`}
                                    >
                                        <div className="text-[10px] font-bold uppercase text-gray-500">When</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {searchDate ? format(searchDate, 'MMM dd, yyyy') : 'Add date'}
                                        </div>
                                    </button>

                                    <div className="hidden md:block h-8 w-px bg-gray-200" />

                                    <button
                                        type="button"
                                        onClick={() => setOpenPanel('who')}
                                        className={`flex-1 px-6 py-4 md:py-3 text-left transition ${openPanel === 'who' ? 'bg-neutral-100' : 'hover:bg-neutral-50'} md:rounded-full`}
                                    >
                                        <div className="text-[10px] font-bold uppercase text-gray-500">Who</div>
                                        <div className={`text-sm font-medium ${guestCount > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {guestLabel}
                                        </div>
                                    </button>

                                    <div className="p-3 md:p-2 md:pr-2 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleSearch()}
                                            aria-label="Search"
                                            className="h-12 w-12 rounded-full bg-[#FF385C] hover:bg-[#D90B3E] text-white flex items-center justify-center shadow-sm transition"
                                        >
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {openPanel === 'where' && whereQuery.trim().length >= 2 && (suggestionsData?.searchSuggestions?.length || 0) > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                                    <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Suggestions</div>
                                    <div className="py-2">
                                        {suggestionsData.searchSuggestions.map((suggestion: string, index: number) => (
                                            <button
                                                key={`${suggestion}-${index}`}
                                                type="button"
                                                onClick={() => {
                                                    setWhereQuery(suggestion);
                                                    setOpenPanel(null);
                                                }}
                                                className="w-full text-left px-6 py-3 hover:bg-neutral-50 transition cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-700"
                                            >
                                                <div className="bg-gray-100 p-2 rounded-lg">
                                                    <Search size={14} className="text-gray-500" />
                                                </div>
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {openPanel === 'when' && (
                                <div className="absolute left-0 right-0 top-full mt-3 flex justify-center z-50">
                                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" style={{ minWidth: '320px' }}>
                                        <style>{`
            .custom-home-calendar .rdp {
              --rdp-cell-size: 40px;
              margin: 0;
            }
            .custom-home-calendar .rdp-root {
              font-family: inherit;
            }
            .custom-home-calendar .rdp-month {
              width: 100%;
            }
            .custom-home-calendar .rdp-caption_label {
              font-size: 16px;
              font-weight: 600;
            }
            .custom-home-calendar .rdp-head_cell {
              font-size: 12px;
              font-weight: 600;
              color: #717171;
              text-transform: uppercase;
              width: 40px;
              padding: 8px 0;
            }
            .custom-home-calendar .rdp-cell {
              width: 40px;
              height: 40px;
              padding: 0;
            }
            .custom-home-calendar .rdp-day {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              font-size: 14px;
              font-weight: 500;
            }
            .custom-home-calendar .rdp-day:hover:not([disabled]):not(.rdp-day_selected) {
              background-color: #f0f0f0;
            }
            .custom-home-calendar .rdp-day_selected {
              background-color: #222222 !important;
              color: white !important;
            }
            .custom-home-calendar .rdp-day_disabled {
              opacity: 0.25;
              text-decoration: line-through;
            }
            .custom-home-calendar .rdp-nav_button {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }
            .custom-home-calendar .rdp-nav_button:hover {
              background-color: #f7f7f7;
            }
            .custom-home-calendar .rdp-table {
              width: 100%;
              border-collapse: collapse;
            }
          `}</style>

                                        <div className="custom-home-calendar">
                                            <DayPicker
                                                mode="single"
                                                selected={searchDate}
                                                onSelect={(date) => {
                                                    setSearchDate(date);
                                                    setOpenPanel(null);
                                                }}
                                                disabled={{ before: new Date() }}
                                                showOutsideDays={false}
                                                fixedWeeks
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {openPanel === 'who' && (
                                <div className="absolute left-0 right-0 top-full mt-3 flex justify-center z-50">
                                    <div className="w-full md:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">Adults</div>
                                                    <div className="text-sm text-gray-500">Age 13+</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                                        className="w-9 h-9 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-700 transition"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-8 text-center font-medium">{adults}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAdults(adults + 1)}
                                                        className="w-9 h-9 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-700 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="h-px bg-gray-100" />

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">Children</div>
                                                    <div className="text-sm text-gray-500">Ages 2–12</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                                        disabled={children === 0}
                                                        className="w-9 h-9 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-8 text-center font-medium">{children}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setChildren(children + 1)}
                                                        className="w-9 h-9 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center text-gray-700 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAdults(1);
                                                        setChildren(0);
                                                    }}
                                                    className="text-sm font-semibold underline"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenPanel(null)}
                                                    className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
