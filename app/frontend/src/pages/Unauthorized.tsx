import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col font-sans text-[#222222]">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-md flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert size={40} className="text-[#FF385C]" />
                    </div>
                    <h1 className="text-3xl font-semibold mb-3">Access Denied</h1>
                    <p className="text-[#717171] mb-8 leading-relaxed">
                        You don't have permission to access this page. It looks like you're trying to view a protected area.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="border border-black text-black hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Log in with different account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
