"use client";

import Link from "next/link";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6b8a7a] mb-4">
            🎯 Discover Your Talents
          </h1>
          <p className="text-xl text-[#3a4043] max-w-3xl mx-auto">
            Uncover your hidden strengths and explore new possibilities with our comprehensive talent assessment tools.
          </p>
        </div>

        {/* Talent Discovery Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Cognitive Assessment</h3>
            <p className="text-[#3a4043] mb-4">
              Evaluate your problem-solving abilities, logical reasoning, and analytical thinking skills.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              Take Assessment
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Creative Skills</h3>
            <p className="text-[#3a4043] mb-4">
              Discover your creative potential in design, writing, innovation, and artistic expression.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              Explore Creativity
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Leadership Potential</h3>
            <p className="text-[#3a4043] mb-4">
              Assess your leadership qualities, communication skills, and team management abilities.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              Assess Leadership
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Technical Skills</h3>
            <p className="text-[#3a4043] mb-4">
              Evaluate your proficiency in technology, programming, and digital tools.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              Test Skills
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Business Acumen</h3>
            <p className="text-[#3a4043] mb-4">
              Measure your understanding of business strategy, market analysis, and entrepreneurship.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              Business Assessment
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Emotional Intelligence</h3>
            <p className="text-[#3a4043] mb-4">
              Understand your emotional awareness, empathy, and interpersonal skills.
            </p>
            <button className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg transition-colors">
              EQ Assessment
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
          <h2 className="text-2xl font-bold text-[#3a4043] mb-4">
            Ready to Discover Your Full Potential?
          </h2>
          <p className="text-[#3a4043] mb-6">
            Take our comprehensive talent assessment and get personalized insights about your strengths and growth areas.
          </p>
          <Link
            href="/register"
            className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
