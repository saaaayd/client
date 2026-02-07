import { Users, Wrench, BarChart3, Shield, Bell, Calendar } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Comprehensive resident profiles, room assignments, and check-in/check-out tracking.',
  },
  {
    icon: Wrench,
    title: 'Maintenance System',
    description: 'Automated work orders, real-time status updates, and priority-based scheduling.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Deep insights into occupancy rates, revenue, and operational efficiency.',
  },
  {
    icon: Shield,
    title: 'Security & Access',
    description: 'Integrated access control, visitor management, and security incident reporting.',
  },
  {
    icon: Bell,
    title: 'Communication Hub',
    description: 'Instant notifications, announcements, and two-way messaging with residents.',
  },
  {
    icon: Calendar,
    title: 'Event Management',
    description: 'Schedule dorm events, manage common spaces, and track facility bookings.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl text-[#001F3F] mb-4">
            Everything You Need to Manage
            <span className="block text-[#FFD700]">Campus Housing</span>
          </h2>
          <p className="text-lg text-gray-600">
            DormSync provides a complete suite of tools designed specifically for modern dormitory operations.
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
                <h3 className="text-[#001F3F] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
