"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("employer");
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const images = ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-0 px-4 font-['Plus_Jakarta_Sans',_sans-serif]"
      style={{
        backgroundImage: "url('/TalentSpectrumBackground.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Main Content */}
      <div className="flex items-center justify-center pt-10 pb-12 px-4 overflow-visible">
        <div className="max-w-[1400px] w-full text-left">
          {/* Hero Section - Updated with Grid Layout */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div>
              <h1
                className="leading-[1.15] break-words overflow-visible"
                style={{ wordBreak: "keep-all" }}
              >
                {/* <span
                  className="block text-[clamp(1rem,2.5vw,2.5rem)] font-extrabold tracking-tight 
                    bg-clip-text text-white 
                    bg-[linear-gradient(115deg,#1a1a1a,#635bff,#9a96ff)] 
                    drop-shadow-[2px_2px_10px_rgba(0,0,0,0.25)]"
                >
                  Neurodiversity:
                </span>
                <span
                  className="block text-[clamp(1rem,2.5vw,2.5rem)] font-semibold text-white mt-3"
                >
                  Innovation Beyond Inclusion.
                </span> */}
              </h1>
              <p className="block text-[clamp(1rem,10vw,2.5rem)] width-0 font-semibold text-white mt-3">
                Bridging neurodivergent<br />talents to inclusive career
              </p>

              {/* Search Bar Section */}
              <div className="mt-8">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs, inclusive employers, coaches & more..."
                    className="w-5/6 px-6 py-4 pr-12 text-lg border border-[#e8e6f0] rounded-xl 
                      focus:ring-[#635bff] focus:border-[#635bff] outline-none transition-all 
                      text-[#3a4043] bg-white/90 backdrop-blur-sm shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute left-130 top-1/2 transform -translate-y-1/2 
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
                  <span className="text-sm text-white/80 font-medium">Popular searches:</span>
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

            {/* Right Column - Image Carousel */}
            <div className="relative w-full h-[650px] rounded-xl overflow-hidden">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {/* Optional: Dots indicator
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-8"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div> */}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-4xl md:text-4xl my-10 text-white font-bold text-center">
              Why Talent Spectrum?
            </h2>

            {/* Tab Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setActiveTab("employer")}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === "employer"
                    ? "bg-[#635bff] text-white shadow-lg"
                    : "bg-white/60 text-[#3a4043] hover:bg-white/80"
                }`}
              >
                Employer
              </button>
              <button
                onClick={() => setActiveTab("employee")}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === "employee"
                    ? "bg-[#635bff] text-white shadow-lg"
                    : "bg-white/60 text-[#3a4043] hover:bg-white/80"
                }`}
              >
                Neurodivergent Talent
              </button>
              <button
                onClick={() => setActiveTab("jobCoach")}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  activeTab === "jobCoach"
                    ? "bg-[#635bff] text-white shadow-lg"
                    : "bg-white/60 text-[#3a4043] hover:bg-white/80"
                }`}
              >
                Job Coach
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "employer" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Access a Diverse Talent Pool */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">A</span>ccess a Diverse Talent Pool
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Our AI matching technology connects you with the right skilled neurodivergent professionals who bring unique perspectives,
                      exceptional focus, and innovative problem-solving abilities.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2: Brand Yourself as a Sustainable Employer */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">B</span>rand Yourself as a Sustainable Employer
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Commit to ESG values and CSR that enhance your corporate reputation as a leader in diversity and inclusion by using our platform to hire and support neurodivergent talent.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 3: Cut Headcount Cost */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">C</span>ut Cost Through Double Tax Relief
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Enjoy Double Tax Deduction when hiring OKU cardholders. For every minimum wage hire at RM1,700 per month, the Malaysian company can save at least RM4,896 annually.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "employee" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Access Support & Resources */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                 <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                   <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                 </div>
                 <CardContent className="p-0">
                   <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">A</span>ccess Support & Resources
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                     Get access to supportive resources including upskilling online courses, AI job coaching, AI mock interviews, and tools designed to help you succeed in getting hired.
                   </p>
                  </CardContent>
               </Card>
               
                {/* Card 2: Find Your Perfect Role */}
                  <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                   <CardContent className="p-0">
                      <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                       <span className="text-3xl">B</span>e Yourself to Find the Perfect Career
                      </h4>
                      <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                       Showcase your neurodivergent strengths, personality, communication style, and accommodations needed to find a fulfilling career - no masking.
                       </p>
                    </CardContent>
                  </Card>

               {/* Card 3: Connect with Job Coaches */}
               <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                   </svg>
                  </div>
                 <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                     <span className="text-3xl">C</span>onnect with Job Coaches
                    </h4>
                   <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Work with experienced job coaches who understand your strengths and needs to help you customize your accommodation approach so you can thrive in your career.
                    </p>
                  </CardContent>
                </Card>
             </div>
            )}

            {activeTab === "jobCoach" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Card 1: Expand Your Reach */}
               <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">A</span>ccess to Regional Network
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Connect with neurodivergent professionals and make a bigger impact - whether helping them secure job placements or venture into entrepreneurship.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 2: Powerful Management Tools */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                      <span className="text-3xl">B</span>e Empowered by AI Management Tools
                    </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                     Manage employer and talent relationships, assign tasks, certify accommodating employers, track progress, and streamline your coaching workflow all on one platform.
                    </p>
                  </CardContent>
                </Card>

                {/* Card 3: Collaborate with Employers */}
                <Card className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-[#f0eef5] shadow-lg overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#635bff] to-[#9a96ff] flex items-center justify-center -mx-8 -mt-8 mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <CardContent className="p-0">
                    <h4 className="text-lg font-bold text-[#3a4043] mb-3 text-center">
                     <span className="text-3xl">C</span>ollaborate with Employers
                   </h4>
                    <p className="text-[#3a4043] text-sm leading-relaxed text-center">
                      Partner with inclusive employers to create accommodating workplace environments and provide training on neurodiversity acceptance and workplace integration.
                    </p>
                  </CardContent>
               </Card>
              </div>
            )}
          </div>

          {/* ========== BELOW: Existing Sections (Unchanged Layout) ========== */}
          <div className="mt-10">
            <h2 className="text-4xl md:text-4xl text-white font-bold text-center mb-8">
               Inclusive Careers For You.
            </h2>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentJobIndex * 100}%)` }}
              >
                {[0, 1].map((slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      ].slice(slideIndex * 4, (slideIndex + 1) * 4).map((job, index) => (
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
                  </div>
                ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCurrentJobIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentJobIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
              >
                <svg className="w-6 h-6 text-[#635bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentJobIndex((prev) => Math.min(1, prev + 1))}
                disabled={currentJobIndex === 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
              >
                <svg className="w-6 h-6 text-[#635bff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(2)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentJobIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentJobIndex
                        ? "bg-[#635bff] w-8"
                        : "bg-white/50 hover:bg-white/75"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
          </div>
          </div>

          <div className="mt-10">
            <h2 className="text-4xl md:text-4xl my-10 text-white font-bold text-center">
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
                    "Ph.D. in Occupational Psychology, ICF Certified Coach.",
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