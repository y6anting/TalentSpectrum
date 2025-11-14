"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Search, MapPin, Clock, Briefcase, DollarSign, Shield, Heart, Building, SortAsc, Bookmark, Share, Eye, ChevronDown, ChevronUp, CheckCircle, BrainCircuit, House } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const SALARY_RANGES = [
  "Below RM 3,000",
  "RM 3,000 - RM 5,000",
  "RM 5,001 - RM 8,000",
  "RM 8,001 - RM 12,000",
  "RM 12,001 - RM 18,000",
  "RM 18,001 - RM 25,000",
  "Above RM 25,000",
];

interface SavedJob {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  salaryRange?: number; // Index for SALARY_RANGES array
  type?: string;
  jobType?: string;
  isInclusive?: boolean;
  hasAccommodations?: boolean;
  primaryMatchScore?: number;
  secondaryMatchScore?: number;
  tertiaryMatchScore?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  accommodations?: string[]; // Accommodations offered
  companySize?: string;
  postedDate?: string;
  applicationDeadline?: string;
  industry?: string;
  isApplied?: boolean; // Track if job is already applied
}

interface SavedJobsPageProps {
  savedJobs: SavedJob[];
  savedJobsSearchTerm: string;
  setSavedJobsSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  savedJobsSortBy: string;
  setSavedJobsSortBy: React.Dispatch<React.SetStateAction<string>>;
  selectedSavedJob: SavedJob | null;
  setSelectedSavedJob: React.Dispatch<React.SetStateAction<SavedJob | null>>;
  getMatchScoreColor: (score: number) => string;
}

