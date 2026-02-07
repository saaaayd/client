import { MapPin, Navigation } from 'lucide-react';

export function LocationSection() {
    return (
        <section id="location" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                    {/* Left - Content */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD700]/10 px-4 py-2 border border-[#FFD700]/20">
                            <Navigation className="h-4 w-4 text-[#FFD700]" />
                            <span className="text-sm text-[#001F3F] font-medium">Prime Location</span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold text-[#001F3F]">
                            Located at
                            <span className="block text-[#FFD700]">Bukidnon State University</span>
                        </h2>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            Never be late for class again. Our dormitory is strategically located within walking distance to academic buildings, libraries, and food spots.
                        </p>

                        <div className="space-y-4 pt-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#001F3F]/5 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-[#001F3F]" />
                                </div>
                                <div>
                                    <h3 className="text-[#001F3F] font-bold mb-1">Convenient Access</h3>
                                    <p className="text-gray-600 text-sm">Minutes away from university gates and public transport</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#001F3F]/5 flex items-center justify-center">
                                    <Navigation className="h-6 w-6 text-[#001F3F]" />
                                </div>
                                <div>
                                    <h3 className="text-[#001F3F] font-bold mb-1">Surrounded by Amenities</h3>
                                    <p className="text-gray-600 text-sm">Close to supermarkets, laundry shops, and student-friendly cafes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Google Map & Card Container */}
                    <div className="relative isolate">
                        {/* Google Map */}
                        <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-100">
                            <iframe
                                src="https://maps.google.com/maps?q=Bukidnon+State+University,+Malaybalay+City,+Bukidnon,+8700&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full"
                            />
                        </div>

                        {/* Location Card Overlay */}
                        <div className="mt-8 lg:mt-0 lg:absolute lg:bottom-8 lg:left-8 bg-white rounded-xl shadow-lg p-4 max-w-sm border border-gray-100 z-10">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-[#001F3F]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#001F3F] font-bold mb-1">Bukidnon State University</h4>
                                    <p className="text-sm text-gray-500">Main Campus, Malaybalay City</p>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            8700
                                        </span>
                                        <span>Student Housing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
