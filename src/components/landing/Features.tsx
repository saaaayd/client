import { Users, Wrench, BarChart3, Shield, Bell, Calendar } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Community Connection',
        description: 'Connect with fellow residents, join study groups, and participate in dorm activities.',
    },
    {
        icon: Wrench,
        title: 'Quick Maintenance',
        description: 'Submit repair requests instantly and track their status in real-time from your phone.',
    },
    {
        icon: BarChart3,
        title: 'Easy Payments',
        description: 'View your billing history and make secure online rent payments without the hassle.',
    },
    {
        icon: Shield,
        title: 'Safety First',
        description: '24/7 security monitoring and digital access control for your peace of mind.',
    },
    {
        icon: Bell,
        title: 'Stay Informed',
        description: 'Never miss an announcement about building updates, events, or important deadlines.',
    },
    {
        icon: Calendar,
        title: 'Facility Booking',
        description: 'Reserve study rooms, common areas, or laundry slots directly through the app.',
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-[#001F3F] mb-4">
                        Designed for Your
                        <span className="block text-[#FFD700]">Comfort & Success</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Everything you need to make your student life easier, all in one app.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                <div className="w-14 h-14 rounded-lg bg-[#001F3F] flex items-center justify-center mb-5 group-hover:bg-[#FFD700] transition-colors">
                                    <Icon className="h-7 w-7 text-[#FFD700] group-hover:text-[#001F3F]" />
                                </div>
                                <h3 className="text-[#001F3F] text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
