"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  SortAsc,
  Sparkles,
  Users,
  Calendar,
  Shield,
  Clock,
  Download,
  Eye,
} from "lucide-react";
import { useToastHelpers } from "@/components/ui/toast";

interface ShortlistedCandidate {
  id: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
  accommodationsRequested: boolean;
  accommodationDetails: string;
  experience: string;
  score: number;
  interviewDate?: string | null;
}

interface ShortlistedApplicantsProps {
  currentEmployerEmail: string | null;
  API_BASE: string;
  onViewProfile: (candidateEmail: string) => void;
  onRunAiMatching: () => void;
  isRunningAiMatch: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
  getMatchScoreColor: (score: number) => string;
  onTabChange: (tab: string) => void;
}

export default function ShortlistedApplicants({
  currentEmployerEmail,
  API_BASE,
  onViewProfile,
  onRunAiMatching,
  isRunningAiMatch,
  getStatusBadge,
  getMatchScoreColor,
  onTabChange,
}: ShortlistedApplicantsProps) {
  const [shortlistedCandidates, setShortlistedCandidates] = useState<ShortlistedCandidate[]>([]);
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [applicantFilterStatus, setApplicantFilterStatus] = useState("all");
  const [applicantSortBy, setApplicantSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ShortlistedCandidate | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState<string | null>(null);
  const { success, error: showError } = useToastHelpers();

  // Fetch shortlisted candidates when component mounts or employer email changes
  useEffect(() => {
    if (currentEmployerEmail) {
      const fetchShortlistedCandidates = async () => {
        setIsLoading(true);
        try {
          console.log("Fetching shortlisted candidates for:", currentEmployerEmail);
          // Fetch candidates with status = "shortlisted", "interview_scheduled", "interview_accepted", or "interview_rejected"
          // Make multiple API calls and combine results
          const [shortlistedResponse, interviewScheduledResponse, interviewAcceptedResponse, interviewRejectedResponse] = await Promise.all([
            fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=shortlisted`),
            fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_scheduled`),
            fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_accepted`),
            fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_rejected`)
          ]);
          
          const allCandidates: any[] = [];
          
          // Process shortlisted candidates
          if (shortlistedResponse.ok) {
            const shortlistData = await shortlistedResponse.json();
            if (Array.isArray(shortlistData)) {
              allCandidates.push(...shortlistData);
            }
          }
          
          // Process interview_scheduled candidates
          if (interviewScheduledResponse.ok) {
            const interviewData = await interviewScheduledResponse.json();
            if (Array.isArray(interviewData)) {
              allCandidates.push(...interviewData);
            }
          }
          
          // Process interview_accepted candidates
          if (interviewAcceptedResponse.ok) {
            const acceptedData = await interviewAcceptedResponse.json();
            if (Array.isArray(acceptedData)) {
              allCandidates.push(...acceptedData);
            }
          }
          
          // Process interview_rejected candidates
          if (interviewRejectedResponse.ok) {
            const rejectedData = await interviewRejectedResponse.json();
            if (Array.isArray(rejectedData)) {
              allCandidates.push(...rejectedData);
            }
          }
          
          console.log("Shortlist data received:", allCandidates);
          
          // Fetch match results for all unique candidate emails
          const uniqueCandidateEmails = [...new Set(allCandidates.map((item: any) => item.candidate_email || item.candidateEmail).filter(Boolean))];
          const matchResultsMap = new Map<string, Map<string, number>>(); // Map<email, Map<jobTitle, total_score>>
          
          // Fetch match results for each candidate
          await Promise.all(
            uniqueCandidateEmails.map(async (email: string) => {
              try {
                const matchResponse = await fetch(`${API_BASE}/match_results/candidate/${encodeURIComponent(email)}`);
                if (matchResponse.ok) {
                  const matchData = await matchResponse.json();
                  if (Array.isArray(matchData)) {
                    const jobScoreMap = new Map<string, number>();
                    matchData.forEach((match: any) => {
                      if (match.job_title && match.total_score !== undefined) {
                        jobScoreMap.set(match.job_title.toLowerCase().trim(), Math.round(match.total_score));
                      }
                    });
                    matchResultsMap.set(email.toLowerCase(), jobScoreMap);
                  }
                }
              } catch (err) {
                console.warn(`Failed to fetch match results for ${email}:`, err);
              }
            })
          );
          
          const transformedData = allCandidates.map((item: any) => {
            const candidateEmail = (item.candidate_email || item.candidateEmail || "").toLowerCase();
            const jobTitle = (item.job_title || item.jobTitle || "").toLowerCase().trim();
            
            // Get match score from match results map
            let matchScore = item.score || 0;
            const candidateMatchMap = matchResultsMap.get(candidateEmail);
            if (candidateMatchMap && jobTitle) {
              const score = candidateMatchMap.get(jobTitle);
              if (score !== undefined) {
                matchScore = score;
              }
            }
            
            return {
              id: item.id,
              candidateName: item.candidate_name || item.candidateName || "Unknown Candidate",
              candidateEmail: item.candidate_email || item.candidateEmail || "",
              jobTitle: item.job_title || item.jobTitle || "",
              appliedDate: item.applied_date || item.appliedDate || new Date().toISOString(),
              status: item.status || "shortlisted",
              accommodationsRequested:
                item.accommodations_requested || item.accommodationsRequested || false,
              accommodationDetails:
                item.accommodation_details || item.accommodationDetails || "",
              experience: item.experience || "",
              score: matchScore,
              interviewDate: item.interview_date || null,
            };
          });
          
          console.log("Transformed shortlisted candidates with match scores:", transformedData);
          setShortlistedCandidates(transformedData);
        } catch (err) {
          console.error("Error fetching shortlisted candidates:", err);
          setShortlistedCandidates([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchShortlistedCandidates();
      
      // Listen for match scores update event to refresh scores
      const handleMatchScoresUpdated = () => {
        console.log('🔄 [Shortlisted Applicants] Received matchScoresUpdated event, refreshing match scores...');
        fetchShortlistedCandidates();
      };
      
      window.addEventListener('matchScoresUpdated', handleMatchScoresUpdated);
      return () => {
        window.removeEventListener('matchScoresUpdated', handleMatchScoresUpdated);
      };
    }
  }, [currentEmployerEmail, API_BASE]);

  // Filter and sort candidates
  const filteredShortlistedCandidates = shortlistedCandidates
    .filter((app) => {
      // Search filter
      const matchesSearch =
        !applicantSearchTerm ||
        (app.candidateName &&
          app.candidateName.toLowerCase().includes(applicantSearchTerm.toLowerCase())) ||
        (app.jobTitle &&
          app.jobTitle.toLowerCase().includes(applicantSearchTerm.toLowerCase())) ||
        (app.status &&
          app.status.toLowerCase().includes(applicantSearchTerm.toLowerCase())) ||
        (app.candidateEmail &&
          app.candidateEmail.toLowerCase().includes(applicantSearchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        applicantFilterStatus === "all" ||
        (app.status && app.status.toLowerCase() === applicantFilterStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (applicantSortBy) {
        case "recent":
          const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
          const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
          return dateB - dateA;
        case "match":
          return (b.score || 0) - (a.score || 0);
        case "name":
          return (a.candidateName || "").localeCompare(b.candidateName || "");
        default:
          return 0;
      }
    });

  const handleScheduleInterview = (candidate: ShortlistedCandidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleDialog(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setInterviewTime("09:00");
  };

  const handleConfirmSchedule = async () => {
    if (!selectedCandidate || !interviewDate || !interviewTime) {
      showError("Missing Information", "Please select both date and time for the interview.");
      return;
    }

    setIsScheduling(true);
    try {
      // Combine date and time - ensure it's treated as local time
      // Format: YYYY-MM-DDTHH:MM (no timezone = local time)
      const dateTimeString = `${interviewDate}T${interviewTime}`;
      const dateTime = new Date(dateTimeString);
      
      // Validate the date was parsed correctly
      if (isNaN(dateTime.getTime())) {
        throw new Error(`Invalid date/time: ${dateTimeString}`);
      }
      
      console.log("📅 [Schedule] Creating interview datetime:", {
        input: dateTimeString,
        localTime: dateTime.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        utcTime: dateTime.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      // Update shortlist status to interview_scheduled with interview_date
      const updateResponse = await fetch(`${API_BASE}/shortlist/${selectedCandidate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'interview_scheduled',
          interview_date: dateTime.toISOString(), // Store as UTC ISO string
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update shortlist status: ${errorText}`);
      }

      // Also update the application status to interview_scheduled
      // Find the application by candidate_email and job_title
      try {
        // Use the direct backend endpoint to find applications
        // The endpoint is /applications/applications/{candidate_email} because router is mounted at /applications
        const applicationsResponse = await fetch(`${API_BASE}/applications/applications/${encodeURIComponent(selectedCandidate.candidateEmail)}`);
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          console.log("📋 Found applications for candidate:", applications.length);
          const matchingApplication = Array.isArray(applications) 
            ? applications.find((app: any) => 
                (app.candidate_email === selectedCandidate.candidateEmail || app.candidateEmail === selectedCandidate.candidateEmail) && 
                (app.job_title === selectedCandidate.jobTitle || app.jobTitle === selectedCandidate.jobTitle)
              )
            : null;
          
          console.log("🔍 Matching application:", matchingApplication ? `Found (ID: ${matchingApplication.id})` : "Not found");
          
          if (matchingApplication && matchingApplication.id) {
            // Update application status to interview_scheduled
            const updateResponse = await fetch(`${API_BASE}/applications/${matchingApplication.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                status: 'interview_scheduled',
                interview_date: dateTime.toISOString() // Full datetime with time
              }),
            });
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error("Failed to update application status:", errorText);
              throw new Error(`Failed to update application: ${errorText}`);
            }
            
            const updateResult = await updateResponse.json();
            console.log("✅ Application status updated successfully:", updateResult);
            
            // Force a small delay to ensure database commit
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.warn("⚠️ No matching application found for candidate:", selectedCandidate.candidateEmail, "job:", selectedCandidate.jobTitle);
            console.warn("⚠️ Available applications:", applications.map((app: any) => ({
              id: app.id,
              candidate_email: app.candidate_email || app.candidateEmail,
              job_title: app.job_title || app.jobTitle
            })));
          }
        } else {
          console.error("❌ Failed to fetch applications:", applicationsResponse.status, await applicationsResponse.text().catch(() => ''));
        }
      } catch (err) {
        console.error("❌ Error updating application status:", err);
        // Don't fail the whole operation if application update fails, but log it
      }

      // Dispatch event for notification system (NotificationBell component will handle it)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('interviewScheduled', {
          detail: {
            candidateEmail: selectedCandidate.candidateEmail,
            candidateName: selectedCandidate.candidateName,
            jobTitle: selectedCandidate.jobTitle,
            interviewDate: dateTime.toISOString(),
            timestamp: new Date().toISOString(),
            message: `Your interview for ${selectedCandidate.jobTitle} has been scheduled for ${dateTime.toLocaleDateString()} at ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          }
        }));
        
        // Also dispatch applicationStatusUpdated to trigger notification refresh
        window.dispatchEvent(new CustomEvent('applicationStatusUpdated', {
          detail: {
            candidateEmail: selectedCandidate.candidateEmail,
            status: 'interview_scheduled',
            timestamp: new Date().toISOString()
          }
        }));
      }

      success(
        "Interview Scheduled",
        `Interview scheduled for ${selectedCandidate.candidateName} on ${dateTime.toLocaleDateString()} at ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );

      // Refresh the candidates list - fetch all relevant statuses
      const [shortlistedResponse, interviewScheduledResponse, interviewAcceptedResponse, interviewRejectedResponse] = await Promise.all([
        fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=shortlisted`),
        fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_scheduled`),
        fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_accepted`),
        fetch(`${API_BASE}/shortlist/employer/${currentEmployerEmail}?status=interview_rejected`)
      ]);
      
      const allCandidates: any[] = [];
      
      if (shortlistedResponse.ok) {
        const shortlistData = await shortlistedResponse.json();
        if (Array.isArray(shortlistData)) {
          allCandidates.push(...shortlistData);
        }
      }
      
      if (interviewScheduledResponse.ok) {
        const interviewData = await interviewScheduledResponse.json();
        if (Array.isArray(interviewData)) {
          allCandidates.push(...interviewData);
        }
      }
      
      if (interviewAcceptedResponse.ok) {
        const acceptedData = await interviewAcceptedResponse.json();
        if (Array.isArray(acceptedData)) {
          allCandidates.push(...acceptedData);
        }
      }
      
      if (interviewRejectedResponse.ok) {
        const rejectedData = await interviewRejectedResponse.json();
        if (Array.isArray(rejectedData)) {
          allCandidates.push(...rejectedData);
        }
      }
      
      // Fetch match results for all unique candidate emails
      const uniqueCandidateEmails = [...new Set(allCandidates.map((item: any) => item.candidate_email || item.candidateEmail).filter(Boolean))];
      const matchResultsMap = new Map<string, Map<string, number>>(); // Map<email, Map<jobTitle, total_score>>
      
      // Fetch match results for each candidate
      await Promise.all(
        uniqueCandidateEmails.map(async (email: string) => {
          try {
            const matchResponse = await fetch(`${API_BASE}/match_results/candidate/${encodeURIComponent(email)}`);
            if (matchResponse.ok) {
              const matchData = await matchResponse.json();
              if (Array.isArray(matchData)) {
                const jobScoreMap = new Map<string, number>();
                matchData.forEach((match: any) => {
                  if (match.job_title && match.total_score !== undefined) {
                    jobScoreMap.set(match.job_title.toLowerCase().trim(), Math.round(match.total_score));
                  }
                });
                matchResultsMap.set(email.toLowerCase(), jobScoreMap);
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch match results for ${email}:`, err);
          }
        })
      );
      
      const transformedData = allCandidates.map((item: any) => {
        const candidateEmail = (item.candidate_email || item.candidateEmail || "").toLowerCase();
        const jobTitle = (item.job_title || item.jobTitle || "").toLowerCase().trim();
        
        // Get match score from match results map
        let matchScore = item.score || 0;
        const candidateMatchMap = matchResultsMap.get(candidateEmail);
        if (candidateMatchMap && jobTitle) {
          const score = candidateMatchMap.get(jobTitle);
          if (score !== undefined) {
            matchScore = score;
          }
        }
        
        return {
          id: item.id,
          candidateName: item.candidate_name || item.candidateName || "Unknown Candidate",
          candidateEmail: item.candidate_email || item.candidateEmail || "",
          jobTitle: item.job_title || item.jobTitle || "",
          appliedDate: item.applied_date || item.appliedDate || new Date().toISOString(),
          status: item.status || "shortlisted",
          accommodationsRequested:
            item.accommodations_requested || item.accommodationsRequested || false,
          accommodationDetails:
            item.accommodation_details || item.accommodationDetails || "",
          experience: item.experience || "",
          score: matchScore,
          interviewDate: item.interview_date || null,
        };
      });
      setShortlistedCandidates(transformedData);

      setShowScheduleDialog(false);
      setSelectedCandidate(null);
      setInterviewDate("");
      setInterviewTime("");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      showError(
        "Schedule Failed",
        error instanceof Error ? error.message : "Failed to schedule interview. Please try again."
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDownloadResume = async (candidateEmail: string, candidateName: string) => {
    if (!candidateEmail) {
      showError("Error", "Candidate email not available");
      return;
    }

    setDownloadingResume(candidateEmail);
    try {
      // Fetch candidate profile to get resume URL
      const profileResponse = await fetch(`${API_BASE}/profiles/${encodeURIComponent(candidateEmail)}`);
      if (!profileResponse.ok) {
        throw new Error("Failed to fetch candidate profile");
      }

      const profileData = await profileResponse.json();
      if (!profileData.resume_url) {
        showError("Resume Not Found", "This candidate has not uploaded a resume.");
        setDownloadingResume(null);
        return;
      }

      // Construct full URL if it's a relative path
      const resumeUrl = profileData.resume_url.startsWith('http') 
        ? profileData.resume_url 
        : `${API_BASE}${profileData.resume_url}`;

      // Fetch the resume file
      const resumeResponse = await fetch(resumeUrl);
      if (!resumeResponse.ok) {
        throw new Error("Failed to download resume file");
      }

      // Get the blob
      const blob = await resumeResponse.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from URL or use candidate name
      const urlPath = new URL(resumeUrl).pathname;
      const filename = urlPath.split('/').pop() || `${candidateName.replace(/\s+/g, '_')}_resume.pdf`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success("Resume Downloaded", `Resume for ${candidateName} has been downloaded successfully.`);
    } catch (error) {
      console.error("Error downloading resume:", error);
      showError(
        "Download Failed",
        error instanceof Error ? error.message : "Failed to download resume. Please try again."
      );
    } finally {
      setDownloadingResume(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#3a4043]">Shortlisted Applicants</h2>
        {/* <Button
          onClick={onRunAiMatching}
          disabled={isRunningAiMatch}
          className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isRunningAiMatch ? "Running..." : "Run AI Matching"}
        </Button> */}
      </div>

      {/* Search and Filters */}
      <Card className="mb-3">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                <Input
                  placeholder="Search applicants by name, job title, or status..."
                  value={applicantSearchTerm}
                  onChange={(e) => setApplicantSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={applicantFilterStatus} onValueChange={setApplicantFilterStatus}>
                <SelectTrigger className="w-52">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>

              <Select value={applicantSortBy} onValueChange={setApplicantSortBy}>
                <SelectTrigger className="w-40">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6 ml-2">
        <p className="text-[#6f7a80] text-sm">
          Showing {filteredShortlistedCandidates.length} of {shortlistedCandidates.length}{" "}
          shortlisted applicants
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Loading shortlisted candidates...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShortlistedCandidates.length > 0 ? (
            filteredShortlistedCandidates.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-[#3a4043]">
                          {app.candidateName}
                        </h3>
                        {getStatusBadge(app.status)}
                        {app.score > 0 && (
                          <span className={`text-sm font-medium ${getMatchScoreColor(app.score)}`}>
                            {app.score}% match
                          </span>
                        )}
                      </div>
                      <p className="text-[#635bff] font-medium mb-2">
                        Applied for: {app.jobTitle || "No job specified"}
                      </p>
                      {app.candidateEmail && (
                        <p className="text-sm text-gray-500 mb-2">Email: {app.candidateEmail}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Experience: {app.experience || "Not specified"}</span>
                        <span>
                          Shortlisted:{" "}
                          {app.appliedDate
                            ? new Date(app.appliedDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {app.accommodationsRequested && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-800">
                                Accommodations Requested
                              </p>
                              <p className="text-sm text-purple-700">{app.accommodationDetails}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                      {/* First row: Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => app.candidateEmail && onViewProfile(app.candidateEmail)}
                          className="bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer whitespace-nowrap"
                          disabled={!app.candidateEmail}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => app.candidateEmail && handleDownloadResume(app.candidateEmail, app.candidateName)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                          disabled={!app.candidateEmail || downloadingResume === app.candidateEmail}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {downloadingResume === app.candidateEmail ? "Downloading..." : "Resume"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleInterview(app)}
                          className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 cursor-pointer"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Interview
                        </Button>
                      </div>
                      {/* Second row: Status badge */}
                      <div className="flex items-end justify-end">
                        {getStatusBadge(app.status)}
                        {app.status === "interview_accepted" && (
                          <div className="text-xs text-green-600 ml-2 font-medium">
                            ✓ Accepted
                          </div>
                        )}
                        {app.status === "interview_rejected" && (
                          <div className="text-xs text-red-600 ml-2 font-medium">
                            ✗ Rejected
                          </div>
                        )}
                      </div>
                      {/* Third row: Interview date/time */}
                      {app.status === "interview_scheduled" && app.interviewDate && (
                        <div className="text-xs font-bold text-[#635bff] text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            <span>{(() => {
                              try {
                                // Normalize date string to ensure proper timezone handling
                                const dateStr = app.interviewDate;
                                const normalizedStr = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
                                  ? dateStr
                                  : dateStr + 'Z';
                                const interviewDate = new Date(normalizedStr);
                                return interviewDate.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                });
                              } catch {
                                return 'Invalid date';
                              }
                            })()}
                            </span>
                          </div>
                          <div className="text-[#635bff]/80">
                            {(() => {
                              try {
                                // Normalize date string to ensure proper timezone handling
                                const dateStr = app.interviewDate;
                                const normalizedStr = dateStr.endsWith('Z') || dateStr.includes('+') || dateStr.includes('-', 10)
                                  ? dateStr
                                  : dateStr + 'Z';
                                const interviewDate = new Date(normalizedStr);
                                return interviewDate.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                });
                              } catch {
                                return 'Invalid time';
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#3a4043] mb-2">
                  {applicantSearchTerm
                    ? "No Matching Applicants Found"
                    : "No Shortlisted Candidates Yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {applicantSearchTerm
                    ? "Try adjusting your search terms"
                    : "Start shortlisting candidates from your job postings to see them here."}
                </p>
                {!applicantSearchTerm && (
                  <Button
                    className="bg-[#635bff] hover:bg-[#5748e5] text-white hover:cursor-pointer"
                    onClick={() => onTabChange("jobs")}
                  >
                    View Job Postings
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Schedule Interview Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Select date and time for the interview with {selectedCandidate?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3a4043] flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interview Date
              </label>
              <Input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3a4043] flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Interview Time
              </label>
              <Input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full"
              />
            </div>
            {interviewDate && interviewTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong>{" "}
                  {(() => {
                    try {
                      const previewDate = new Date(`${interviewDate}T${interviewTime}`);
                      return previewDate.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      });
                    } catch {
                      return 'Invalid date/time';
                    }
                  })()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowScheduleDialog(false);
                setSelectedCandidate(null);
                setInterviewDate("");
                setInterviewTime("");
              }}
              disabled={isScheduling}
              className="hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSchedule}
              disabled={!interviewDate || !interviewTime || isScheduling}
              className="bg-[#635bff] hover:bg-[#5346e6] text-white hover:cursor-pointer"
            >
              {isScheduling ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}