import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer id="contact" className="bg-[#001F3F] text-white">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-[#001F3F]" />
                            </div>
                            <span className="text-2xl font-bold">DormSync</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            The modern solution for seamless dormitory management. Empowering campus housing teams since 2024.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#features" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    Amenities
                                </a>
                            </li>
                            <li>
                                <a href="#location" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    Location
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    House Rules
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    FAQs
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#FFD700] transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-4 font-semibold text-white">Get in Touch</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2 text-gray-300">
                                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#FFD700]" />
                                <span>hello@dormsync.com</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-300">
                                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#FFD700]" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-300">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#FFD700]" />
                                <span>Bukidnon State University<br />Malaybalay City, Bukidnon 8700</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © 2026 DormSync. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-[#FFD700] transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-[#FFD700] transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
