"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JobCard from "@/app/components/jobCard";
import { Button } from "@/app/components/button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const jobs = [
  {
    id: "1",
    title: "Developer",
    company: "Gamuda",
    location: "Remote",
    type: "Full-time",
    salary: "$70k - $90k",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "We are looking for a frontend developer with strong React and Tailwind skills to join our inclusive team.",
    posted: "2 days ago",
  },
  {
    id: "2",
    title: "Data Analyst",
    company: "SLB",
    location: "Damansara",
    type: "Part-time",
    salary: "$40k - $55k",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: false,
    isInclusive: true,
    description:
      "Analyze workforce data and help companies make inclusive, data-driven decisions.",
    posted: "5 days ago",
  },
  {
    id: "3",
    title: "UX Designer",
    company: "Google",
    location: "Hybrid",
    type: "Full-time",
    salary: "$65k - $85k",
    isRemote: false,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "Create inclusive and accessible user experiences for neurodivergent users.",
    posted: "1 week ago",
  },
  {
    id: "4",
    title: "Consultant",
    company: "PwC",
    location: "Remote",
    type: "Full-time",
    salary: "$80k - $110k",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "Provide consultancy in a neurodivergent-friendly environment.",
    posted: "3 days ago",
  },
];

export default function OpportunitiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
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
    { id: "hybrid", label: "Hybrid" },
    { id: "flexible", label: "Flexible Hours" },
    { id: "mentalhealthsupport", label: "Mental Health Support" },
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

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#6b8a7a] mb-4">🚀 Neurodivergent-Friendly Opportunities</h1>
          <p className="text-xl text-[#3a4043] max-w-3xl mx-auto">
            Discover inclusive job opportunities from companies that celebrate neurodiversity and provide workplace accommodations.
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
                placeholder="Search jobs, inclusive employers, coaches & more..."
                className="w-full px-6 py-4 pr-12 text-lg border border-[#e8e6f0] rounded-xl focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all text-[#3a4043] bg-white shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white p-2 rounded-lg transition-colors"
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
                    ? 'bg-[#6b8a7a] text-white'
                    : 'bg-white border border-[#e8e6f0] text-[#3a4043] hover:bg-[#6b8a7a] hover:text-white'
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobClick={handleJobClick}
              viewMode="grid"
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters to find more opportunities.</p>
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
            Create your profile and let neurodivergent-friendly employers find you. Set up job alerts to be notified of new opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
                Create Profile
              </Button>
            </Link>
            <Button variant="outline">
              Set Up Job Alerts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