export default function SavedJobsPage({
  savedJobs,
  savedJobsSearchTerm,
  setSavedJobsSearchTerm,
  savedJobsSortBy,
  setSavedJobsSortBy,
  selectedSavedJob,
  setSelectedSavedJob,
  getMatchScoreColor,
}: SavedJobsPageProps) {
  const [expandedMatchingScore, setExpandedMatchingScore] = useState<number | null>(null);

  const filteredJobs = savedJobs.filter(job => 
    !savedJobsSearchTerm || 
    job.jobTitle.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(savedJobsSearchTerm.toLowerCase())
  ).sort((a, b) => {
    if (savedJobsSortBy === "match") {
      const aScore = ((a.primaryMatchScore || 96) + (a.secondaryMatchScore || 90) + (a.tertiaryMatchScore || 85)) / 3;
      const bScore = ((b.primaryMatchScore || 96) + (b.secondaryMatchScore || 90) + (b.tertiaryMatchScore || 85)) / 3;
      return bScore - aScore;
    } else if (savedJobsSortBy === "company") {
      return a.company.localeCompare(b.company);
    } else if (savedJobsSortBy === "salary") {
      // Basic salary comparison (you can enhance this)
      return (b.salary || "").localeCompare(a.salary || "");
    }
    return 0; // recent (default order)
  });

  const getOverallMatchScore = (job: SavedJob) => {
    return Math.round(
      ((job.primaryMatchScore || 96) +
        (job.secondaryMatchScore || 90) +
        (job.tertiaryMatchScore || 85)) / 3
    );
  };

  const formatSalary = (job: SavedJob) => {
    if (job.salaryRange !== undefined && SALARY_RANGES[job.salaryRange]) {
      return SALARY_RANGES[job.salaryRange];
    }
    return job.salary || "Not specified";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="mb-3 sticky top-22 z-10">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Search */}
            <div className="flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
                  value={savedJobsSearchTerm}
                  onChange={(e) => setSavedJobsSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="w-42">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                  <SelectItem value="Petaling Jaya">Petaling Jaya</SelectItem>
                  <SelectItem value="George Town">George Town</SelectItem>
                  <SelectItem value="Johor Bahru">Johor Bahru</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                </SelectContent>
              </Select>

              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="w-42">
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

              <Select value={savedJobsSortBy} onValueChange={setSavedJobsSortBy}>
                <SelectTrigger className="w-42">
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
      <div className="mb-6 ml-2">
        <p className="text-[#6f7a80] text-sm">
          Showing {filteredJobs.length} of {savedJobs.length} jobs
        </p>
      </div>

      {/* Main Content */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {/* Left Side - Job List */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-4">
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#c5c4d4] scrollbar-track-transparent overflow-visible">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedSavedJob?.id === job.id 
                        ? "ring-2 ring-[#635bff] bg-[#635bff]/5" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedSavedJob(job)}
                  >
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 h-full">
                        {/* LEFT CONTENT */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-[#3a4043] truncate">{job.jobTitle}</h3>
                            <Badge className={`${getMatchScoreColor(getOverallMatchScore(job))} bg-opacity-10`}>
                              {getOverallMatchScore(job)}% match
                            </Badge>
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
                              {job.type || job.jobType || "Full-time"}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryRange !== undefined && SALARY_RANGES[job.salaryRange] ? SALARY_RANGES[job.salaryRange] : formatSalary(job)}
                            </span>
                          </div>

                          <p className="text-[#6f7a80] text-sm mb-3 line-clamp-3 overflow-hidden">
                            {job.description || "View details for job description"}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                            <span>Posted: {job.postedDate || "Recent"}</span>
                            {job.applicationDeadline && <span>Deadline: {job.applicationDeadline}</span>}
                          </div>
                        </div>

                        {/* RIGHT BUTTON */}
                        <div className="flex flex-col gap-2 sm:self-start shrink-0">
                          <button
                            className="p-2 rounded-md transition-colors text-red-500 hover:bg-red-50 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Handle unsave
                            }}
                          >
                            <Heart className="h-5 w-5 fill-red-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Job Details */}
          <div className="lg:col-span-1 xl:col-span-3">
            {selectedSavedJob ? (
              <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                        {selectedSavedJob.jobTitle}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {selectedSavedJob.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedSavedJob.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedSavedJob.type || selectedSavedJob.jobType || "Full-time"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(selectedSavedJob)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Badge className={`${getMatchScoreColor(getOverallMatchScore(selectedSavedJob))} bg-opacity-10 text-lg px-4 py-2`}>
                        {getOverallMatchScore(selectedSavedJob)}% match
                      </Badge>
                      <button
                        className="p-2 rounded-md transition-colors text-red-500 hover:bg-red-50 cursor-pointer"
                        onClick={() => {
                          // TODO: Handle unsave
                        }}
                      >
                        <Heart className="w-5 h-5 fill-red-500" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Job Description */}
                  <div>
                    <h4 className="font-semibold text-[#3a4043] mb-3">Job Description</h4>
                    <p className="text-[#6f7a80] break-words leading-relaxed whitespace-pre-line">{selectedSavedJob.description || "No description available."}</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSavedJob.requirements && selectedSavedJob.requirements.length > 0 ? (
                        selectedSavedJob.requirements.map((req, reqIndex) => (
                          <Badge key={reqIndex} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-[#6f7a80]">No specific requirements listed.</p>
                      )}
                    </div>
                  </div>

                  {/* Accommodations Offered */}
                  <div>
                    <h4 className="font-semibold text-[#3a4043] mb-3">Accommodations Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSavedJob.accommodations && selectedSavedJob.accommodations.length > 0 ? (
                        selectedSavedJob.accommodations.map((accommodation, accommodationIndex) => (
                          <Badge key={accommodationIndex} variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50">
                            {accommodation}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-[#6f7a80]">No specific accommodations listed.</p>
                      )}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h4 className="font-semibold text-[#3a4043] mb-3">Company Information</h4>
                    <div className="space-y-2 text-sm text-[#6f7a80]">
                      <div className="flex justify-between">
                        <span>Industry:</span>
                        <span>{selectedSavedJob.industry || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Company Size:</span>
                        <span>{selectedSavedJob.companySize || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Posted:</span>
                        <span>{selectedSavedJob.postedDate || "Recently"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Application Deadline:</span>
                        <span>{selectedSavedJob.applicationDeadline || "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Matching Score - Expandable */}
                  <div className="pt-4 border-t border-[#e8e6f0]">
                    <button
                      onClick={() => setExpandedMatchingScore(expandedMatchingScore === selectedSavedJob.id ? null : selectedSavedJob.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-[#635BFF]">View Matching Detail</span>
                      {expandedMatchingScore === selectedSavedJob.id ? (
                        <ChevronUp className="h-5 w-5 text-[#6f7a80]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#6f7a80]" />
                      )}
                    </button>
                    {expandedMatchingScore === selectedSavedJob.id && (() => {
                      const primaryMatchScore = selectedSavedJob.primaryMatchScore || 96;
                      const secondaryMatchScore = selectedSavedJob.secondaryMatchScore || 90;
                      const tertiaryMatchScore = selectedSavedJob.tertiaryMatchScore || 85;
                      const overallMatchScore = getOverallMatchScore(selectedSavedJob);

                      return (
                        <div className="mt-4 space-y-6">
                          {/* Overall Match Score */}
                          <div className="text-center py-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Overall Match</p>
                            <div className="text-6xl font-bold text-[#635bff] mb-2">
                              {overallMatchScore}%
                            </div>
                          </div>

                          {/* Primary Match: Experience, Skill & Education */}
                          <Card className="border-2 border-green-200">
                            <CardHeader className="bg-green-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">Primary Match: <br />Experience, Skill & Education</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Strong alignment with required technical skills
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-green-600">{primaryMatchScore}%</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Matched Skills
                                  </h4>
                                  <div className="flex flex-wrap gap-2 ml-6">
                                    {["Python", "Machine Learning", "NLP", "Data Analysis"].map((skill) => (
                                      <Badge key={skill} className="bg-green-100 text-green-800 border-green-300">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-yellow-600">⚠</span>
                                    Consider
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    Cloud Computing (minor gap)
                                  </p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-blue-600">💡</span>
                                    AI Recommendation
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    Candidate possesses core technical competencies. Consider a short technical assessment for cloud skills.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Secondary Match: Environmental Fit */}
                          <Card className="border-2 border-purple-200">
                            <CardHeader className="bg-purple-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <House className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">Secondary Match: <br /> Environmental Fit</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Excellent fit for remote work and preference for written communication
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-purple-600">{secondaryMatchScore}%</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-[#3a4043] mb-3">Matched Preferences</h4>
                                  <div className="space-y-2 ml-6">
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                                      <span className="text-sm text-gray-700">Remote work experience</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                                      <span className="text-sm text-gray-700">Preference for written communication</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                                      <span className="text-sm text-gray-700">Flexible hours</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-orange-600">📋</span>
                                    Consider
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    Prefers independent work; team style might need slight adjustment
                                  </p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-blue-600">💡</span>
                                    AI Recommendation
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    The candidate&apos;s environmental preferences align well with the remote-first culture. Ensure clear written instructions are standard.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Tertiary Match: Other Factors */}
                          <Card className="border-2 border-blue-200">
                            <CardHeader className="bg-blue-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">Tertiary Match: <br /> Other Factors</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Good alignment with company&apos;s focus on detail-oriented problem solving
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-blue-600">{tertiaryMatchScore}%</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-[#3a4043] mb-3">Matched Factors</h4>
                                  <div className="space-y-2 ml-6">
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                      <span className="text-sm text-gray-700">
                                        <strong>Location:</strong> Remote preference matches job offering
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                      <span className="text-sm text-gray-700">
                                        <strong>Neurodivergent Strengths:</strong> Detail-Oriented, Systematic Thinking
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-yellow-600">⚠</span>
                                    Consider
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    Presentation comfort is lower; may need support for client-facing roles
                                  </p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <h4 className="font-semibold text-[#3a4043] mb-2 flex items-center gap-2 text-sm">
                                    <span className="text-blue-600">💡</span>
                                    AI Recommendation
                                  </h4>
                                  <p className="text-sm text-gray-700 ml-6">
                                    Candidate&apos;s preference for detail and systematic thinking is a strong asset. Provide coaching or alternative presentation methods if required.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-[#e8e6f0]">
                    <Button 
                      className={`w-full ${
                        selectedSavedJob.isApplied
                          ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white"
                          : "bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                      }`}
                      disabled={selectedSavedJob.isApplied}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      {selectedSavedJob.isApplied ? "Applied" : "Apply Now"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No job selected</h3>
                  <p className="text-sm text-gray-500">
                    Click on a job from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {savedJobs.length === 0 ? "No saved jobs yet" : "No jobs found"}
            </h3>
            <p className="text-sm text-gray-500">
              {savedJobs.length === 0 
                ? "Browse jobs and save them for later!" 
                : "Try adjusting your search or filters to find more opportunities."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
