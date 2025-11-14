"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import {
  Search, MapPin, Clock, Briefcase, DollarSign, Shield, Building, Bookmark, Share, Eye, ChevronDown, ChevronUp, CheckCircle, BrainCircuit, House, Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
  status: string;
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
  selectedApplication: Application | null;
  setSelectedApplication: React.Dispatch<React.SetStateAction<Application | null>>;
  showMatchingScoreDialog: boolean;
  setShowMatchingScoreDialog: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
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
  const [expandedMatchingScore, setExpandedMatchingScore] = useState<number | null>(null);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !applicationSearchTerm || 
      app.jobTitle.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
      app.status.toLowerCase().includes(applicationSearchTerm.toLowerCase());
    const matchesStatus = applicationFilterStatus === "all" || app.status === applicationFilterStatus;
    return matchesSearch && matchesStatus;
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
                  <SelectTrigger className="w-42">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value="recent" onValueChange={() => {}}>
                  <SelectTrigger className="w-42">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="match">Best Match</SelectItem>
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
                               {getStatusBadge(app.status)}
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
                        {getStatusBadge(selectedApplication.status)}
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

                    {/* Interview Information */}
                    {selectedApplication.interviewDate && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-[#3a4043] mb-2">Interview Scheduled</h3>
                        <p className="text-gray-700 mb-3">
                          <strong>Date:</strong> {new Date(selectedApplication.interviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <Button
                          size="sm"
                          className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 shadow-md transition-all duration-200"
                          onClick={() => router.push("/mock-interview/setup")}
                        >
                          Prepare for Interview
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-row gap-3 pt-4 border-t border-[#e8e6f0]">
                      <Button 
                        className="flex-1 bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                        onClick={() => {
                          if (selectedApplication) {
                            setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));
                            const remainingApplications = applications.filter(app => app.id !== selectedApplication.id);
                            setSelectedApplication(remainingApplications.length > 0 ? remainingApplications[0] : null);
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
