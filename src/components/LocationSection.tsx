import { MapPin, Navigation } from 'lucide-react';

export function LocationSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left - Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFD700]/10 px-4 py-2 border border-[#FFD700]/20">
              <Navigation className="h-4 w-4 text-[#FFD700]" />
              <span className="text-sm text-[#001F3F]">Campus Integration</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl text-[#001F3F]">
              Seamlessly Integrated
              <span className="block text-[#FFD700]">Across Your Campus</span>
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              DormSync connects all your dormitory buildings in one unified platform. 
              Track locations, monitor facilities, and manage resources across your entire campus network.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#001F3F]/5 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#001F3F]" />
                </div>
                <div>
                  <h3 className="text-[#001F3F] mb-1">Interactive Maps</h3>
                  <p className="text-gray-600 text-sm">Navigate your campus with intuitive, real-time building maps</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#001F3F]/5 flex items-center justify-center">
                  <svg className="h-6 w-6 text-[#001F3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#001F3F] mb-1">Building Analytics</h3>
                  <p className="text-gray-600 text-sm">Track occupancy, maintenance, and facility status per location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Map Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 lg:p-12">
              {/* Map Container */}
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Map Background */}
                <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Campus Roads */}
                  <path
                    d="M50 200 H350"
                    stroke="#CBD5E1"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M200 50 V350"
                    stroke="#CBD5E1"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  
                  {/* Campus Green Spaces */}
                  <circle cx="120" cy="120" r="40" fill="#E0F2FE" opacity="0.6" />
                  <circle cx="280" cy="120" r="35" fill="#E0F2FE" opacity="0.6" />
                  <circle cx="120" cy="280" r="35" fill="#E0F2FE" opacity="0.6" />
                  <circle cx="280" cy="280" r="40" fill="#E0F2FE" opacity="0.6" />

                  {/* Dormitory Building - Main */}
                  <g transform="translate(200, 200)">
                    {/* Building Shadow */}
                    <rect
                      x="-45"
                      y="-35"
                      width="90"
                      height="70"
                      fill="#001F3F"
                      opacity="0.1"
                      rx="4"
                    />
                    {/* Building */}
                    <rect
                      x="-50"
                      y="-40"
                      width="90"
                      height="70"
                      fill="#001F3F"
                      rx="4"
                    />
                    {/* Windows */}
                    <rect x="-40" y="-30" width="15" height="15" fill="#94A3B8" rx="2" />
                    <rect x="-18" y="-30" width="15" height="15" fill="#94A3B8" rx="2" />
                    <rect x="5" y="-30" width="15" height="15" fill="#94A3B8" rx="2" />
                    <rect x="-40" y="-8" width="15" height="15" fill="#94A3B8" rx="2" />
                    <rect x="-18" y="-8" width="15" height="15" fill="#94A3B8" rx="2" />
                    <rect x="5" y="-8" width="15" height="15" fill="#94A3B8" rx="2" />
                    {/* Door */}
                    <rect x="-10" y="12" width="15" height="18" fill="#FFD700" rx="2" />
                  </g>

                  {/* Location Pin */}
                  <g transform="translate(200, 150)">
                    {/* Pin Shadow */}
                    <ellipse
                      cx="0"
                      cy="85"
                      rx="15"
                      ry="5"
                      fill="#000000"
                      opacity="0.15"
                    />
                    {/* Pin */}
                    <path
                      d="M0,-30 C-12,-30 -22,-20 -22,-8 C-22,4 0,30 0,30 C0,30 22,4 22,-8 C22,-20 12,-30 0,-30 Z"
                      fill="#FFD700"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                    />
                    {/* Pin Inner Circle */}
                    <circle cx="0" cy="-8" r="8" fill="#001F3F" />
                  </g>

                  {/* Additional Buildings (smaller) */}
                  <rect x="80" y="80" width="40" height="30" fill="#64748B" opacity="0.4" rx="2" />
                  <rect x="280" y="290" width="40" height="30" fill="#64748B" opacity="0.4" rx="2" />
                </svg>

                {/* Animated Pulse */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-[60px]">
                  <div className="w-16 h-16 rounded-full bg-[#FFD700] opacity-20 animate-ping"></div>
                </div>
              </div>

              {/* Location Card */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-4 max-w-sm mx-auto border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#001F3F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#001F3F] mb-1">North Hall</h4>
                    <p className="text-sm text-gray-500">Campus Center, Building A</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active
                      </span>
                      <span>245 Residents</span>
                    </div>
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
