"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import {
  Search, MapPin, Clock, Briefcase, DollarSign, Building, Share, Eye, ChevronDown, ChevronUp, CheckCircle, BrainCircuit, House, Heart, SortAsc, FileText, Calendar, X as XIcon, User, Check
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  salaryRange?: number; // Index for SALARY_RANGES array
  employmentType: string;
  type?: string;
  status: string; // Application status (under_review, shortlisted, etc.)
  jobStatus?: string; // Job status (active, closed, expired)
  appliedDate: string;
  accommodationsRequested?: boolean;
  accommodations?: string[]; // Accommodations offered
  primaryMatchScore?: number;
  secondaryMatchScore?: number;
  tertiaryMatchScore?: number;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  companySize?: string;
  deadline?: string;
  postedDate?: string;
  applicationDeadline?: string;
  interviewDate?: string;
  score?: number; // Overall match score
  industry?: string;
  accommodationsFriendly?: boolean;
}

interface ApplicationsPageProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  applicationSearchTerm: string;
  setApplicationSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  applicationFilterStatus: string;
  setApplicationFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  applicationFilterLocation?: string;
  setApplicationFilterLocation?: React.Dispatch<React.SetStateAction<string>>;
  applicationFilterType?: string;
  setApplicationFilterType?: React.Dispatch<React.SetStateAction<string>>;
  applicationSortBy?: string;
  setApplicationSortBy?: React.Dispatch<React.SetStateAction<string>>;
  selectedApplication: Application | null;
  setSelectedApplication: React.Dispatch<React.SetStateAction<Application | null>>;
  showMatchingScoreDialog: boolean;
  setShowMatchingScoreDialog: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string, jobStatus?: string) => React.ReactNode;
  handleSaveJob: (job: Application) => Promise<void>;
  savedJobKeys: Set<string>;
  savingJobId: string | null;
}

