"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  House,
} from "lucide-react";
import { motion } from "motion/react";
import { ToastProvider, useToastHelpers } from "@/components/ui/toast";

// Job interface based on database structure
interface Job {
  id: number;
  employer_email: string;
  job_title: string;
  job_type: string;
  work_mode: string;
  experience_level: string;
  location: string;
  salary_range: number;
  job_summary: string;
  job_requirements: string;
  soft_skills: string;
  flexible_work_hour: boolean;
  sensory_friendly_environment: boolean;
  peer_support_system: boolean;
  dedicated_workspace: boolean;
  neurodiversity_awareness_training: boolean;
  regular_supervisor_check_in: boolean;
  zero_tolerance_bullying_mobbing_policy: boolean;
  augmentative_alternative_communication: boolean;
  quiet_room: boolean;
  sensory_aids: boolean;
  provide_visual_guidance: boolean;
  uses_project_management_tools: boolean;
  optional_social_event: boolean;
  mental_health_support: boolean;
  near_public_transport: boolean;
}

// Frontend job interface for display
interface DisplayJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salaryRange?: number; // Index for SALARY_RANGES array
  postedDate: string;
  matchScore: number;
  accommodationsFriendly: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  accommodations?: string[]; // Accommodations offered
  companySize: string;
  industry: string;
  applicationDeadline: string;
  neurodivergentFriendly: boolean;
  logo?: string;
  primaryMatchScore?: number;
  secondaryMatchScore?: number;
  tertiaryMatchScore?: number;
}

const SALARY_RANGES = [
  "Below RM 3,000",
  "RM 3,000 - RM 5,000",
  "RM 5,001 - RM 8,000",
  "RM 8,001 - RM 12,000",
  "RM 12,001 - RM 18,000",
  "RM 18,001 - RM 25,000",
  "Above RM 25,000",
];

