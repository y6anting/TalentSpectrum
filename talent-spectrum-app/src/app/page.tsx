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
    <div className="bg-gradient-to-b from-violet-50 to-background">

      {/* Main Content */}
      <div className="flex items-center justify-center pt-20 pb-8 px-4">
        <div className="max-w-6xl w-full text-center">
          {/* Hero Section */}
          <div className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-6 text-[#635bff] font-bold">
            Neurodiversity:
            <br></br>
            Innovation Beyond Inclusion.
          </h1>
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
                  className="w-full px-6 py-4 pr-12 text-lg border border-[#e8e6f0] rounded-xl focus:ring-2 focus:ring-[#635bff] focus:border-[#635bff] outline-none transition-all text-[#3a4043] bg-white/90 backdrop-blur-sm shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#635bff] hover:bg-[#827CFF] text-white p-2 rounded-lg transition-colors"
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
                      className="px-3 py-1 bg-white/60 border border-[#e8e6f0] rounded-full text-sm text-[#635bff] hover:bg-[#635bff] hover:text-white transition-colors"
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
          <h2 className="text-4xl md:text-4xl mb-6 text-[#635bff] font-bold">
            Inclusive Careers For You.
          </h2>
        </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#635bff]">
              <div className="text-3xl mb-4 flex justify-center"><img src="/Google_Logo.png"
                  alt="Google Logo"
                  style={{ width: 'auto', height: '80px'}}
                  className="my-image-class" />
                </div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                UX Designer
              </h3>
              <p className="text-[#3a4043] text-sm">
                Hybrid
                <br></br>
                Flexible work hour
                <br></br>
                RM65k - 85k / annum
              </p>
              <Link href="/mock-interview" className="inline-block mt-3">
                <button className="text-xs bg-[#635bff] text-white px-3 py-1 rounded-full hover:bg-[#827CFF] transition-colors">
                  Apply Now
                </button>
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#635bff]">
              <div className="text-3xl mb-4 flex justify-center"><img src="/PwC_Logo.png"
                  alt="PwC Logo"
                  style={{ width: 'auto', height: '80px'}}
                  className="my-image-class" />
                </div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Consultant
              </h3>
              <p className="text-[#3a4043] text-sm">
                Remote
                <br></br>
                Flexible work hour
                <br></br>
                RM80k - 110k / annum
              </p>
              <Link href="/mock-interview" className="inline-block mt-3">
                <button className="text-xs bg-[#635bff] text-white px-3 py-1 rounded-full hover:bg-[#827CFF] transition-colors">
                  Apply Now
                </button>
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#635bff]">
              <div className="text-3xl mb-4 flex justify-center"><img src="/Gamuda_Logo.png"
                  alt="Gamuda Logo"
                  style={{ width: 'auto', height: '80px'}}
                  className="my-image-class" />
                </div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Developer
              </h3>
              <p className="text-[#3a4043] text-sm">
                Remote
                <br></br>
                Flexible work hour
                <br></br>
                RM70k - 90k / annum
              </p>
              <Link href="/mock-interview" className="inline-block mt-3">
                <button className="text-xs bg-[#635bff] text-white px-3 py-1 rounded-full hover:bg-[#827CFF] transition-colors">
                  Apply Now
                </button>
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#635bff]">
              <div className="text-3xl mb-4 flex justify-center"><img src="/SLB_Logo.png"
                  alt="SLB Logo"
                  style={{ width: 'auto', height: '80px'}}
                  className="my-image-class" />
                </div>
              <h3 className="text-lg font-semibold text-[#3a4043] mb-2">
                Data Analyst
              </h3>
              <p className="text-[#3a4043] text-sm">
                Part time
                <br></br>
                Flexible work hour
                <br></br>
                RM40k - 55k / annum
              </p>
              <Link href="/mock-interview" className="inline-block mt-3">
                <button className="text-xs bg-[#635bff] text-white px-3 py-1 rounded-full hover:bg-[#827CFF] transition-colors">
                  Apply Now
                </button>
              </Link>
            </div>
          </div>
        
        <div>
          <br></br>
          <br></br>
        </div>
                 
        {/* Job Coaches Section */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-4xl mb-6 text-[#635bff] font-bold">
            Job Coaches Matches To You.
          </h2>
        </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#635bff]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <img src="/LeeCheeTat.png"
                alt="Profile photo of Lee Chee Tat"
                className="w-full h-full object-cover"/>
                </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">Lee Chee Tat</h3>
              <p className="text-[#635bff] mb-3">Expert in <br></br>Autism Spectrum Condition</p>
              <p className="text-sm text-[#3a4043] mb-3">
                <em>Certified Professional Coach, Neurodiversity-Affirming Coach.</em>
              </p>
              <p className="text-sm text-[#3a4043]">
                Guiding autistic adults through job search, interview preparation, and workplace communication for over 10 years, focusing on building sustainable careers.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#635bff]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <img src="/JohnStefan.png"
                alt="Profile photo of John Stefan"
                className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">John Stefan</h3>
              <p className="text-[#635bff] mb-3">Expert in <br></br>ADHD and Dyslexia</p>
              <p className="text-sm text-[#3a4043] mb-3">
                <em>ADHD Coach Practitioner, Certified Career Services Provider.</em>
              </p>
              <p className="text-sm text-[#3a4043]">
                8 years of experience leveraging neurodivergent strengths to passionately connect clients with roles that embrace unique cognitive styles.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-[#635bff]">
              <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                <img src="/DrIsaacEbi.png"
                alt="Profile photo of Dr. Isaac Ebi"
                className="w-full h-full object-cover"/>
              </div>
              <h3 className="text-xl font-semibold text-[#3a4043] mb-2">Dr. Isaac Ebi</h3>
              <p className="text-[#635bff] mb-3">Expert in <br></br>Dyslexia and Dyspraxia</p>
              <p className="text-sm text-[#3a4043] mb-3">
                <em>Ph.D. in Occupational Psychology, ICF Professional Certified Coach.</em>
              </p>
              <p className="text-sm text-[#3a4043]">
                Over 15 years of expertise in career development and organizational psychology, specializing in guiding career transitions and advising employers on inclusive practices.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