export default function ApplicationsPage({
  applications,
  setApplications,
  applicationSearchTerm,
  setApplicationSearchTerm,
  applicationFilterStatus,
  setApplicationFilterStatus,
  applicationFilterLocation,
  setApplicationFilterLocation,
  applicationFilterType,
  setApplicationFilterType,
  applicationSortBy,
  setApplicationSortBy,
  selectedApplication,
  setSelectedApplication,
  showMatchingScoreDialog,
  setShowMatchingScoreDialog,
  getStatusIcon,
  getStatusBadge,
  handleSaveJob,
  savedJobKeys,
  savingJobId,
}: ApplicationsPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();
  const [expandedMatchingScore, setExpandedMatchingScore] = useState<number | null>(null);
  
  // Default values if not provided
  const filterLocation = applicationFilterLocation || "all";
  const filterType = applicationFilterType || "all";
  const sortBy = applicationSortBy || "recent";
  const setFilterLocation = setApplicationFilterLocation || (() => {});
  const setFilterType = setApplicationFilterType || (() => {});
  const setSortBy = setApplicationSortBy || (() => {});

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = !applicationSearchTerm || 
        app.jobTitle.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(applicationSearchTerm.toLowerCase());
      const matchesStatus = applicationFilterStatus === "all" || app.status === applicationFilterStatus;
      
      // Location filter: check both location field and work_mode for Remote/Hybrid
      let matchesLocation = true;
      if (filterLocation !== "all") {
        if (filterLocation === "Remote") {
          matchesLocation = (app.location || "").toLowerCase().includes("remote");
        } else if (filterLocation === "Hybrid") {
          matchesLocation = (app.location || "").toLowerCase().includes("hybrid");
        } else {
          matchesLocation = (app.location || "").includes(filterLocation);
        }
      }
      
      // Work type filter: check both type field and work_mode for Remote
      let matchesType = true;
      if (filterType !== "all") {
        const appTypeLower = (app.type || "").toLowerCase();
        const filterTypeLower = filterType.toLowerCase();
        
        if (filterTypeLower === "remote") {
          matchesType = appTypeLower.includes("remote");
        } else {
          matchesType = appTypeLower === filterTypeLower || appTypeLower.includes(filterTypeLower);
        }
      }
      
      return matchesSearch && matchesStatus && matchesLocation && matchesType;
    })
    .sort((a, b) => {
      // Handle sortBy filter
      if (sortBy === "match") {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === "salary") {
        return (b.salaryRange || 0) - (a.salaryRange || 0);
      }
      // Default: recent (sort by postedDate or appliedDate, most recent first)
      const aDate = a.postedDate ? new Date(a.postedDate).getTime() : (a.appliedDate ? new Date(a.appliedDate).getTime() : 0);
      const bDate = b.postedDate ? new Date(b.postedDate).getTime() : (b.appliedDate ? new Date(b.appliedDate).getTime() : 0);
      return bDate - aDate;
    });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "font-bold text-green-600";
    if (score >= 80) return "font-bold text-blue-600";
    if (score >= 70) return "font-bold text-yellow-600";
    return "font-bold text-red-600";
  };

  const getOverallMatchScore = (app: Application) => {
    if (app.score !== undefined) return app.score;
    return Math.round(
      ((app.primaryMatchScore || 96) +
        (app.secondaryMatchScore || 90) +
        (app.tertiaryMatchScore || 85)) / 3
    );
  };

  const formatSalary = (app: Application) => {
    if (app.salaryRange !== undefined && SALARY_RANGES[app.salaryRange]) {
      return SALARY_RANGES[app.salaryRange];
    }
    return app.salary || "Not specified";
  };

  // Loading state - show loading if applications array is empty and we're expecting data
  const isLoading = applications.length === 0 && applicationSearchTerm === "";

  // if (isLoading) {
  //   return (
  //     <div className="w-full flex items-center justify-center py-12">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
  //         <p className="text-[#6f7a80]">Loading applications...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show empty state if no applications found
  if (applications.length === 0 && !isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Card className="max-w-md border border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#3a4043] mb-2">No Applications Found</h3>
            <p className="text-[#6f7a80] text-sm mb-6">Start applying to jobs to see your applications here.</p>
            <Button
              onClick={() => router.push("/candidate/JobListing")}
              className="bg-[#635bff] hover:bg-[#524aff] text-white"
            >
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
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
                    value={applicationSearchTerm}
                    onChange={(e) => setApplicationSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={applicationFilterStatus} onValueChange={setApplicationFilterStatus}>
                  <SelectTrigger className="w-fit cursor-pointer">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    <SelectItem value="under_review" className="cursor-pointer">Under Review</SelectItem>
                    <SelectItem value="shortlisted" className="cursor-pointer">Shortlisted</SelectItem>
                    <SelectItem value="interview_scheduled" className="cursor-pointer">Interview Scheduled</SelectItem>
                    <SelectItem value="rejected" className="cursor-pointer">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                {/* <Select value={applicationFilterLocation || "all"} onValueChange={setApplicationFilterLocation}>
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
                </Select> */}

                <Select value={applicationFilterType || "all"} onValueChange={setApplicationFilterType}>
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

                <Select value={applicationSortBy || "recent"} onValueChange={setApplicationSortBy}>
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
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
            {/* Left side - Applications List */}
            <div className="lg:col-span-1 xl:col-span-2 space-y-4">
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#c5c4d4] scrollbar-track-transparent overflow-visible">
                {filteredApplications.map((app, index) => {
                  const matchScore = getOverallMatchScore(app);
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedApplication?.id === app.id 
                            ? "ring-2 ring-[#635bff] bg-[#635bff]/5" 
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex flex-col sm:flex-row justify-between gap-4 h-full">
                            {/* LEFT CONTENT */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-[#3a4043] truncate">{app.jobTitle}</h3>
                                <Badge className={`${getMatchScoreColor(matchScore)} bg-opacity-10`}>
                                  {matchScore}% match
                                </Badge>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-[#6f7a80] mb-3">
                                <span className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  {app.company}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {app.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {app.type || app.employmentType || "Full-time"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {app.salaryRange !== undefined && SALARY_RANGES[app.salaryRange] ? SALARY_RANGES[app.salaryRange] : formatSalary(app)}
                                </span>
                              </div>

                              <p className="text-[#6f7a80] text-sm mb-3 line-clamp-3 overflow-hidden">
                                {app.description || "View details for job description"}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                                <span>Posted: {app.postedDate || (app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent")}</span>
                                {app.deadline && <span>Deadline: {typeof app.deadline === 'string' ? new Date(app.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : app.deadline}</span>}
                                {!app.deadline && app.applicationDeadline && <span>Deadline: {app.applicationDeadline}</span>}
                              </div>
                            </div>

                             {/* RIGHT STATUS BADGE AND HEART */}
                             <div className="flex flex-col justify-between items-end gap-2 sm:self-start shrink-0">
                               {getStatusBadge(app.status, app.jobStatus)}
                               <button
                                 className={`p-2 rounded-md transition-colors cursor-pointer ${
                                   savedJobKeys.has(`${app.jobTitle}-${app.company}`)
                                     ? "text-red-500 hover:bg-red-50"
                                     : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                 }`}
                                 disabled={savingJobId === `${app.jobTitle}-${app.company}`}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleSaveJob(app);
                                 }}
                               >
                                 <Heart className={`w-5 h-5 ${savedJobKeys.has(`${app.jobTitle}-${app.company}`) ? "fill-red-500" : ""}`} />
                               </button>
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Application Details */}
            <div className="lg:col-span-1 xl:col-span-3">
              {selectedApplication ? (
                <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <CardHeader className="pb-4 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                          {selectedApplication.jobTitle}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {selectedApplication.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {selectedApplication.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedApplication.type || selectedApplication.employmentType || "Full-time"}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(selectedApplication)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <Badge className={`${getMatchScoreColor(getOverallMatchScore(selectedApplication))} bg-opacity-10 text-lg px-4 py-2`}>
                          {getOverallMatchScore(selectedApplication)}% match
                        </Badge>
                        <button
                          className={`p-2 rounded-md transition-colors cursor-pointer ${
                            savedJobKeys.has(`${selectedApplication.jobTitle}-${selectedApplication.company}`)
                              ? "text-red-500 hover:bg-red-50"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          }`}
                          disabled={savingJobId === `${selectedApplication.jobTitle}-${selectedApplication.company}`}
                          onClick={() => handleSaveJob(selectedApplication)}
                        >
                          <Heart className={`w-5 h-5 ${savedJobKeys.has(`${selectedApplication.jobTitle}-${selectedApplication.company}`) ? "fill-red-500" : ""}`} />
                        </button>
                      </div>
                      <div className="absolute top-20 right-4">
                        {getStatusBadge(selectedApplication.status, selectedApplication.jobStatus)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">

                    {/* Job Description */}
                    <div>
                      <h4 className="font-semibold text-[#3a4043] mb-3">Job Description</h4>
                      <p className="text-[#6f7a80] break-words leading-relaxed whitespace-pre-line">{selectedApplication.description || "No description available."}</p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.requirements && selectedApplication.requirements.length > 0 ? (
                          selectedApplication.requirements.map((req, reqIndex) => (
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
                        {selectedApplication.accommodations && selectedApplication.accommodations.length > 0 ? (
                          selectedApplication.accommodations.map((accommodation, accommodationIndex) => (
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
                          <span>{selectedApplication.industry || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Company Size:</span>
                          <span>{selectedApplication.companySize || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Posted:</span>
                          <span>{selectedApplication.postedDate || (selectedApplication.appliedDate ? new Date(selectedApplication.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recently")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Application Deadline:</span>
                          <span>{selectedApplication.deadline ? (typeof selectedApplication.deadline === 'string' ? new Date(selectedApplication.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : selectedApplication.deadline) : "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Applied:</span>
                          <span>{selectedApplication.appliedDate ? new Date(selectedApplication.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Matching Score - Expandable */}
                    <div className="pt-4 border-t border-[#e8e6f0]">
                      <button
                        onClick={() => setExpandedMatchingScore(expandedMatchingScore === selectedApplication.id ? null : selectedApplication.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-[#635BFF]">View Matching Detail</span>
                        {expandedMatchingScore === selectedApplication.id ? (
                          <ChevronUp className="h-5 w-5 text-[#6f7a80]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#6f7a80]" />
                        )}
                      </button>
                      {expandedMatchingScore === selectedApplication.id && selectedApplication && (() => {
                        const primaryMatchScore = selectedApplication.primaryMatchScore || selectedApplication.score || 96;
                        const secondaryMatchScore = selectedApplication.secondaryMatchScore || 90;
                        const tertiaryMatchScore = selectedApplication.tertiaryMatchScore || 85;
                        const overallMatchScore = getOverallMatchScore(selectedApplication);

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

                    {/* Interview Information */}
                    {selectedApplication.interviewDate && selectedApplication.status === "interview_scheduled" && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#3a4043] mb-2">Interview Scheduled</h3>
                            <p className="text-gray-700 mb-1">
                              <strong>Date:</strong> {(() => {
                                try {
                                  // Normalize date string to ensure proper timezone handling
                                  const dateStr = selectedApplication.interviewDate;
                                  const normalizedStr = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
                                    ? dateStr
                                    : dateStr + 'Z';
                                  const interviewDate = new Date(normalizedStr);
                                  return interviewDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    weekday: 'long',
                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                  });
                                } catch {
                                  return 'Invalid date';
                                }
                              })()}
                            </p>
                            {(() => {
                              try {
                                // Normalize date string to ensure proper timezone handling
                                const dateStr = selectedApplication.interviewDate;
                                const normalizedStr = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
                                  ? dateStr
                                  : dateStr + 'Z';
                                const interviewDateTime = new Date(normalizedStr);
                                // Check if time information is available (not just date)
                                if (interviewDateTime.getHours() !== 0 || interviewDateTime.getMinutes() !== 0) {
                                  return (
                        <p className="text-gray-700 mb-3">
                                      <strong>Time:</strong> {interviewDateTime.toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true,
                                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                      })}
                                    </p>
                                  );
                                }
                                return null;
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50 font-semibold px-5 py-2 shadow-md transition-all duration-200 cursor-pointer"
                            onClick={async () => {
                              if (!selectedApplication.id) {
                                showError("Error", "Application ID not found");
                                return;
                              }
                              try {
                                const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                // Update application status
                                const response = await fetch(`${API_BASE}/applications/${selectedApplication.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'interview_accepted' }),
                                });
                                
                                if (response.ok) {
                                  // Backend will automatically update shortlist status when application status changes
                                  // Dispatch event to refresh applications
                                  window.dispatchEvent(new CustomEvent('applicationStatusUpdated', {
                                    detail: {
                                      applicationId: selectedApplication.id,
                                      newStatus: 'interview_accepted',
                                      timestamp: new Date().toISOString()
                                    }
                                  }));
                                  
                                  success("Interview Accepted", "You have accepted the interview invitation.");
                                  // Refresh applications
                                  if (setApplications) {
                                    const sessionEmail = session?.user?.email;
                                    if (sessionEmail) {
                                      const appsResponse = await fetch(`${API_BASE}/applications?candidateEmail=${encodeURIComponent(sessionEmail)}`);
                                      if (appsResponse.ok) {
                                        const appsData = await appsResponse.json();
                                        const mapped = Array.isArray(appsData)
                                          ? appsData.map((app: any) => ({
                                              id: app.id,
                                              jobTitle: app.job_title || app.jobTitle || '',
                                              company: app.company || '',
                                              appliedDate: app.applied_date || app.appliedDate || '',
                                              status: app.status || 'under_review',
                                              location: app.location || '',
                                              salary: app.salary || '',
                                              employmentType: app.type || app.employment_type || '',
                                              accommodationsRequested: app.accommodations_requested || false,
                                              score: app.score,
                                              interviewDate: app.interview_date || app.interviewDate,
                                            }))
                                          : [];
                                        setApplications(mapped);
                                        // Update selected application
                                        const updatedApp = mapped.find((a: any) => a.id === selectedApplication.id);
                                        if (updatedApp) {
                                          setSelectedApplication({ ...selectedApplication, ...updatedApp });
                                        }
                                      }
                                    }
                                  }
                                } else {
                                  showError("Error", "Failed to accept interview. Please try again.");
                                }
                              } catch (error) {
                                console.error("Error accepting interview:", error);
                                showError("Error", "An error occurred while accepting the interview.");
                              }
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept Interview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 font-semibold px-5 py-2 shadow-md transition-all duration-200 cursor-pointer"
                            onClick={async () => {
                              if (!selectedApplication.id) {
                                showError("Error", "Application ID not found");
                                return;
                              }
                              try {
                                const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                // Update application status
                                const response = await fetch(`${API_BASE}/applications/${selectedApplication.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ status: 'interview_rejected' }),
                                });
                                
                                if (response.ok) {
                                  // Find and update shortlist status
                                  // Similar to accept - update application, shortlist will sync when employer views
                                  // The application status update is the primary source of truth
                                  
                                  // Dispatch event to refresh applications
                                  window.dispatchEvent(new CustomEvent('applicationStatusUpdated', {
                                    detail: {
                                      applicationId: selectedApplication.id,
                                      newStatus: 'interview_rejected',
                                      timestamp: new Date().toISOString()
                                    }
                                  }));
                                  
                                  success("Interview Rejected", "You have rejected the interview invitation.");
                                  // Refresh applications
                                  if (setApplications) {
                                    const sessionEmail = session?.user?.email;
                                    if (sessionEmail) {
                                      const appsResponse = await fetch(`${API_BASE}/applications?candidateEmail=${encodeURIComponent(sessionEmail)}`);
                                      if (appsResponse.ok) {
                                        const appsData = await appsResponse.json();
                                        const mapped = Array.isArray(appsData)
                                          ? appsData.map((app: any) => ({
                                              id: app.id,
                                              jobTitle: app.job_title || app.jobTitle || '',
                                              company: app.company || '',
                                              appliedDate: app.applied_date || app.appliedDate || '',
                                              status: app.status || 'under_review',
                                              location: app.location || '',
                                              salary: app.salary || '',
                                              employmentType: app.type || app.employment_type || '',
                                              accommodationsRequested: app.accommodations_requested || false,
                                              score: app.score,
                                              interviewDate: app.interview_date || app.interviewDate,
                                            }))
                                          : [];
                                        setApplications(mapped);
                                        // Update selected application
                                        const updatedApp = mapped.find((a: any) => a.id === selectedApplication.id);
                                        if (updatedApp) {
                                          setSelectedApplication({ ...selectedApplication, ...updatedApp });
                                        }
                                      }
                                    }
                                  }
                                } else {
                                  showError("Error", "Failed to reject interview. Please try again.");
                                }
                              } catch (error) {
                                console.error("Error rejecting interview:", error);
                                showError("Error", "An error occurred while rejecting the interview.");
                              }
                            }}
                          >
                            <XIcon className="h-4 w-4 mr-2" />
                            Reject Interview
                          </Button>
                        <Button
                          size="sm"
                            className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => router.push("/candidate/candidate-dashboard?tab=mock-interview&subtab=setup")}
                        >
                          Prepare for Interview
                        </Button>
                        </div>
                      </div>
                    )}
                    {selectedApplication.interviewDate && selectedApplication.status === "interview_accepted" && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-1">Interview Accepted</h3>
                            <p className="text-sm text-green-700">
                              Date: {new Date(selectedApplication.interviewDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                              })} at {new Date(selectedApplication.interviewDate).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedApplication.status === "interview_rejected" && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <XIcon className="h-5 w-5 text-red-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-red-800 mb-1">Interview Rejected</h3>
                            <p className="text-sm text-red-700">You have rejected this interview invitation.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-row gap-3 pt-4 border-t border-[#e8e6f0]">
                      <Button 
                        className="flex-1 bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                        onClick={async () => {
                          if (selectedApplication && selectedApplication.id) {
                            try {
                              const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                              const response = await fetch(`${API_BASE}/applications/${selectedApplication.id}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                              });

                              if (response.ok) {
                                setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));
                                const remainingApplications = applications.filter(app => app.id !== selectedApplication.id);
                                setSelectedApplication(remainingApplications.length > 0 ? remainingApplications[0] : null);
                                success('Application Withdrawn', `Your application for ${selectedApplication.jobTitle} at ${selectedApplication.company} has been withdrawn.`);
                                
                                // Dispatch event to refresh applications list
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('applicationWithdrawn', {
                                    detail: { applicationId: selectedApplication.id }
                                  }));
                                }
                              } else {
                                const errorText = await response.text();
                                showError('Withdrawal Failed', errorText || 'Failed to withdraw application. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error withdrawing application:', error);
                              showError('Error', 'An error occurred while withdrawing the application.');
                            }
                          }
                        }}
                      >
                        Withdraw Application
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
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No application selected</h3>
                    <p className="text-sm text-gray-500">
                      Click on an application from the list to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No applications found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
