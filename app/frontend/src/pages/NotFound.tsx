import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col font-sans text-[#222222]">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-md">
                    <h1 className="text-[120px] font-bold text-gray-200 leading-none select-none">404</h1>
                    <h2 className="text-2xl font-semibold mt-4 mb-2">Oops! We can't seem to find that page.</h2>
                    <p className="text-[#717171] mb-8">
                        Error code: 404. The link you clicked might be broken, or the page may have been removed.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Return Home
                    </button>
                    <div className="mt-8 flex justify-center gap-6 text-[#717171] text-sm underline cursor-pointer">
                        <span>Help Center</span>
                        <span>Sitemap</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
