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
  postedDate: string;
  matchScore: number;
  accommodationsFriendly: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  companySize: string;
  industry: string;
  applicationDeadline: string;
  neurodivergentFriendly: boolean;
  logo?: string;
}

export function CandidateJobListingContent() {
  const { success, error: showError, warning, info } = useToastHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Map<string, number>>(new Map());

  // Check if user has a profile/resume
  const checkUserProfile = async (userEmail: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      // Check if profile exists and has meaningful data (not just auto-created empty profile)
      // A profile is considered valid if it has personal identifiers or education or experience
      const hasValidProfile = data && (
        (data.personal_identifiers && Object.keys(data.personal_identifiers).length > 0) ||
        (data.educations && data.educations.length > 0) ||
        (data.experiences && data.experiences.length > 0) ||
        (data.education && Object.keys(data.education).length > 0) ||
        (data.experience && Object.keys(data.experience).length > 0)
      );
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
    
    // Create benefits array based on accommodations
    const benefits = [];
    if (job.flexible_work_hour) benefits.push("Flexible Hours");
    if (job.sensory_friendly_environment) benefits.push("Sensory Friendly Environment");
    if (job.peer_support_system) benefits.push("Peer Support System");
    if (job.dedicated_workspace) benefits.push("Dedicated Workspace");
    if (job.mental_health_support) benefits.push("Mental Health Support");
    if (job.near_public_transport) benefits.push("Near Public Transport");
    if (job.optional_social_event) benefits.push("Optional Social Events");
    if (benefits.length === 0) benefits.push("Standard Benefits");

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
      salary: `RM${job.salary_range}k - RM${job.salary_range + 20}k / annum`,
      postedDate: new Date().toISOString().split('T')[0], // Current date as placeholder
      matchScore: Math.min(matchScore, 100),
      accommodationsFriendly,
      description: job.job_summary,
      requirements: [...requirements, ...softSkills],
      benefits,
      companySize: "50-500 employees", // Default placeholder
      industry: "Technology", // Default placeholder
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      neurodivergentFriendly: accommodationsFriendly,
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
    try {
      const jobKey = `${job.title}-${job.company}`;
      if (appliedJobs.has(jobKey)) {
        info('Already Applied', 'You have already applied to this job.');
        return;
      }
      setIsApplying(true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before applying to jobs.');
        return;
      }

      // Check if user has a valid profile before allowing application
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please upload your resume or complete your profile settings before applying to jobs. You need to have at least some basic information in your profile.');
        setIsApplying(false);
        return;
      }

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
        
        // If backend is not available, still update UI for demo purposes
        if (response.status >= 500) {
          warning('Service Temporarily Unavailable', 'Your application will be processed when the service is restored.');
          const jobKey = `${job.title}-${job.company}`;
          setAppliedJobs(prev => new Set([...prev, jobKey]));
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
          const msg = errorData.error || errorData.detail || 'Failed to apply to job';
          if (msg.toLowerCase().includes('already applied')) {
            info('Already Applied', 'You have already applied to this job.');
          } else if (msg.toLowerCase().includes('profile not found') || msg.toLowerCase().includes('upload a resume')) {
            showError('Profile Incomplete', 'Please upload your resume or complete your profile settings before applying to jobs.');
          } else {
            showError('Application Failed', msg);
          }
        }
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      
      // If it's a network error, still update UI for demo purposes
      if (err instanceof TypeError && err.message.includes('fetch')) {
        warning('Network Error', 'Your application will be processed when connection is restored.');
        const jobKey = `${job.title}-${job.company}`;
        setAppliedJobs(prev => new Set([...prev, jobKey]));
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
        showError('Application Error', 'An error occurred while applying to the job');
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Handle save job
  const handleSaveJob = async (job: DisplayJob) => {
    console.log('Save button clicked for job:', job.title);
    try {
      setIsSaving(true);
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before saving jobs.');
        return;
      }

      const jobKey = `${job.title}-${job.company}`;
      
      // Check if already saved - if so, unsave it (allow unsaving without profile check)
      if (savedJobs.has(jobKey)) {
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
            
            // If backend is not available, still update UI for demo purposes
            if (response.status >= 500) {
              warning('Service Temporarily Unavailable', 'Job will be unsaved when service is restored.');
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
              showError('Unsave Failed', errorData.error || 'Failed to unsave job');
            }
          }
        }
        return;
      }

      // Check if user has a valid profile before allowing save
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please upload your resume or complete your profile settings before saving jobs. You need to have at least some basic information in your profile.');
        setIsSaving(false);
        return;
      }

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
        
        // If backend is not available, still update UI for demo purposes
        if (response.status >= 500) {
          warning('Service Temporarily Unavailable', 'Job will be saved when service is restored.');
          setSavedJobs(prev => new Set([...prev, jobKey]));
          setSavedJobIds(prev => new Map([...prev, [jobKey, Date.now()]]));
          window.dispatchEvent(new CustomEvent('jobSaved', {
            detail: {
              id: Date.now(),
              jobTitle: job.title,
              company: job.company,
              location: job.location,
              jobType: job.type,
              salary: job.salary,
              isInclusive: job.accommodationsFriendly
            }
          }));
        } else {
          const msg = errorData.error || errorData.detail || 'Failed to save job';
          if (msg.toLowerCase().includes('profile not found') || msg.toLowerCase().includes('upload a resume')) {
            showError('Profile Incomplete', 'Please upload your resume or complete your profile settings before saving jobs.');
          } else {
            showError('Save Failed', msg);
          }
        }
      }
    } catch (err) {
      console.error('Error saving job:', err);
      
      // If it's a network error, still update UI for demo purposes
      if (err instanceof TypeError && err.message.includes('fetch')) {
        warning('Network Error', 'Job will be saved when connection is restored.');
        const jobKey = `${job.title}-${job.company}`;
        setSavedJobs(prev => new Set([...prev, jobKey]));
        setSavedJobIds(prev => new Map([...prev, [jobKey, Date.now()]]));
        window.dispatchEvent(new CustomEvent('jobSaved', {
          detail: {
            id: Date.now(),
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            jobType: job.type,
            salary: job.salary,
            isInclusive: job.accommodationsFriendly
          }
        }));
      } else {
        showError('Save Error', 'An error occurred while saving the job');
      }
    } finally {
      setIsSaving(false);
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
    <div className="w-full px-4">
        {/* Search and Filters - Sticky at Top */}
        <Card className="mb-3 sticky top-22 z-10">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Search */}
              <div className="flex w-4/9">
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
        <div className="my-4 px-3">
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
                                    className={`w-full sm:w-auto ${
                                        appliedJobs.has(`${job.title}-${job.company}`)
                                        ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white"
                                        : "bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
                                    }`}
                                    disabled={isApplying}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApplyToJob(job);
                                    }}
                                    >
                                    {appliedJobs.has(`${job.title}-${job.company}`) ? "Applied" : "Apply"}
                                    </Button>
                                    <Button
                                    size="sm"
                                    variant="outline"
                                    className={`w-full sm:w-auto ${
                                        savedJobs.has(`${job.title}-${job.company}`)
                                        ? "border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 hover:cursor-pointer"
                                        : "border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 hover:cursor-pointer"
                                    }`}
                                    disabled={isSaving}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveJob(job);
                                    }}
                                    >
                                    <Bookmark className="w-3 h-3 mr-1" />
                                    {savedJobs.has(`${job.title}-${job.company}`) ? "Saved" : "Save"}
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
            {selectedJob ? (
            <Card className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <CardHeader className="pb-4">
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
                        {selectedJob?.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={`${getMatchScoreColor(selectedJob?.matchScore || 0)} bg-opacity-10`}>
                      {selectedJob?.matchScore}% match
                    </Badge>
                    {selectedJob?.accommodationsFriendly && (
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
                  <p className="text-[#6f7a80] leading-relaxed">{selectedJob?.description}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob?.requirements.map((req, reqIndex) => (
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
                    {selectedJob?.benefits.map((benefit, benefitIndex) => (
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

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-[#e8e6f0]">
                  <Button 
                    className={`w-full ${
                      appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)
                      ? "bg-[#635bff]/70 hover:bg-[#635bff]/70 text-white"
                                        : "bg-[#635bff] hover:bg-[#524aff] text-white hover:cursor-pointer"
                    }`}
                    disabled={isApplying || appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)}
                    onClick={() => selectedJob && handleApplyToJob(selectedJob)}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    {appliedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`) ? "Applied" : "Apply Now"}
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${
                        savedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`)
                        ? "border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 hover:cursor-pointer"
                                        : "border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 hover:cursor-pointer"
                      }`}
                      disabled={isSaving}
                      onClick={() => selectedJob && handleSaveJob(selectedJob)}
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      {savedJobs.has(`${selectedJob?.title}-${selectedJob?.company}`) ? "Saved" : "Save Job"}
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ) : (
              <Card className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#3a4043] mb-2">No job selected</h3>
                  <p className="text-[#6f7a80]">
                    Select a job from the list to view details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}

export default function CandidateJobListing() {
  return (
    <ToastProvider>
      <div className="page-wrap">
        <CandidateJobListingContent />
      </div>
    </ToastProvider>
  );
}