export default function CandidateJobListingContent() {
  const { success, error: showError, warning, info } = useToastHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Map<string, number>>(new Map());
  const [expandedMatchingScore, setExpandedMatchingScore] = useState<string | null>(null);

  // Check if user has a profile/resume
  const checkUserProfile = async (userEmail: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      
      // Check if profile exists and has meaningful data (not just auto-created empty profile)
      // A profile is considered valid if it has:
      // 1. Personal identifiers with at least one filled field (excluding email)
      // 2. OR at least one education entry
      // 3. OR at least one experience entry
      
      let hasValidProfile = false;
      
      // Check personal identifiers - need at least one non-empty field besides email
      if (data.personal_identifiers) {
        const personalFields = Object.entries(data.personal_identifiers)
          .filter(([key, value]) => key !== 'email' && value && String(value).trim() !== '');
        if (personalFields.length > 0) {
          hasValidProfile = true;
        }
      }
      
      // Check educations
      if (!hasValidProfile && data.educations && Array.isArray(data.educations) && data.educations.length > 0) {
        // Check if at least one education has meaningful data
        const hasRealEducation = data.educations.some((edu: any) => 
          edu.degree || edu.institution || edu.field_of_study
        );
        if (hasRealEducation) {
          hasValidProfile = true;
        }
      }
      
      // Check experiences
      if (!hasValidProfile && data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
        // Check if at least one experience has meaningful data
        const hasRealExperience = data.experiences.some((exp: any) => 
          exp.job_title || exp.company || exp.description
        );
        if (hasRealExperience) {
          hasValidProfile = true;
        }
      }
      
      // Alternative field names (legacy support)
      if (!hasValidProfile && data.education && Object.keys(data.education).length > 0) {
        const hasRealEducation = Object.values(data.education).some(val => val && String(val).trim() !== '');
        if (hasRealEducation) {
          hasValidProfile = true;
        }
      }
      
      if (!hasValidProfile && data.experience && Object.keys(data.experience).length > 0) {
        const hasRealExperience = Object.values(data.experience).some(val => val && String(val).trim() !== '');
        if (hasRealExperience) {
          hasValidProfile = true;
        }
      }
      
      console.log('Profile validation result:', hasValidProfile, 'for user:', userEmail);
      return hasValidProfile;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  // Transform database job to display job
  const transformJob = (job: Job): DisplayJob => {
    // Calculate accommodations friendly based on multiple factors
    const accommodationsFriendly = 
      job.flexible_work_hour ||
      job.sensory_friendly_environment ||
      job.peer_support_system ||
      job.dedicated_workspace ||
      job.neurodiversity_awareness_training ||
      job.regular_supervisor_check_in ||
      job.zero_tolerance_bullying_mobbing_policy ||
      job.augmentative_alternative_communication ||
      job.quiet_room ||
      job.sensory_aids ||
      job.provide_visual_guidance ||
      job.uses_project_management_tools ||
      job.mental_health_support ||
      job.near_public_transport;

    // Parse requirements and soft skills
    const requirements = job.job_requirements ? job.job_requirements.split(',').map(r => r.trim()) : [];
    const softSkills = job.soft_skills ? job.soft_skills.split(',').map(s => s.trim()) : [];
    
    // Create accommodations array based on job accommodations
    const accommodations = [];
    if (job.flexible_work_hour) accommodations.push("Flexible Work Hours");
    if (job.quiet_room) accommodations.push("Quiet Room/Space");
    if (job.sensory_friendly_environment) accommodations.push("Sensory-Friendly Environment");
    if (job.peer_support_system) accommodations.push("Peer Support System");
    if (job.dedicated_workspace) accommodations.push("Dedicated Workspace");
    if (job.sensory_aids) accommodations.push("Sensory Aids Allowed");
    if (job.neurodiversity_awareness_training) accommodations.push("Neurodiversity Awareness Training");
    if (job.provide_visual_guidance) accommodations.push("Visual Project-Tracking Tool");
    if (job.regular_supervisor_check_in) accommodations.push("Regular Check-in with Supervisor");
    if (job.optional_social_event) accommodations.push("No Forced Social Events");
    if (job.zero_tolerance_bullying_mobbing_policy) accommodations.push("Zero Tolerance Policy for Bullying & Mobbing");
    if (job.mental_health_support) accommodations.push("Mental Health Support");
    if (job.augmentative_alternative_communication) accommodations.push("Alternative Communication App Allowed");
    if (job.near_public_transport) accommodations.push("Near Public Transport");

    // Calculate match score (simplified - in real app this would be more sophisticated)
    let matchScore = 70; // Base score
    if (accommodationsFriendly) matchScore += 15;
    if (job.work_mode === "Remote") matchScore += 5;
    if (job.flexible_work_hour) matchScore += 5;
    if (job.neurodiversity_awareness_training) matchScore += 5;

    return {
      id: job.id.toString(),
      title: job.job_title,
      company: job.employer_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Extract company name from email
      location: job.location,
      type: job.job_type,
      salary: SALARY_RANGES[job.salary_range] || `RM${job.salary_range}k - RM${job.salary_range + 20}k / annum`,
      salaryRange: job.salary_range, // Store the index for SALARY_RANGES
      postedDate: new Date().toISOString().split('T')[0], // Current date as placeholder
      matchScore: Math.min(matchScore, 100),
      accommodationsFriendly,
      description: job.job_summary,
      requirements: [...requirements, ...softSkills],
      benefits: accommodations, // Store accommodations in benefits field for compatibility
      accommodations: accommodations, // Also store in accommodations field
      companySize: "50-500 employees", // Default placeholder
      industry: "Technology", // Default placeholder
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      neurodivergentFriendly: accommodationsFriendly,
      primaryMatchScore: Math.min(matchScore, 100),
      secondaryMatchScore: Math.min(matchScore - 5, 95),
      tertiaryMatchScore: Math.min(matchScore - 10, 90),
    };
  };

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const jobsData: Job[] = await response.json();
        const transformedJobs = jobsData.map(transformJob);
        
        setJobs(transformedJobs);
        if (transformedJobs.length > 0) {
          setSelectedJob(transformedJobs[0]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Load applied and saved jobs status using authenticated session email
  const { data: session } = useSession();
  useEffect(() => {
    const loadJobStatus = async () => {
      try {
        const userEmail = session?.user?.email;
        if (!userEmail) return;
        console.log('Loading job status for:', userEmail);

        // Fetch applications
        const applicationsResponse = await fetch(`/api/applications?candidateEmail=${encodeURIComponent(userEmail)}`);
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          const appliedJobIds = new Set<string>(applications.map((app: any) => `${app.job_title}-${app.company}`));
          setAppliedJobs(appliedJobIds);
        }

        // Fetch saved jobs
        const savedJobsResponse = await fetch(`/api/saved-jobs?candidateEmail=${encodeURIComponent(userEmail)}`);
        if (savedJobsResponse.ok) {
          const savedJobsData = await savedJobsResponse.json();
          const savedJobKeys = new Set<string>(savedJobsData.map((job: any) => `${job.job_title}-${job.company}`));
          const savedJobIdMap = new Map<string, number>();
          savedJobsData.forEach((job: any) => {
            savedJobIdMap.set(`${job.job_title}-${job.company}`, job.id);
          });
          setSavedJobs(savedJobKeys);
          setSavedJobIds(savedJobIdMap);
        }
      } catch (error) {
        console.error('Error loading job status:', error);
      }
    };
    loadJobStatus();
  }, [session]);

  // Handle apply to job
  const handleApplyToJob = async (job: DisplayJob) => {
    console.log('Apply button clicked for job:', job.title);
    const jobKey = `${job.title}-${job.company}`;
    
    try {
      if (appliedJobs.has(jobKey)) {
        info('Already Applied', 'You have already applied to this job.');
        return;
      }
      
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before applying to jobs.');
        return;
      }

      // Check if user has a valid profile BEFORE setting loading state
      // This ensures profile validation is ALWAYS enforced
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please complete your profile or upload your resume to apply.');
        return;
      }

      // Only set loading state after validation passes
      setApplyingJobId(jobKey);

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_email: userEmail,
          job_id: parseInt(job.id),
          accommodations_requested: job.accommodationsFriendly
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success('Application Submitted!', 'Your application has been submitted successfully.');
        
        // Update applied jobs state
        setAppliedJobs(prev => new Set([...prev, jobKey]));
        // Emit event so dashboard can update Applications list immediately
        window.dispatchEvent(new CustomEvent('jobApplied', {
          detail: {
            id: parseInt(job.id),
            jobTitle: job.title,
            company: job.company,
            appliedDate: new Date().toISOString(),
            status: 'under_review',
            accommodationsRequested: job.accommodationsFriendly,
            location: job.location,
            salary: job.salary,
            matchScore: job.matchScore
          }
        }));
      } else {
        const errorData = await response.json();
        console.error('Application failed:', errorData);
        
        const msg = errorData.error || errorData.detail || 'Failed to apply to job';
        if (msg.toLowerCase().includes('already applied')) {
          info('Already Applied', 'You have already applied to this job.');
        } else if (msg.toLowerCase().includes('profile not found') || msg.toLowerCase().includes('upload a resume')) {
          showError('Profile Incomplete', 'Please complete your profile or upload your resume to apply.');
        } else {
          showError('Application Failed', msg);
        }
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      showError('Application Error', 'An error occurred while applying to the job. Please try again.');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Handle save job
  const handleSaveJob = async (job: DisplayJob) => {
    console.log('Save button clicked for job:', job.title);
    const jobKey = `${job.title}-${job.company}`;
    
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before saving jobs.');
        return;
      }
      
      // Check if already saved - if so, unsave it (allow unsaving without profile check)
      if (savedJobs.has(jobKey)) {
        setSavingJobId(jobKey);
        const savedJobId = savedJobIds.get(jobKey);
        if (savedJobId) {
          // Unsave the job
          const response = await fetch(`/api/saved-jobs?savedJobId=${savedJobId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            success('Job Removed', 'Job has been removed from your saved jobs.');
            
            // Update saved jobs state
            setSavedJobs(prev => {
              const newSet = new Set(prev);
              newSet.delete(jobKey);
              return newSet;
            });
            setSavedJobIds(prev => {
              const newMap = new Map(prev);
              newMap.delete(jobKey);
              return newMap;
            });
            window.dispatchEvent(new CustomEvent('jobUnsaved', {
              detail: {
                id: savedJobId,
                jobTitle: job.title,
                company: job.company
              }
            }));
          } else {
            const errorData = await response.json();
            console.error('Unsave job failed:', errorData);
            showError('Unsave Failed', errorData.error || 'Failed to unsave job');
          }
        }
        return;
      }

      // Check if user has a valid profile BEFORE setting loading state
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please complete your profile or upload your resume to save.');
        return;
      }

      // Only set loading state after validation passes
      setSavingJobId(jobKey);

      // Save the job
      const response = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_email: userEmail,
          job_id: parseInt(job.id)
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success('Job Saved!', 'Job has been saved to your saved jobs.');
        // Use real ID from backend response
        const savedId = result?.saved_job?.id;
        setSavedJobs(prev => new Set([...prev, jobKey]));
        if (savedId) {
          setSavedJobIds(prev => new Map([...prev, [jobKey, savedId]]));
        }
        window.dispatchEvent(new CustomEvent('jobSaved', {
          detail: {
            id: savedId || parseInt(job.id),
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            jobType: job.type,
            salary: job.salary,
            isInclusive: job.accommodationsFriendly
          }
        }));
      } else {
        const errorData = await response.json();
        console.error('Save job failed:', errorData);
        
        const msg = errorData.error || errorData.detail || 'Failed to save job';
        if (msg.toLowerCase().includes('profile not found') || msg.toLowerCase().includes('upload a resume')) {
          showError('Profile Incomplete', 'Please complete your profile or upload your resume to save.');
        } else {
          showError('Save Failed', msg);
        }
      }
    } catch (err) {
      console.error('Error saving job:', err);
      showError('Save Error', 'An error occurred while saving the job. Please try again.');
    } finally {
      setSavingJobId(null);
    }
  };

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
    if (filteredJobs.length > 0 && (!selectedJob || !filteredJobs.find(job => job.id === selectedJob.id))) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
          <p className="text-[#6f7a80]">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="text-center">
          {/* <div className="text-red-500 text-6xl mb-4">⚠️</div> */}
          <h2 className="text-2xl font-bold text-[#3a4043] mb-2">Error Loading Jobs</h2>
          <p className="text-[#6f7a80] mb-4">{fetchError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#635bff] hover:bg-[#524aff] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
        {/* Search and Filters - Sticky at Top */}
        <Card className="mb-3 sticky top-22 z-10">
          <CardContent className="p-4">
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

                <Select value={filterType} onValueChange={setFilterType}>
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

                <Select value={sortBy} onValueChange={setSortBy}>
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
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Main Content */}
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
                                selectedJob?.id === job.id 
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
                                        {job.salaryRange !== undefined && SALARY_RANGES[job.salaryRange] ? SALARY_RANGES[job.salaryRange] : job.salary}
                                    </span>
                                    </div>

                                    <p className="text-[#6f7a80] text-sm mb-3 line-clamp-3 overflow-hidden">
                                    {job.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                                    <span>Posted: {job.postedDate}</span>
                                    <span>Deadline: {job.applicationDeadline}</span>
                                    </div>
                                </div>

                                {/* RIGHT BUTTONS AND HEART */}
                                <div className="flex flex-col justify-between items-end gap-2 sm:self-start shrink-0">
                                    <Button
                                    size="sm"
                                    className={`w-full sm:w-auto ${
                                        appliedJobs.has(`${job.title}-${job.company}`)
                                        ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white"
                                        : "bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
                                    }`}
                                    disabled={applyingJobId === `${job.title}-${job.company}` || appliedJobs.has(`${job.title}-${job.company}`)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApplyToJob(job);
                                    }}
                                    >
                                    {applyingJobId === `${job.title}-${job.company}` ? "Applying..." : (appliedJobs.has(`${job.title}-${job.company}`) ? "Applied" : "Apply")}
                                    </Button>
                                    <button
                                    className={`p-2 rounded-md transition-colors cursor-pointer ${
                                        savedJobs.has(`${job.title}-${job.company}`)
                                        ? "text-red-500 hover:bg-red-50"
                                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    }`}
                                    disabled={savingJobId === `${job.title}-${job.company}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveJob(job);
                                    }}
                                    >
                                    <Heart className={`w-5 h-5 ${savedJobs.has(`${job.title}-${job.company}`) ? "fill-red-500" : ""}`} />
                                    </button>
                                </div>
                                </div>
                            </CardContent>
                            </Card>

                    </motion.div>
                    ))}

              {/* No Results */}
              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-gray-600 mb-2">No jobs found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Try adjusting your search criteria or filters to find more opportunities.
                    </p>
                    <Button 
                      size="sm"
                      className="bg-[#635bff] hover:bg-[#5748e5] text-white"
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
          <div className="lg:col-span-1 xl:col-span-3">
            {selectedJob ? (
            <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                      {selectedJob?.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {selectedJob?.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedJob?.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6f7a80]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedJob?.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {selectedJob?.salaryRange !== undefined && SALARY_RANGES[selectedJob.salaryRange] ? SALARY_RANGES[selectedJob.salaryRange] : selectedJob?.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge className={`${getMatchScoreColor(selectedJob?.matchScore || 0)} bg-opacity-10 text-lg px-4 py-2`}>
                      {selectedJob?.matchScore}% match
                    </Badge>
                    <button
                      className={`p-2 rounded-md transition-colors cursor-pointer ${
                        savedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                      disabled={savingJobId === `${selectedJob?.title}-${selectedJob?.company}`}
                      onClick={() => selectedJob && handleSaveJob(selectedJob)}
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`) ? "fill-red-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Job Description */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Job Description</h4>
                  <p className="text-[#6f7a80] break-words leading-relaxed whitespace-pre-line">{selectedJob?.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob?.requirements && selectedJob.requirements.length > 0 ? (
                      selectedJob.requirements.map((req, reqIndex) => (
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
                    {selectedJob?.accommodations && selectedJob.accommodations.length > 0 ? (
                      selectedJob.accommodations.map((accommodation, accommodationIndex) => (
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
                      <span>{selectedJob?.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Company Size:</span>
                      <span>{selectedJob?.companySize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posted:</span>
                      <span>{selectedJob?.postedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application Deadline:</span>
                      <span>{selectedJob?.applicationDeadline}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Matching Score - Expandable */}
                <div className="pt-4 border-t border-[#e8e6f0]">
                  <button
                    onClick={() => setExpandedMatchingScore(expandedMatchingScore === selectedJob?.id ? null : selectedJob?.id || null)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-[#635BFF]">View Matching Detail</span>
                    {expandedMatchingScore === selectedJob?.id ? (
                      <ChevronUp className="h-5 w-5 text-[#6f7a80]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#6f7a80]" />
                    )}
                  </button>
                  {expandedMatchingScore === selectedJob?.id && selectedJob && (() => {
                    const primaryMatchScore = selectedJob.primaryMatchScore || selectedJob.matchScore || 96;
                    const secondaryMatchScore = selectedJob.secondaryMatchScore || 90;
                    const tertiaryMatchScore = selectedJob.tertiaryMatchScore || 85;
                    const overallMatchScore = selectedJob.matchScore;

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

                {/* Action Buttons */}
                <div className="flex flex-row gap-3 pt-4 border-t border-[#e8e6f0]">
                  <Button 
                    className={`w-[50%] ${
                      appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)
                      ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white"
                                        : "bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
                    }`}
                    disabled={applyingJobId === `${selectedJob?.title}-${selectedJob?.company}` || appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)}
                    onClick={() => selectedJob && handleApplyToJob(selectedJob)}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    {applyingJobId === `${selectedJob?.title}-${selectedJob?.company}` ? "Applying..." : (appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`) ? "Applied" : "Apply Now")}
                  </Button>
                  <Button variant="outline" className="w-[50%] border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer">
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
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No job selected</h3>
                  <p className="text-sm text-gray-500">
                    Click on a job from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}

// export default function CandidateJobListing() {
//   return (
//     <ToastProvider>
//       <div>
//         <CandidateJobListingContent />
//       </div>
//     </ToastProvider>
//   );
// }
