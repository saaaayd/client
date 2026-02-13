import { CheckCircle2 } from 'lucide-react';
import img from '../../assets/dorm_pic/6d3ca244-737e-43da-85fc-7a45b00cdbce.jpg';

export function About() {
    return (
        <section id="about" className="py-24 bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Image Side */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                        <img src={img} alt="About DormSync" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-[#001F3F]/20"></div>
                    </div>

                    {/* Text Side */}
                    <div>
                        <h2 className="text-4xl font-bold text-[#001F3F] mb-6">About DormSync</h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            DormSync is designed to streamline dormitory living for students and administrators alike.
                            We provide a centralized platform for managing maintenance requests, payments, and community announcements,
                            ensuring a hassle-free living experience.
                        </p>
                        <ul className="space-y-4">
                            {['Streamlined Management', 'Secure Environment', 'Community Focused'].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-[#FFD700]" />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
