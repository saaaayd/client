import { Building2, Menu } from 'lucide-react';

export function Header({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
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

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={onGetStarted} className="px-4 py-2 text-white hover:text-white hover:bg-white/10 rounded-md font-medium transition-colors">
                            Sign In
                        </button>
                        <button onClick={onGetStarted} className="px-4 py-2 bg-[#FFD700] text-[#001F3F] hover:bg-[#FFD700]/90 rounded-md font-medium transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white">
                        <Menu className="h-6 w-6" />
                    </button>
                </nav>
            </div>
        </header>
    );
}
