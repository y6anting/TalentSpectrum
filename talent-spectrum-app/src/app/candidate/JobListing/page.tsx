"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Star,
  Heart,
  Filter,
  SortAsc,
  Eye,
  Bookmark,
  Share,
  CheckCircle,
  Shield,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Globe,
  Award,
} from "lucide-react";
import { motion } from "motion/react";
import { jobs } from "./jobData";

export default function CandidateJobListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedJob, setSelectedJob] = useState(jobs[0]); // Default to first job

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "font-bold text-green-600";
    if (score >= 80) return "font-bold text-blue-600";
    if (score >= 70) return "font-bold text-yellow-600";
    return "font-bold text-red-600";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation === "all" || job.location.includes(filterLocation);
    const matchesType = filterType === "all" || job.type === filterType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  // Set default selected job when filtered jobs change
  useEffect(() => {
    if (filteredJobs.length > 0 && !filteredJobs.find(job => job.id === selectedJob.id)) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Job Opportunities</h1>
          <p className="text-[#6f7a80]">
            Discover jobs that match your skills and neurodivergent strengths
          </p>
        </div> */}

        {/* Search and Filters - Sticky at Top */}
        <Card className="mb-3 sticky top-20 z-10">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Search */}
              <div className="flex-1">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-40">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="San Francisco">San Francisco</SelectItem>
                    <SelectItem value="Seattle">Seattle</SelectItem>
                    <SelectItem value="Austin">Austin</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-3">
          <p className="text-[#6f7a80]">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 lg:h-[calc(100vh-300px)]">
          {/* Left Side - Job List */}
          <div className="overflow-y-auto py-2 px-2 lg:h-full scrollbar-thin scrollbar-thumb-[#c5c4d4] scrollbar-track-transparent">
            <div className="space-y-4">
                    {filteredJobs.map((job, index) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card 
                            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                selectedJob.id === job.id 
                                ? "ring-2 ring-[#635bff] bg-[#635bff]/5" 
                                : "hover:shadow-md"
                            }`}
                            onClick={() => setSelectedJob(job)}
                            >
                            <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex flex-col sm:flex-row justify-between gap-4 h-full">
                                {/* LEFT CONTENT */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-[#3a4043] truncate">{job.title}</h3>
                                    <Badge className={`${getMatchScoreColor(job.matchScore)} bg-opacity-10`}>
                                        {job.matchScore}% match
                                    </Badge>
                                    {job.accommodationsFriendly && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Accommodation Friendly
                                        </Badge>
                                    )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6f7a80] mb-3">
                                    <span className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        {job.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {job.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {job.salary}
                                    </span>
                                    </div>

                                    <p className="text-[#6f7a80] text-sm mb-3 line-clamp-2">
                                    {job.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                                    <span>Posted: {job.postedDate}</span>
                                    <span>Deadline: {job.applicationDeadline}</span>
                                    </div>
                                </div>

                                {/* RIGHT BUTTONS */}
                                <div className="flex flex-col gap-2 sm:self-start shrink-0">
                                    <Button
                                    size="sm"
                                    className="bg-[#635bff] hover:bg-[#524aff] text-white w-full sm:w-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle apply
                                    }}
                                    >
                                    Apply
                                    </Button>
                                    <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 w-full sm:w-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle save
                                    }}
                                    >
                                    <Bookmark className="w-3 h-3 mr-1" />
                                    Save
                                    </Button>
                                </div>
                                </div>
                            </CardContent>
                            </Card>

                    </motion.div>
                    ))}

              {/* No Results */}
              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#3a4043] mb-2">No jobs found</h3>
                    <p className="text-[#6f7a80] mb-4">
                      Try adjusting your search criteria or filters to find more opportunities.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setFilterLocation("all");
                        setFilterType("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Side - Job Details */}
          <div className="lg:sticky lg:top-8 lg:self-start">

            <Card className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                      {selectedJob.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {selectedJob.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedJob.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedJob.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {selectedJob.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={`${getMatchScoreColor(selectedJob.matchScore)} bg-opacity-10`}>
                      {selectedJob.matchScore}% match
                    </Badge>
                    {selectedJob.accommodationsFriendly && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Accommodation Friendly
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Job Description */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Job Description</h4>
                  <p className="text-[#6f7a80] leading-relaxed">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requirements.map((req, reqIndex) => (
                      <Badge key={reqIndex} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit, benefitIndex) => (
                      <Badge key={benefitIndex} variant="outline" className="text-xs border-[#635bff]/20 text-[#635bff]">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Company Information</h4>
                  <div className="space-y-2 text-sm text-[#6f7a80]">
                    <div className="flex justify-between">
                      <span>Industry:</span>
                      <span>{selectedJob.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Company Size:</span>
                      <span>{selectedJob.companySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posted:</span>
                      <span>{selectedJob.postedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application Deadline:</span>
                      <span>{selectedJob.applicationDeadline}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-[#e8e6f0]">
                  <Button className="bg-[#635bff] hover:bg-[#524aff] text-white w-full">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Job
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
