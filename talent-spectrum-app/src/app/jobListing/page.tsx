"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/app/components/jobCard";
import { Button } from "@/app/components/button";
import { Search, Filter, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import gsap from "gsap"

const jobs = [
   {
    id: "1",
    title: "UX Designer",
    company: "Google",
    location: "Hybrid",
    type: "Full-time",
    salary: "RM65k - 85k / annum",
    logo: "/Google_Logo.png",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description: "Join Google's design team to create accessible user experiences.",
    posted: "1 day ago",
  },
  {
    id: "2",
    title: "Consultant",
    company: "PwC",
    location: "Remote",
    type: "Full-time",
    salary: "RM80k - 110k / annum",
    logo: "/PwC_Logo.png",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description: "Consult on neurodivergent inclusion and workplace adaptation strategies.",
    posted: "3 days ago",
  },
  {
    id: "3",
    title: "Developer",
    company: "Gamuda",
    location: "Remote",
    type: "Full-time",
    salary: "RM70k - 90k / annum",
    logo: "/Gamuda_Logo.png",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description: "Develop innovative software for sustainable infrastructure projects.",
    posted: "2 days ago",
  },
  {
    id: "4",
    title: "Data Analyst",
    company: "SLB",
    location: "Part-time",
    type: "Part-time",
    salary: "RM40k - 55k / annum",
    logo: "/SLB_Logo.png",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description: "Analyze datasets to improve energy efficiency and inclusivity.",
    posted: "5 days ago",
  },
  {
    id: "5",
    title: "Frontend Developer",
    company: "NeuroTech",
    location: "Remote",
    type: "Full-time",
    salary: "RM70k - 90k / annum",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "We are looking for a frontend developer with strong React and Tailwind skills to join our inclusive team.",
    posted: "2 days ago",
  },
  {
    id: "6",
    title: "Data Analyst",
    company: "InclusionWorks",
    location: "Singapore",
    type: "Part-time",
    salary: "RM40k - RM55k / annum",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: false,
    isInclusive: true,
    description:
      "Analyze workforce data and help companies make inclusive, data-driven decisions.",
    posted: "5 days ago",
  },
  {
    id: "7",
    title: "UX Designer",
    company: "DesignForward",
    location: "Hybrid",
    type: "Full-time",
    salary: "RM65k - RM85k / annum",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "Create inclusive and accessible user experiences for neurodivergent users.",
    posted: "1 week ago",
  },
  {
    id: "8",
    title: "Software Engineer",
    company: "TechInclusive",
    location: "Remote",
    type: "Full-time",
    salary: "RM80k - RM110k / annum",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "Build scalable software solutions in a neurodivergent-friendly environment.",
    posted: "3 days ago",
  },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const jobsGridRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const url = q ? `/jobListing?query=${encodeURIComponent(q)}` : "/jobListing";
    router.push(url);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filters = [
    { id: "remote", label: "Remote" },
    { id: "flexible", label: "Flexible Hours" },
    { id: "accommodations", label: "Accommodations Available" },
    { id: "inclusive", label: "Neurodivergent Friendly" },
    { id: "fulltime", label: "Full-time" },
    { id: "parttime", label: "Part-time" },
  ];

  const filteredJobs = jobs.filter(job => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (selectedFilters.includes("remote") && !job.isRemote) return false;
    if (selectedFilters.includes("flexible") && !job.isFlexible) return false;
    if (selectedFilters.includes("accommodations") && !job.hasAccommodations) return false;
    if (selectedFilters.includes("inclusive") && !job.isInclusive) return false;
    if (selectedFilters.includes("fulltime") && job.type !== "Full-time") return false;
    if (selectedFilters.includes("parttime") && job.type !== "Part-time") return false;

    return true;
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || !jobsGridRef.current) return;

    const jobCards = jobsGridRef.current.querySelectorAll('.job-card-item');
    
    gsap.fromTo(jobCards, 
      {
        opacity: 0,
        y: 20,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out'
      }
    );
  }, [filteredJobs, viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-700">Find Your Perfect Job</h1>
          <p className="text-xl text-[#6f7a80] max-w-3xl mx-auto">
            Discover opportunities with neurodivergent-friendly employers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, companies, or skills..."
                className="w-full px-6 py-4 pr-12 text-lg border border-gray-300 rounded-xl  focus:ring-[#635bff] focus:border-[#635bff] outline-none transition-all text-[#3a4043] bg-white shadow-md"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#635bff] hover:bg-[#635bff] text-white p-2 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilters.includes(filter.id)
                    ? "bg-[#635bff] text-white"
                    : "bg-white/60 border border-[#e8e6f0] rounded-full text-sm text-[#635bff] hover:bg-[#635bff] hover:text-white transition-colors"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-[#3a4043]">
            <span className="font-semibold">{filteredJobs.length}</span> neurodivergent-friendly jobs found
          </p>

          {/* View Toggle */}
          <div className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-1 rounded-lg w-fit shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all ${
                viewMode === "list"
                ? "bg-[#635bff] text-white shadow-md px-4 py-2 rounded-lg transition-all duration-200"
                : "text-gray-600 px-4 py-2 rounded-lg hover:bg-[#635bff]/15 hover:text-[#635bff] transition-all duration-200"

              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">List</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all ${
                viewMode === "grid"
                ? "bg-[#635bff] text-white shadow-md px-4 py-2 rounded-lg transition-all duration-200"
                : "text-gray-600 px-4 py-2 rounded-lg hover:bg-[#635bff]/15 hover:text-[#635bff] transition-all duration-200"

              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Grid</span>
            </button>
          </div>

        </div>

        {/* Job Cards */}
        <div
          ref={jobsGridRef}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card-item">
              <JobCard job={job} onJobClick={handleJobClick} viewMode={viewMode} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No jobs found matching your criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilters([]);
              }}
              variant="outline"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 bg-white rounded-xl p-8 shadow-lg border border-[#e8e6f0]">
          <h2 className="text-2xl font-bold text-[#3a4043] mb-4">
            Don't see the perfect job yet?
          </h2>
          <p className="text-[#3a4043] mb-6">
            Create your profile and let neurodivergent-friendly employers find you. 
            Set up job alerts to be notified of new opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button
                className="rounded-full bg-[#635bff] hover:bg-[#5148e5] text-white font-semibold px-6 py-2 shadow-md transition-all duration-200"
              >
                Create Profile
              </Button>
            </Link>

            <Button
              variant="outline"
              className="rounded-full text-[#635bff] hover:bg-[#635bff]/80 hover:text-white font-semibold px-6 py-2 transition-all duration-200"
            >
              Set Up Job Alerts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}