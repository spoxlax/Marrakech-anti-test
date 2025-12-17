import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authCore';
import { X } from 'lucide-react';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await loginMutation({ variables: { input: { email, password } } });
            if (data?.login?.token) {
                login(data.login.token);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 fixed inset-0 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden relative animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <button onClick={() => navigate('/')} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                    <div className="font-bold text-lg">Log in</div>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                    <div className="text-[#FF385C] text-sm font-semibold">Marrakech Travel</div>
                    <h2 className="text-2xl font-semibold mt-2 mb-6 text-gray-900">Welcome back</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="border border-gray-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                            <div className="relative border-b border-gray-400">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="peer w-full pt-6 pb-2 px-3 outline-none text-gray-900 placeholder-transparent"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs"
                                >
                                    Email
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="peer w-full pt-6 pb-2 px-3 outline-none text-gray-900 placeholder-transparent"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs"
                                >
                                    Password
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm py-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {error.message}
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                            We’ll call or text you to confirm your number. Standard message and data rates apply. <a href="#" className="underline">Privacy Policy</a>
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF385C] hover:bg-[#d90b3e] text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF385C]"
                        >
                            {loading ? 'Processing...' : 'Continue'}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-gray-900 hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
