"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Search, MapPin, Clock, Briefcase, DollarSign, Shield, Heart, Building, SortAsc, Bookmark, Share, Eye, ChevronDown, ChevronUp, CheckCircle, BrainCircuit, House } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

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
  job_id?: number; // Backend job ID
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
  matchScore?: number;
  accommodationsFriendly?: boolean;
  status?: string; // Job status (active, closed, expired)
  work_mode?: string; // Work mode (Remote, Hybrid, On-site)
}

interface SavedJobsPageProps {
  savedJobs: SavedJob[];
  setSavedJobs: React.Dispatch<React.SetStateAction<SavedJob[]>>;
  savedJobsSearchTerm: string;
  setSavedJobsSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  savedJobsFilterLocation?: string;
  setSavedJobsFilterLocation?: React.Dispatch<React.SetStateAction<string>>;
  savedJobsFilterType?: string;
  setSavedJobsFilterType?: React.Dispatch<React.SetStateAction<string>>;
  savedJobsSortBy: string;
  setSavedJobsSortBy: React.Dispatch<React.SetStateAction<string>>;
  selectedSavedJob: SavedJob | null;
  setSelectedSavedJob: React.Dispatch<React.SetStateAction<SavedJob | null>>;
  getMatchScoreColor: (score: number) => string;
  handleSaveJob: (job: SavedJob) => Promise<void>;
  savedJobKeys: Set<string>;
  savingJobId: string | null;
  appliedJobs: Set<string>;
  applyingJobId: string | null;
  handleApplyToJob: (job: SavedJob) => Promise<void>;
  savedJobsLoaded?: boolean;
}

