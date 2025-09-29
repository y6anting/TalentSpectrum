"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6b8a7a] mb-4">
            ✨ About Talent Spectrum
          </h1>
          <p className="text-xl text-[#3a4043] max-w-3xl mx-auto">
            We&apos;re on a mission to help everyone discover their unique talents and connect with opportunities that unlock their full potential.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-[#3a4043] mb-6">Our Mission</h2>
            <p className="text-[#3a4043] mb-4 leading-relaxed">
              At Talent Spectrum, we believe that everyone has unique talents waiting to be discovered. 
              Our platform uses cutting-edge assessment tools and AI-powered matching to help individuals 
              understand their strengths and connect with opportunities that align with their natural abilities.
            </p>
            <p className="text-[#3a4043] leading-relaxed">
              We&apos;re transforming how people think about their careers by focusing on innate talents 
              rather than just skills and experience. This approach leads to more fulfilling careers 
              and better outcomes for both individuals and organizations.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
            <div className="text-6xl mb-4 text-center">🎯</div>
            <h3 className="text-xl font-semibold text-[#3a4043] text-center mb-4">Our Vision</h3>
            <p className="text-[#3a4043] text-center">
              A world where everyone is working in roles that leverage their natural talents, 
              creating a more engaged, productive, and fulfilled global workforce.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#3a4043] text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="text-4xl mb-4">🌈</div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Diversity</h3>
              <p className="text-[#3a4043]">
                We celebrate the unique spectrum of talents that every individual brings, 
                recognizing that diversity drives innovation and success.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Science-Based</h3>
              <p className="text-[#3a4043]">
                Our assessments are grounded in psychological research and validated 
                methodologies to ensure accurate and meaningful results.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-3">Empowerment</h3>
              <p className="text-[#3a4043]">
                We empower individuals with self-knowledge and tools to make 
                informed decisions about their careers and personal development.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#3a4043] text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                JS
              </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">Jane Smith</h3>
              <p className="text-[#6b8a7a] mb-3">CEO & Founder</p>
              <p className="text-sm text-[#3a4043]">
                Former talent acquisition executive with 15+ years of experience in helping 
                people find their perfect career matches.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                MD
              </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">Dr. Michael Davis</h3>
              <p className="text-[#6b8a7a] mb-3">Chief Psychology Officer</p>
              <p className="text-sm text-[#3a4043]">
                Licensed psychologist specializing in talent assessment and personality psychology 
                with published research in occupational psychology.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#e8e6f0]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                AL
              </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">Alex Lee</h3>
              <p className="text-[#6b8a7a] mb-3">CTO</p>
              <p className="text-sm text-[#3a4043]">
                AI and machine learning expert who leads our technology team in developing 
                innovative matching algorithms and assessment tools.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
          <h2 className="text-2xl font-bold text-[#3a4043] mb-4">
            Ready to Discover Your Talents?
          </h2>
          <p className="text-[#3a4043] mb-6">
            Join thousands of individuals who have already discovered their unique talents and found their perfect career match.
          </p>
          <Link
            href="/register"
            className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}
