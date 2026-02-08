import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header({ onGetStarted }: { onGetStarted: () => void }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 relative z-50">
                        <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-[#001F3F]" />
                        </div>
                        <span className="text-2xl text-white font-bold">DormSync</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white/90 hover:text-white transition-colors font-medium">
                            Features
                        </a>
                        <a href="#location" className="text-white/90 hover:text-white transition-colors font-medium">
                            Location
                        </a>
                        <a href="#contact" className="text-white/90 hover:text-white transition-colors font-medium">
                            Contact
                        </a>
                    </div>

                    {/* CTA Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={onGetStarted} className="px-4 py-2 text-white hover:text-white hover:bg-white/10 rounded-md font-medium transition-colors">
                            Sign In
                        </button>
                        <button onClick={onGetStarted} className="px-4 py-2 bg-[#FFD700] text-[#001F3F] hover:bg-[#FFD700]/90 rounded-md font-medium transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white relative z-50"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-40 bg-[#001F3F] flex flex-col items-center justify-center gap-8 md:hidden">
                            <a
                                href="#features"
                                className="text-2xl text-white font-medium hover:text-[#FFD700] transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                Features
                            </a>
                            <a
                                href="#location"
                                className="text-2xl text-white font-medium hover:text-[#FFD700] transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                Location
                            </a>
                            <a
                                href="#contact"
                                className="text-2xl text-white font-medium hover:text-[#FFD700] transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                Contact
                            </a>
                            <div className="flex flex-col gap-4 mt-8 w-64">
                                <button
                                    onClick={() => {
                                        handleMobileLinkClick();
                                        onGetStarted();
                                    }}
                                    className="w-full px-6 py-3 text-white border border-white/20 hover:bg-white/10 rounded-lg font-medium transition-colors text-lg"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        handleMobileLinkClick();
                                        onGetStarted();
                                    }}
                                    className="w-full px-6 py-3 bg-[#FFD700] text-[#001F3F] hover:bg-[#FFD700]/90 rounded-lg font-medium transition-colors text-lg"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
