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
            <div className="w-full px-6 py-6 lg:px-8">
                <nav className="flex items-center justify-between relative">
                    {/* Logo */}
                    <div className="flex items-center gap-2 relative z-50">
                        <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-[#001F3F]" />
                        </div>
                        <span className="text-2xl text-white font-bold">DormSync</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <a href="#features" className="text-white/90 hover:text-white transition-colors font-medium">
                            Features
                        </a>
                        <a href="#about" className="text-white/90 hover:text-white transition-colors font-medium">
                            About
                        </a>
                        <a href="#contact" className="text-white/90 hover:text-white transition-colors font-medium">
                            Contact
                        </a>
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
                                href="#about"
                                className="text-2xl text-white font-medium hover:text-[#FFD700] transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                About
                            </a>
                            <a
                                href="#contact"
                                className="text-2xl text-white font-medium hover:text-[#FFD700] transition-colors"
                                onClick={handleMobileLinkClick}
                            >
                                Contact
                            </a>
                            <div className="flex flex-col gap-4 mt-8 w-64">
                                {/* Mobile buttons removed as per request */}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
