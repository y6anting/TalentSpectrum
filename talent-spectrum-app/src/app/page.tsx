"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-background">

      {/* Main Content */}
      <div className="flex items-center justify-center pt-20 pb-8 px-4">
        <div className="max-w-4xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6 text-[#0A400C] font-bold">
            Empowering Neurodivergent Talents.
            <br></br>
            Enabling Inclusive Workplaces.
          </h1>
            <p className="text-xl text-[#3b6b3d] mb-8 max-w-2xl mx-auto">
              Turning inclusion into opportunities for all -
              <br></br>
              where Neurodivergent Talent finds fulfilling careers,
              <br></br>
              and Employers discover exceptional Talents.
            </p>
          </div>

          {/* Search Bar Section */}
          <div className="mb-12">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, inclusive employers, coaches & more..."
                  className="w-full px-6 py-4 pr-12 text-lg border border-[#e8e6f0] rounded-xl focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-white/90 backdrop-blur-sm shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white p-2 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Search Suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-[#3a4043]">
                  Popular searches:
                </span>
                {["Analyst", "Content Marketing", "Designer", "Engineer", "HR"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 bg-white/60 border border-[#e8e6f0] rounded-full text-sm text-[#6b8a7a] hover:bg-[#6b8a7a] hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

        {/* Employers and Jobs Highlights */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-4xl mb-6 text-[#0A400C] font-bold">
            Empowering Neurodivergent Talents.
            <br></br>
            Enabling Inclusive Workplaces.
          </h2>
        </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#e8e6f0]">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Talent Discovery
              </h3>
              <p className="text-[#3a4043] text-sm">
                Uncover your hidden talents and strengths through our
                comprehensive assessment tools.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#e8e6f0]">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                AI Mock Interviews
              </h3>
              <p className="text-[#3a4043] text-sm">
                Practice with our 3D AI interviewer in a safe, neurodivergent-friendly environment.
              </p>
              <Link href="/mock-interview" className="inline-block mt-3">
                <button className="text-xs bg-[#6b8a7a] text-white px-3 py-1 rounded-full hover:bg-[#5d7c6b] transition-colors">
                  Try Now
                </button>
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#e8e6f0]">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Perfect Matches
              </h3>
              <p className="text-[#3a4043] text-sm">
                Connect with opportunities and teams that align with your unique
                skill set.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#e8e6f0]">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Growth Tracking
              </h3>
              <p className="text-[#3a4043] text-sm">
                Monitor your progress and development across different areas of
                expertise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
