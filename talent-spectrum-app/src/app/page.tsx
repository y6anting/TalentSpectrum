"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 font-['Plus_Jakarta_Sans',_sans-serif]"
      style={{
        backgroundImage: "url('/n2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Main Content */}
      <div className="flex items-center justify-center pt-24 pb-12 px-4 overflow-visible">
        <div className="max-w-[1400px] w-full text-left">
          {/* Hero Section */}
          <div className="mb-8">
            <h1
              className="leading-[1.15] break-words overflow-visible"
              style={{ wordBreak: "keep-all" }}
            >
              <span
                className="block text-[clamp(2.8rem,5vw,5.5rem)] font-extrabold tracking-tight 
                  bg-clip-text text-transparent 
                  bg-[linear-gradient(115deg,#1a1a1a,#635bff,#9a96ff)] 
                  drop-shadow-[2px_2px_10px_rgba(0,0,0,0.25)]"
              >
                Neurodiversity:
              </span>
              <span
                className="block text-[clamp(1.8rem,4vw,3.8rem)] font-semibold text-[#2e2f34] mt-3"
              >
                Innovation Beyond Inclusion.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-[#3a4043]/80 font-medium leading-relaxed">
              Empowering neurodivergent talents to find inclusive opportunities
              and employers who celebrate cognitive diversity.
            </p>
          </div>

          {/* Search Bar Section */}
          <div className="mb-16 mt-10">
            <div className="max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, inclusive employers, coaches & more..."
                  className="w-full px-6 py-4 pr-12 text-lg border border-[#e8e6f0] rounded-xl 
                    focus:ring-[#635bff] focus:border-[#635bff] outline-none transition-all 
                    text-[#3a4043] bg-white/90 backdrop-blur-sm shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                    bg-[#635bff] hover:bg-[#827CFF] text-white p-2 rounded-lg transition-colors"
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
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#3a4043]">Popular searches:</span>
                {["Analyst", "Content Marketing", "Designer", "Engineer", "HR"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 bg-white/60 border border-[#e8e6f0] 
                        rounded-full text-sm text-[#635bff] hover:bg-[#635bff] hover:text-white 
                        transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ========== BELOW: Existing Sections (Unchanged Layout) ========== */}
          <div className="mt-20">
            <h2 className="text-4xl md:text-4xl text-[#635bff] font-bold">
              Inclusive Careers For You.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {[
              {
                id: "1",
                logo: "/Google_logo.png",
                alt: "Google Logo",
                title: "UX Designer",
                location: "Hybrid",
                schedule: "Flexible work hour",
                salary: "RM65k - 85k / annum",
              },
              {
                id: "2",
                logo: "/PwC_Logo.png",
                alt: "PwC Logo",
                title: "Consultant",
                location: "Remote",
                schedule: "Flexible work hour",
                salary: "RM80k - 110k / annum",
              },
              {
                id: "3",
                logo: "/Gamuda_Logo.png",
                alt: "Gamuda Logo",
                title: "Developer",
                location: "Remote",
                schedule: "Flexible work hour",
                salary: "RM70k - 90k / annum",
              },
              {
                id: "4",
                logo: "/SLB_Logo.png",
                alt: "SLB Logo",
                title: "Data Analyst",
                location: "Part time",
                schedule: "Flexible work hour",
                salary: "RM40k - 55k / annum",
              },
            ].map((job, index) => (
              <Card
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-[#f0eef5]"
              >
                <CardHeader className="flex justify-center mb-4">
                  <img
                    src={job.logo}
                    alt={job.alt}
                    style={{ width: "auto", height: "80px" }}
                    className="mx-auto"
                  />
                </CardHeader>
                <CardTitle className="text-lg font-semibold text-[#3a4043] mb-2 text-center">
                  {job.title}
                </CardTitle>
                <CardContent className="text-center text-sm text-[#3a4043] space-y-1">
                  <p>{job.location}</p>
                  <p>{job.schedule}</p>
                  <p>{job.salary}</p>
                  <Button className="text-sm md:text-base bg-[#635bff] text-white px-5 py-3 rounded-full hover:bg-[#827CFF] transition-colors mt-3">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-20">
            <h2 className="text-4xl md:text-4xl my-10 text-[#635bff] font-bold">
              Job Coaches Matches To You.
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                {
                  name: "Lee Chee Tat",
                  expertise: "Autism Spectrum Condition",
                  image: "/LeeCheeTat.png",
                  title:
                    "Certified Professional Coach, Neurodiversity-Affirming Coach.",
                  description:
                    "Guiding autistic adults through job search, interview preparation, and workplace communication for over 10 years, focusing on building sustainable careers.",
                },
                {
                  name: "John Stefan",
                  expertise: "ADHD and Dyslexia",
                  image: "/JohnStefan.png",
                  title:
                    "ADHD Coach Practitioner, Certified Career Services Provider.",
                  description:
                    "8 years of experience leveraging neurodivergent strengths to passionately connect clients with roles that embrace unique cognitive styles.",
                },
                {
                  name: "Dr. Isaac Ebi",
                  expertise: "Dyslexia and Dyspraxia",
                  image: "/DrIsaacEbi.png",
                  title:
                    "Ph.D. in Occupational Psychology, ICF Professional Certified Coach.",
                  description:
                    "Over 15 years of expertise in career development and organizational psychology, specializing in guiding career transitions and advising employers on inclusive practices.",
                },
              ].map((coach, i) => (
                <div
                  key={i}
                  className="text-center bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                >
                  <div className="w-24 h-24 bg-[#6b8a7a] rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={coach.image}
                      alt={`Profile photo of ${coach.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3a4043] mb-2">
                    {coach.name}
                  </h3>
                  <p className="text-[#635bff] mb-3">
                    Expert in <br />
                    {coach.expertise}
                  </p>
                  <p className="text-sm text-[#3a4043] mb-3">
                    <em>{coach.title}</em>
                  </p>
                  <p className="text-sm text-[#3a4043]">{coach.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
