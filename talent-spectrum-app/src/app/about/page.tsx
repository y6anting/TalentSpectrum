"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Our Story - Hero with Image Grid */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50 to-background">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#3a4043] mb-8 leading-[0.95]">
                Where talent meets opportunity
              </h1>
              <p className="text-xl md:text-2xl text-[#3a4043]/80 leading-relaxed">
                Making career discovery simple, authentic, and transformative.
              </p>
            </div>

            {/* Image Grid - Inspired by Linktree later phase 2 i add */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-200 to-orange-400 rounded-3xl h-48 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                  Discover
                </div>
                <div className="bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-3xl h-64 flex items-center justify-center text-gray-800 font-bold text-xl shadow-xl">
                  Connect
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-teal-300 to-teal-600 rounded-3xl h-64 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                  Grow
                </div>
                <div className="bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-3xl h-48 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                  Succeed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: AI-Powered Matching - Dark Blue Background */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-widest text-purple-300 mb-6 font-medium">
              AI-POWERED MATCHING
            </p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Intelligent matching.
              <br />
              Zero effort.
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto mb-12">
              Your perfect opportunity finds you.
            </p>
            <button className="bg-white text-[#635bff] px-10 py-5 rounded-full font-semibold text-lg hover:text-[#4f46e5] hover:bg-gray-50 transition-all shadow-2xl">
              Start Now
            </button>
          </div>

          {/* Visual Representation */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              {/* <div className="text-5xl mb-6">📊</div> */}
              <h3 className="text-2xl font-bold mb-4">Assessment</h3>
              <p className="text-purple-200/90 text-lg">
                Discover your unique talent spectrum
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              {/* <div className="text-5xl mb-6">🤖</div> */}
              <h3 className="text-2xl font-bold mb-4">Match</h3>
              <p className="text-purple-200/90 text-lg">
                AI finds your perfect opportunities
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              {/* <div className="text-5xl mb-6">🎯</div> */}
              <h3 className="text-2xl font-bold mb-4">Connect</h3>
              <p className="text-purple-200/90 text-lg">
                Get notified instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Who We Serve - Light Pink/Purple Background */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3a4043] mb-6 leading-tight">
              Built for everyone
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-purple-100 hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-4">
                Job Seekers
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Find roles that match your natural talents
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-4">
                Employers
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Hire people who truly fit your culture
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl border border-orange-100 hover:shadow-2xl transition-all">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">🎓</span>
              </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-4">
                Counselors
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Guide clients with powerful insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Our Values */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3a4043] mb-6 leading-tight">
              What we believe
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-10 rounded-3xl bg-gradient-to-b from-[#faf9f7] to-white border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-7xl mb-8"> </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-5">
                Diversity
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Every talent is unique and valuable
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-b from-[#faf9f7] to-white border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-7xl mb-8"> </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-5">
                Science
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Research-backed, validated assessments
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-b from-[#faf9f7] to-white border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-7xl mb-8"> </div>
              <h3 className="text-3xl font-bold text-[#3a4043] mb-5">
                Empowerment
              </h3>
              <p className="text-[#3a4043]/70 text-lg">
                Knowledge that transforms careers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: By The Numbers */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#2665d6] text-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-24 leading-tight">
            Our impact
          </h2>

          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-bold">50K+</div>
              <p className="text-xl md:text-2xl text-white/80">Assessments</p>
            </div>
            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-bold">5K+</div>
              <p className="text-xl md:text-2xl text-white/80">Matches</p>
            </div>
            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-bold">500+</div>
              <p className="text-xl md:text-2xl text-white/80">Companies</p>
            </div>
            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-bold">95%</div>
              <p className="text-xl md:text-2xl text-white/80">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#faf9f7]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#3a4043] mb-10 leading-tight">
            Start your journey
          </h2>
          <p className="text-2xl md:text-3xl text-[#3a4043]/60 mb-14">
            Discover what makes you exceptional
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/register"
              className="bg-[#635bff] hover:bg-[#4f46e5] text-white px-12 py-5 rounded-full font-semibold text-xl transition-all shadow-2xl hover:shadow-[#635bff]/50 hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="bg-white hover:bg-gray-50 text-[#635bff] border-2 border-[#635bff] px-12 py-5 rounded-full font-semibold text-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 hover:text-[#4f46e5] hover:border-[#4f46e5]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