export default function SavedJobsPage({
  savedJobs,
  setSavedJobs,
  savedJobsSearchTerm,
  setSavedJobsSearchTerm,
  savedJobsFilterLocation,
  setSavedJobsFilterLocation,
  savedJobsFilterType,
  setSavedJobsFilterType,
  savedJobsSortBy,
  setSavedJobsSortBy,
  selectedSavedJob,
  setSelectedSavedJob,
  getMatchScoreColor,
  handleSaveJob,
  savedJobKeys,
  savingJobId,
  appliedJobs,
  applyingJobId,
  handleApplyToJob,
  savedJobsLoaded = false,
}: SavedJobsPageProps) {
  const [expandedMatchingScore, setExpandedMatchingScore] = useState<number | null>(null);
  const { data: session } = useSession();
  const { success, error: showError, info } = useToastHelpers();

  // Listen for save/unsave events from other tabs (Browse Jobs, Applications)
  useEffect(() => {
    const handleJobSaved = (event: CustomEvent) => {
      const { id, jobTitle, company, location, jobType, salary } = event.detail;
      const jobKey = `${jobTitle}-${company}`;
      
      // Check if this job is already in saved jobs
      const alreadySaved = savedJobs.some(job => 
        `${job.jobTitle}-${job.company}` === jobKey
      );
      
      if (!alreadySaved) {
        const newJob: SavedJob = {
          id,
          job_id: id,
          jobTitle,
          company,
          location: location || '',
          salary: salary || '',
          type: jobType || '',
        };
        setSavedJobs(prev => [newJob, ...prev]);
      }
    };

    const handleJobUnsaved = (event: CustomEvent) => {
      const { jobTitle, company } = event.detail;
      const jobKey = `${jobTitle}-${company}`;
      
      setSavedJobs(prev => prev.filter(job => 
        `${job.jobTitle}-${job.company}` !== jobKey
      ));
      
      // If currently selected job was unsaved, select another
      if (selectedSavedJob && `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}` === jobKey) {
        const remaining = savedJobs.filter(job => 
          `${job.jobTitle}-${job.company}` !== jobKey
        );
        setSelectedSavedJob(remaining.length > 0 ? remaining[0] : null);
      }
    };

    const handleJobApplied = (event: CustomEvent) => {
      const { jobTitle, company } = event.detail;
      const jobKey = `${jobTitle}-${company}`;
      
      // Mark job as applied in saved jobs list
      setSavedJobs(prev => prev.map(job => {
        if (`${job.jobTitle}-${job.company}` === jobKey) {
          return { ...job, isApplied: true };
        }
        return job;
      }));
      
      // Update selected job if it was applied
      if (selectedSavedJob && `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}` === jobKey) {
        setSelectedSavedJob({ ...selectedSavedJob, isApplied: true });
      }
    };

    const handleJobStatusChanged = (event: CustomEvent) => {
      const { jobTitle, company, status } = event.detail;
      const jobKey = `${jobTitle}-${company}`;
      
      // Update job status in saved jobs list
      setSavedJobs(prev => prev.map(job => {
        if (`${job.jobTitle}-${job.company}` === jobKey) {
          return { ...job, status };
        }
        return job;
      }));
      
      // Update selected job if status changed
      if (selectedSavedJob && `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}` === jobKey) {
        setSelectedSavedJob({ ...selectedSavedJob, status });
      }
    };

    window.addEventListener('jobSaved', handleJobSaved as EventListener);
    window.addEventListener('jobUnsaved', handleJobUnsaved as EventListener);
    window.addEventListener('jobApplied', handleJobApplied as EventListener);
    window.addEventListener('jobStatusChanged', handleJobStatusChanged as EventListener);

    return () => {
      window.removeEventListener('jobSaved', handleJobSaved as EventListener);
      window.removeEventListener('jobUnsaved', handleJobUnsaved as EventListener);
      window.removeEventListener('jobApplied', handleJobApplied as EventListener);
      window.removeEventListener('jobStatusChanged', handleJobStatusChanged as EventListener);
    };
  }, [savedJobs, selectedSavedJob, setSelectedSavedJob, setSavedJobs]);

  // Default values if not provided via props
  const filterLocation = savedJobsFilterLocation || "all";
  const filterType = savedJobsFilterType || "all";
  const setFilterLocation = setSavedJobsFilterLocation || (() => {}); // Default no-op
  const setFilterType = setSavedJobsFilterType || (() => {}); // Default no-op

  const filteredJobs = savedJobs
    .filter((job) => {
      const matchesSearch = job.jobTitle.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                           (job.description || "").toLowerCase().includes(savedJobsSearchTerm.toLowerCase());
      
      // Location filter: check both location field and work_mode for Remote/Hybrid
      let matchesLocation = true;
      if (filterLocation !== "all") {
        if (filterLocation === "Remote") {
          matchesLocation = job.location.toLowerCase().includes("remote") || 
                          job.work_mode?.toLowerCase() === "remote";
        } else if (filterLocation === "Hybrid") {
          matchesLocation = job.location.toLowerCase().includes("hybrid") || 
                          job.work_mode?.toLowerCase() === "hybrid";
        } else {
          matchesLocation = job.location.includes(filterLocation);
        }
      }
      
      // Work type filter: check both type field and work_mode for Remote
      // Make comparison case-insensitive
      let matchesType = true;
      if (filterType !== "all") {
        const jobTypeLower = job.type?.toLowerCase() || '';
        const filterTypeLower = filterType.toLowerCase();
        
        if (filterTypeLower === "remote") {
          matchesType = jobTypeLower.includes("remote") || 
                      job.work_mode?.toLowerCase() === "remote";
        } else {
          // Case-insensitive comparison for other types
          matchesType = jobTypeLower === filterTypeLower || 
                      jobTypeLower.includes(filterTypeLower) ||
                      job.work_mode?.toLowerCase() === filterTypeLower;
        }
      }
      
      return matchesSearch && matchesLocation && matchesType;
    })
    .sort((a, b) => {
      // Handle sortBy filter
      if (savedJobsSortBy === "match") {
        const aScore = ((a.primaryMatchScore || 96) + (a.secondaryMatchScore || 90) + (a.tertiaryMatchScore || 85)) / 3;
        const bScore = ((b.primaryMatchScore || 96) + (b.secondaryMatchScore || 90) + (b.tertiaryMatchScore || 85)) / 3;
        return bScore - aScore;
      } else if (savedJobsSortBy === "salary") {
        return (b.salaryRange || 0) - (a.salaryRange || 0);
      } else if (savedJobsSortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      // Default: recent (sort by postedDate, most recent first)
      const aDate = a.postedDate ? new Date(a.postedDate).getTime() : 0;
      const bDate = b.postedDate ? new Date(b.postedDate).getTime() : 0;
      
      // Most recent first (descending order)
      return bDate - aDate;
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

  // Loading state - show loading if savedJobs array is empty and we're expecting data
  // const isLoading = savedJobs.length === 0 && savedJobsSearchTerm === "";

  // if (isLoading) {
  //   return (
  //     <div className="w-full flex items-center justify-center py-12">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
  //         <p className="text-[#6f7a80]">Loading saved jobs...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-fit cursor-pointer">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All Locations</SelectItem>
                  <SelectItem value="Kuala Lumpur" className="cursor-pointer">Kuala Lumpur</SelectItem>
                  <SelectItem value="Petaling Jaya" className="cursor-pointer">Petaling Jaya</SelectItem>
                  <SelectItem value="George Town" className="cursor-pointer">George Town</SelectItem>
                  <SelectItem value="Johor Bahru" className="cursor-pointer">Johor Bahru</SelectItem>
                  <SelectItem value="Remote" className="cursor-pointer">Remote</SelectItem>
                  <SelectItem value="Hybrid" className="cursor-pointer">Hybrid</SelectItem>
                  <SelectItem value="Malaysia" className="cursor-pointer">Malaysia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-fit cursor-pointer">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                  <SelectItem value="Full-time" className="cursor-pointer">Full-time</SelectItem>
                  <SelectItem value="Part-time" className="cursor-pointer">Part-time</SelectItem>
                  <SelectItem value="Contract" className="cursor-pointer">Contract</SelectItem>
                  <SelectItem value="Remote" className="cursor-pointer">Remote</SelectItem>
                </SelectContent>
              </Select>

              <Select value={savedJobsSortBy} onValueChange={setSavedJobsSortBy}>
                <SelectTrigger className="w-fit cursor-pointer">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent" className="cursor-pointer">Most Recent</SelectItem>
                  <SelectItem value="match" className="cursor-pointer">Best Match</SelectItem>
                  <SelectItem value="salary" className="cursor-pointer">Highest Salary</SelectItem>
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
                            {job.description}
                          </p>

                          {(job.postedDate || job.applicationDeadline) && (
                            <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                              {job.postedDate && <span>Posted: {job.postedDate}</span>}
                              {job.applicationDeadline && <span>Deadline: {job.applicationDeadline}</span>}
                            </div>
                          )}
                        </div>

                        {/* RIGHT BUTTONS AND HEART */}
                        <div className="flex flex-col justify-between items-end gap-2 sm:self-start shrink-0">
                          <Button
                            size="sm"
                            className={`w-full sm:w-auto ${
                              appliedJobs.has(`${job.jobTitle}-${job.company}`) ||
                              job.status === 'closed' ||
                              (job.applicationDeadline && new Date(job.applicationDeadline) < new Date())
                              ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white cursor-not-allowed"
                              : "bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
                            }`}
                            disabled={
                              applyingJobId === `${job.jobTitle}-${job.company}` || 
                              appliedJobs.has(`${job.jobTitle}-${job.company}`) ||
                              job.status === 'closed' ||
                              !!(job.applicationDeadline && new Date(job.applicationDeadline) < new Date())
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyToJob(job);
                            }}
                          >
                            {applyingJobId === `${job.jobTitle}-${job.company}` 
                              ? "Applying..." 
                              : appliedJobs.has(`${job.jobTitle}-${job.company}`) 
                                ? "Applied" 
                                : (job.status === 'closed' || (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()))
                                  ? "Closed"
                                  : "Apply"}
                          </Button>
                          <button
                            className={`p-2 rounded-md transition-colors cursor-pointer ${
                              savedJobKeys.has(`${job.jobTitle}-${job.company}`)
                                ? "text-red-500 hover:bg-red-50"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                            disabled={savingJobId === `${job.jobTitle}-${job.company}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job);
                            }}
                          >
                            <Heart className={`h-5 w-5 ${savedJobKeys.has(`${job.jobTitle}-${job.company}`) ? 'fill-red-500' : ''}`} />
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
                        disabled={savingJobId === `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}`}
                        onClick={() => handleSaveJob(selectedSavedJob)}
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
                  <div className="flex gap-3 pt-4 border-t border-[#e8e6f0]">
                    <Button 
                      className={`flex-1 ${
                        selectedSavedJob.isApplied || 
                        appliedJobs.has(`${selectedSavedJob.jobTitle}-${selectedSavedJob.company}`) ||
                        selectedSavedJob.status === 'closed' ||
                        (selectedSavedJob.applicationDeadline && new Date(selectedSavedJob.applicationDeadline) < new Date())
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#635bff] hover:bg-[#524aff] cursor-pointer"
                      } text-white`}
                      disabled={
                        !!selectedSavedJob.isApplied || 
                        appliedJobs.has(`${selectedSavedJob.jobTitle}-${selectedSavedJob.company}`) || 
                        applyingJobId === `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}` ||
                        selectedSavedJob.status === 'closed' ||
                        !!(selectedSavedJob.applicationDeadline && new Date(selectedSavedJob.applicationDeadline) < new Date())
                      }
                      onClick={() => handleApplyToJob(selectedSavedJob)}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      {applyingJobId === `${selectedSavedJob.jobTitle}-${selectedSavedJob.company}` 
                        ? "Applying..." 
                        : (selectedSavedJob.isApplied || appliedJobs.has(`${selectedSavedJob.jobTitle}-${selectedSavedJob.company}`)) 
                          ? "Applied" 
                          : (selectedSavedJob.status === 'closed' || (selectedSavedJob.applicationDeadline && new Date(selectedSavedJob.applicationDeadline) < new Date()))
                            ? "Closed"
                            : "Apply Now"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
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
