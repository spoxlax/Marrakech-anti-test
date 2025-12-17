import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityCard, { type Activity } from '../components/ActivityCard';
import { SlidersHorizontal, Loader } from 'lucide-react';

const SEARCH_ACTIVITIES = gql`
  query SearchActivities($query: String, $category: String, $minPrice: Float, $maxPrice: Float, $city: String, $minRating: Float) {
    searchActivities(query: $query, category: $category, minPrice: $minPrice, maxPrice: $maxPrice, city: $city, minRating: $minRating) {
      id
      title
      priceAdult
      duration
      images
    }
  }
`;

const SearchResults: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const category = params.get('category') || 'All';
    const city = params.get('city') || 'All';
    const minRating = params.get('rating') || '';
    const minPrice = params.get('minPrice') || '';
    const maxPrice = params.get('maxPrice') || '';

    const { data, loading, error } = useQuery(SEARCH_ACTIVITIES, {
        variables: {
            query: query || undefined,
            category: category === 'All' ? undefined : category,
            city: city === 'All' ? undefined : city,
            minRating: minRating ? parseFloat(minRating) : undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
        },
        fetchPolicy: 'network-only'
    });

    const updateFilters = (key: string, value: string) => {
        const newParams = new URLSearchParams(location.search);
        if (value && value !== 'All') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        navigate(`/search?${newParams.toString()}`);
    };

    const clearFilters = () => {
        navigate('/search');
    };

    const categories = ['All', 'Cultural', 'Nature', 'Adventure', 'Food', 'Sport'];
    const cities = ['All', 'Marrakech', 'Essaouira', 'Agafay', 'Atlas Mountains'];
    const ratings = [3, 4, 4.5];

    return (
        <div className="bg-white min-h-screen font-sans text-[#222222]">
            <Navbar />

            <main className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-8 pt-28 pb-14">

                {/* Advanced Filters Bar */}
                <div className="flex flex-col gap-4 mb-8 sticky top-20 bg-white z-30 py-4 border-b border-gray-100 shadow-sm pb-6">

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateFilters('category', cat)}
                                    className={`px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all
                                        ${category === cat
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-200 hover:border-black bg-white text-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <button onClick={clearFilters} className="text-sm font-semibold text-gray-500 hover:text-black underline">
                            Clear all
                        </button>
                    </div>

                    {/* Secondary Filters: Price, City, Rating */}
                        <div className="flex flex-wrap items-center gap-3">

                        {/* City Dropdown Mock */}
                        <div className="relative group">
                            <select
                                value={city}
                                onChange={(e) => updateFilters('city', e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm font-semibold hover:border-black cursor-pointer focus:outline-none"
                            >
                                {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'Any City' : c}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <SlidersHorizontal size={14} className="text-gray-500" />
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:border-black transition-colors">
                            <span className="text-sm font-semibold">Price</span>
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-16 text-sm border-none outline-none p-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                                value={minPrice}
                                onChange={(e) => updateFilters('minPrice', e.target.value)}
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-16 text-sm border-none outline-none p-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                                value={maxPrice}
                                onChange={(e) => updateFilters('maxPrice', e.target.value)}
                            />
                        </div>

                        {/* Rating Filter */}
                        <div className="flex items-center gap-2">
                            {ratings.map(r => (
                                <button
                                    key={r}
                                    onClick={() => updateFilters('rating', minRating === r.toString() ? '' : r.toString())}
                                    className={`px-3 py-2 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all
                                         ${minRating === r.toString()
                                            ? 'border-black bg-neutral-100'
                                            : 'border-gray-200 hover:border-black bg-white'
                                        }`}
                                >
                                    {r}+ <span className="text-yellow-500">★</span>
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Results Info */}
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] sm:text-[26px] font-semibold leading-tight">
                            {loading
                                ? 'Searching…'
                                : `${data?.searchActivities?.length || 0} result${(data?.searchActivities?.length || 0) === 1 ? '' : 's'}${query ? ` for “${query}”` : ''}`}
                        </h1>
                        <div className="text-sm text-neutral-500 mt-1">
                            Filter by category, city, price, and rating.
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader className="animate-spin text-[#FF385C]" size={40} />
                    </div>
                ) : error ? (
                    <div className="text-red-500 py-10 text-center">
                        <p className="font-semibold">Unable to load results.</p>
                        <p className="text-sm">Please check your connection and try again.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                        {data?.searchActivities?.map((activity: Activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}

                {!loading && data?.searchActivities?.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-semibold mb-2">No results found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <button onClick={clearFilters} className="mt-4 text-[#FF385C] font-semibold underline">Clear all filters</button>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
};

export default SearchResults;
