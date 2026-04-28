import { Header } from './landing/Header';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { About } from './landing/About';
import { LocationSection } from './landing/LocationSection';
import { Testimonials } from './landing/Testimonials';
import { Footer } from './landing/Footer';

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-white">
            <Header onGetStarted={onGetStarted} />
            <main>
                <Hero onGetStarted={onGetStarted} />
                <About />
                <Features />
                <Testimonials />
                <LocationSection />
            </main>
            <Footer />
        </div>
    );
}
