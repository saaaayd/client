import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Import dorm images
import img1 from '../../assets/dorm_pic/6d3ca244-737e-43da-85fc-7a45b00cdbce.jpg';
import img2 from '../../assets/dorm_pic/96c26fe2-e9ba-48d7-8afd-786cef42af48.jpg';
import img3 from '../../assets/dorm_pic/ba4bf437-8e83-48cb-943d-e3537d4a0198.jpg';
import img4 from '../../assets/dorm_pic/cb66d7dd-d6a0-472b-a70d-69a18c9977ee.jpg';
import img5 from '../../assets/dorm_pic/de64580c-ce5f-4d0d-9964-d94d3bb9daf1.jpg';
import img6 from '../../assets/dorm_pic/ec391999-1498-4c4f-be25-acebbf360def.jpg';
import img7 from '../../assets/dorm_pic/ff3261f0-016a-41fc-9286-27a48a505e5a.jpg';

const dormImages = [img1, img2, img3, img4, img5, img6, img7];

export function Hero({ onGetStarted }: { onGetStarted: () => void }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % dormImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative overflow-hidden bg-[#001F3F] text-white">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl tracking-tight font-bold">
                                Modern Dormitory
                                <span className="block text-[#FFD700]">Away From Home</span>
                            </h1>
                            <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
                                Experience comfortable, secure, and connected living. Manage your payments, requests, and stay updated with your dorm community.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
                                <span className="text-gray-200">Instant maintenance requests</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
                                <span className="text-gray-200">Secure online payments</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
                                <span className="text-gray-200">Community events & updates</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={onGetStarted}
                                className="px-8 py-3.5 bg-[#FFD700] text-[#001F3F] hover:bg-[#FFD700]/90 rounded-md font-bold flex items-center gap-2 transition-colors shadow-lg"
                            >
                                Get Started
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                className="px-8 py-3.5 border border-white/30 text-white hover:bg-white/10 rounded-md font-bold transition-colors"
                                onClick={() => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Location
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Image Slideshow */}
                    <div className="relative z-10">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-800 aspect-[4/3] group">
                            {dormImages.map((src, index) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`Dormitory view ${index + 1}`}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                            {/* Overlay gradient for brand consistency */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#001F3F]/40 to-transparent pointer-events-none"></div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FFD700] rounded-full opacity-10 blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave - adjusted to overlap slightly and prevent hairline gaps */}
            <div className="absolute -bottom-[1px] left-0 right-0 z-20">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
                        fill="#F9FAFB"
                    />
                </svg>
            </div>
        </section>
    );
}
