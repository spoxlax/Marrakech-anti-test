import React from 'react';
import { Globe, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-12 w-full text-[#222222]">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Support */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Support</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-600">
                            <li className="hover:underline cursor-pointer">Help Center</li>
                            <li className="hover:underline cursor-pointer">AirCover</li>
                            <li className="hover:underline cursor-pointer">Anti-discrimination</li>
                            <li className="hover:underline cursor-pointer">Disability support</li>
                            <li className="hover:underline cursor-pointer">Cancellation options</li>
                            <li className="hover:underline cursor-pointer">Report neighborhood concern</li>
                        </ul>
                    </div>

                    {/* Hosting */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Hosting</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-600">
                            <li className="hover:underline cursor-pointer">Airbnb your home</li>
                            <li className="hover:underline cursor-pointer">AirCover for Hosts</li>
                            <li className="hover:underline cursor-pointer">Hosting resources</li>
                            <li className="hover:underline cursor-pointer">Community forum</li>
                            <li className="hover:underline cursor-pointer">Hosting responsibly</li>
                            <li className="hover:underline cursor-pointer">Airbnb-friendly apartments</li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Community</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-600">
                            <li className="hover:underline cursor-pointer">Airbnb.org: disaster relief housing</li>
                            <li className="hover:underline cursor-pointer">Combating discrimination</li>
                        </ul>
                    </div>

                    {/* About */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">About</h4>
                        <ul className="space-y-3 text-sm font-light text-neutral-600">
                            <li className="hover:underline cursor-pointer">Newsroom</li>
                            <li className="hover:underline cursor-pointer">New features</li>
                            <li className="hover:underline cursor-pointer">Careers</li>
                            <li className="hover:underline cursor-pointer">Investors</li>
                            <li className="hover:underline cursor-pointer">Gift cards</li>
                            <li className="hover:underline cursor-pointer">Airbnb.org emergency stays</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span>© 2025 Antigravity, Inc.</span>
                        <span className="hidden md:inline">·</span>
                        <span className="hover:underline cursor-pointer">Privacy</span>
                        <span className="hidden md:inline">·</span>
                        <span className="hover:underline cursor-pointer">Terms</span>
                        <span className="hidden md:inline">·</span>
                        <span className="hover:underline cursor-pointer">Sitemap</span>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0 font-semibold items-center">
                        <div className="flex items-center gap-2 cursor-pointer hover:underline">
                            <Globe size={18} />
                            <span>English (US)</span>
                        </div>
                        <div className="cursor-pointer hover:underline">
                            $ USD
                        </div>
                        <div className="flex gap-4">
                            <Facebook size={18} className="cursor-pointer hover:opacity-80" />
                            <Twitter size={18} className="cursor-pointer hover:opacity-80" />
                            <Instagram size={18} className="cursor-pointer hover:opacity-80" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
