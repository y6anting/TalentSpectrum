"use client";

import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { useToastHelpers } from "@/components/ui/toast";
import {
  User, Briefcase, Heart, Eye, Settings, Book, House, Clock, CheckCircle, XCircle, MapPin, DollarSign, Shield, Plus, X, BrainCircuit,
  Camera, LayoutDashboard, Search, LetterTextIcon, HandFist, UserStar, MessagesSquare, CalendarClock, FileText, Bookmark, Share
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Input } from "@/app/components/input";
import { Skeleton, ProfileSkeleton } from "@/app/components/loading-skeleton";
import { ProfileSubmission } from "../components/ProfileSubmission";
import { EducationSubmission } from "../components/EducationSubmission";
import { ExperienceSkillsSubmission } from "../components/ExperienceSkillsSubmission";
import { EnvironmentSubmission } from "../components/EnvironmentSubmission";
import { SkillsSubmission } from "../components/SkillsSubmission";
import { NeuroStrengthSubmission } from "../components/NeuroStrengthSubmission";
import ResumeUploadButton from "@/app/components/resume-upload/ResumeUploadButton";
import { useSession } from "next-auth/react";
import MockInterviewSetupPage from "./mock-interview/setup/page";
import MockInterviewFeedbackPage from "./mock-interview/feedback/page";
import MockInterviewProcessPage from "./mock-interview/interviewprocess/page";
import InterviewHistoryPage from "./mock-interview/history/page";
import InterviewReportDetailPage from "./mock-interview/history/[id]/page";
import ReportPage from "./Report/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AppointmentPage from "./Appointment/page";
import CandidateJobListing from "../JobListing/page";
import OverviewPage from "./Overview/page";
import ApplicationsPage from "./Applications/page";
import SavedJobsPage from "./SavedJobs/page";
import ProfileConfigPage from "./ProfileConfig/page";
import EducationPage from "./Education/page";
import ExperiencePage from "./Experience/page";
import SkillsPage from "./Skills/page";
import EnvironmentPage from "./Environment/page";
import NeuroStrengthsPage from "./NeuroStrengths/page";

export default function CandidateDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const { success, error: showError, warning, info } = useToastHelpers();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mockInterviewStep, setMockInterviewStep] = useState<"setup" | "process" | "feedback" | "history" | "history-detail">("setup");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [showMatchingScoreDialog, setShowMatchingScoreDialog] = useState(false);
  // Signal to refetch profile after resume upload or profile save
  const [resumeRefreshSignal, setResumeRefreshSignal] = useState(0);
  const [isRunningAiMatch, setIsRunningAiMatch] = useState(false);
  
  // Profile picture state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  
  // Function to trigger profile refresh (without resetting user's current form state)
  const refreshProfileData = () => {
    // Only dispatch event for other components to refresh, don't trigger full data refetch
    // that would reset user's current form inputs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    }
    // Note: We removed setResumeRefreshSignal to prevent full data refetch
    // which was causing form state to reset
  };

  const handleRunAiMatching = async () => {
    if (isRunningAiMatch) return;
    setIsRunningAiMatch(true);
    try {
      // Get candidate email from session
      const candidateEmail = session?.user?.email;
      if (!candidateEmail) {
        showError("Authentication Required", "Please sign in to run AI matching.");
        setIsRunningAiMatch(false);
        return;
      }
      
      console.log("🚀 Starting AI Matching for candidate:", candidateEmail);
      
      const response = await fetch(`/api/ai-matching/run_matching?candidate_email=${encodeURIComponent(candidateEmail)}`, {
        method: "POST",
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? await response.json() : null;

      console.log("📡 AI Matching API Response:", {
        ok: response.ok,
        status: response.status,
        payload: payload
      });

      if (!response.ok) {
        const errorMessage =
          (payload && (payload.detail?.message || payload.detail || payload.error || payload.message)) ||
          "Failed to trigger AI job matching.";
        console.error("❌ AI Matching failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const message = (payload && (payload.message || payload.detail)) || "AI job matching completed successfully.";
      console.log("✅ AI Matching completed:", message);
      
      // Fetch match results after completion to verify scores
      console.log("🔍 Fetching updated match results...");
      const matchResponse = await fetch(`/api/match-results?candidate_email=${encodeURIComponent(candidateEmail)}`);
      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        console.log("📊 Match Results Retrieved:", {
          totalMatches: matchData.length,
          matches: matchData.map((m: any) => ({
            job_id: m.job_id,
            job_title: m.job_title,
            total_score: m.total_score,
            primary_score: m.primary_score,
            secondary_score: m.secondary_score,
            tertiary_score: m.tertiary_score
          }))
        });
        
        // Dispatch event to refresh match scores across all components
        window.dispatchEvent(new CustomEvent('matchScoresUpdated', {
          detail: { candidateEmail, matchData }
        }));
        console.log("📢 Dispatched 'matchScoresUpdated' event to refresh scores across the app");
      } else {
        console.warn("⚠️ Failed to fetch match results after matching:", matchResponse.status);
      }
      
      success("AI Matching Completed", message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to trigger AI job matching.";
      console.error("❌ AI Matching error:", error);
      showError("AI Matching Failed", errorMessage);
    } finally {
      setIsRunningAiMatch(false);
    }
  };

  // Function to handle profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    const candidateEmail = session?.user?.email;
    if (!candidateEmail) {
      showError("Not Logged In", "Please log in to upload a profile picture.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/profiles/${encodeURIComponent(candidateEmail)}/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newPictureUrl = data.profile_picture_url;
        
        console.log("Profile picture uploaded successfully. Backend returned:", newPictureUrl);
        
        // Update profile picture state immediately
        setProfilePictureUrl(newPictureUrl);
        
        // Update candidateProfile state with the new profile_picture_url for consistency
        setCandidateProfile(prev => ({
          ...prev,
          profilePictureUrl: newPictureUrl,
          personalIdentifiers: {
            ...prev.personalIdentifiers,
            profile_picture_url: newPictureUrl
          }
        }));
        
        success("Profile Picture Uploaded", "Profile picture uploaded successfully!");
      } else {
        const errorText = await response.text();
        console.error("Error uploading profile picture:", errorText);
        showError("Upload Failed", `Failed to upload profile picture: ${errorText}`);
      }
    } catch (error) {
      console.error("Network error during profile picture upload:", error);
      showError("Network Error", "An error occurred during profile picture upload.");
    }
  };

  // Handler for when a file is selected
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleProfilePictureUpload(event.target.files[0]);
      // Clear the file input so the same file can be selected again
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedResumeEmail = sessionStorage.getItem("resumeParsedEmail");
    if (!session?.user?.email) {
      if (storedResumeEmail) {
        sessionStorage.removeItem("resumeParsedEmail");
      }
      return;
    }
    if (storedResumeEmail && storedResumeEmail !== session.user.email) {
      sessionStorage.removeItem("resumeParsedEmail");
    }
  }, [session?.user?.email]);

  type Environment = {
    patternRecognition: string;
    attention: string;
    systematicThinking: string;
    bigVsDetail: string;
    taskSwitching: string;
    hyperfocus: string;
    communicationMedium: string;
    clarity: string;
    teamStyle: string;
    presentationComfort: string;
    checkIns: string;
    jobCoach: string;
    auditory: string;
    visual: string;
    workspace: string;
    workdayStructure: string;
  };

  type Education = {
    id: number;
    level: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number | null;
    cgpa_grade: string;
    award: string;
  };

  type Experience = {
    id: number;
    employer: string;
    title: string;
    industry: string;
    start: string;
    end: string;
    isCurrent: boolean;
    seniorityLevel: string;
    skillsToolsUsed: string;
    projectHighlights: string;
    achievements: string;
  };

  type CandidateProfile = {
    name: string;
    email: string;
    location: string;
    profileCompletion: number;
    accommodations: string[];
    profilePictureUrl?: string | null;
    preferences: {
      workType: string;
      communication: string;
      schedule: string;
    };
    personalIdentifiers: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      nationality: string;
      emailAddress: string;
      phoneNumber: string;
      residentialAddress: string;
      nric: string;
      oku_card: string;
      linkedin: string;
      preferred_role: string;
      preferred_industry: string;
      preferred_location: string;
    };
    education: {
      level: string;
      fieldOfStudy: string;
      institution: string | null;
      graduationYear: number | null;
      cgpa: number | null;
      grade: string | null;
      award: string | null;
    };
    exp_skill: {
      employer: string;
      industry: string;
      start: string;
      end: string;
      RoleTitle: string;
      YearsInRole: string;
      SeniorityLevel: string;
      SkillsToolsUsed: string;
      ProjectHighlights: string;
      HardSkills: string;
      SoftSkills: string;
      LanguageProficiency: string;
      TechnicalKeywords: string;
      Achievements: string;
    };
    environment: Environment;
  };

  // State for applications and saved jobs
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  
  // State for tracking saved job keys and IDs (for save/unsave functionality)
  const [savedJobKeys, setSavedJobKeys] = useState<Set<string>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Map<string, number>>(new Map());
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  
  // State for tracking applied jobs (for Apply button functionality)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  
  // Search and filter states
  const [applicationSearchTerm, setApplicationSearchTerm] = useState("");
  const [savedJobsSearchTerm, setSavedJobsSearchTerm] = useState("");
  const [applicationFilterStatus, setApplicationFilterStatus] = useState("all");
  const [applicationFilterLocation, setApplicationFilterLocation] = useState("all");
  const [applicationFilterType, setApplicationFilterType] = useState("all");
  const [applicationSortBy, setApplicationSortBy] = useState("recent");
  const [savedJobsFilterLocation, setSavedJobsFilterLocation] = useState("all");
  const [savedJobsFilterType, setSavedJobsFilterType] = useState("all");
  const [savedJobsSortBy, setSavedJobsSortBy] = useState("recent");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [selectedSavedJob, setSelectedSavedJob] = useState<any | null>(null);
  
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    name: session?.user?.name || "",  
    email: "",
    location: "Remote",
    profileCompletion: 85,
    profilePictureUrl: null,
    accommodations: ["Flexible hours", "Quiet workspace", "Written instructions"],
    preferences: {
      workType: "Remote",
      communication: "Email preferred",
      schedule: "Flexible hours",
    },
    personalIdentifiers: {
      fullName: session?.user?.name || "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      emailAddress: session?.user?.email || "",
      phoneNumber: "",
      residentialAddress: "",
      nric: "",
      oku_card: "",
      linkedin: "",
      preferred_role: "",
      preferred_industry: "",
      preferred_location: "",
    },
    education: {
      level: "",
      fieldOfStudy: "",
      institution: null,
      graduationYear: null,
      cgpa: null,
      grade: null,
      award: null,
    },
    exp_skill: {
      employer: "",
      industry: "",
      start: "",
      end: "",
      RoleTitle: "",
      YearsInRole: "",
      SeniorityLevel: "",
      SkillsToolsUsed: "",
      ProjectHighlights: "",
      HardSkills: "",
      SoftSkills: "",
      LanguageProficiency: "",
      TechnicalKeywords: "",
      Achievements: "",
    },
    environment: {
      patternRecognition: "",
      attention: "",
      systematicThinking: "",
      bigVsDetail: "",
      taskSwitching: "",
      hyperfocus: "",
      communicationMedium: "",
      clarity: "",
      teamStyle: "",
      presentationComfort: "",
      checkIns: "",
      jobCoach: "",
      auditory: "",
      visual: "",
      workspace: "",
      workdayStructure: "",
    },
  });

  const [educations, setEducations] = useState<Education[]>([
    {
      id: Date.now(),
      level: "",
      fieldOfStudy: "",
      institution: "",
      graduationYear: null,
      cgpa_grade: "",
      award: "",
    },
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: Date.now(),
      employer: "",
      title: "",
      industry: "",
      start: "",
      end: "",
      isCurrent: true,
      seniorityLevel: "",
      skillsToolsUsed: "",
      projectHighlights: "",
      achievements: "",
    },
  ]);

  type LanguageProficiency = {
    id: number;
    language: string;
    reading: string;
    writing: string;
    listening: string;
    speaking: string;
  };

  const [languageProficiencies, setLanguageProficiencies] = useState<LanguageProficiency[]>([
    {
      id: Date.now(),
      language: "",
      reading: "",
      writing: "",
      listening: "",
      speaking: "",
    }
  ]);

  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);

  const toggleStrength = (strength: string) => {
    setSelectedStrengths(prev => {
      if (prev.includes(strength)) {
        return prev.filter(s => s !== strength);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, strength];
    });
  };

  const strengthOptions = [
    'Adaptability',
    'Analytical',
    'Athletic Performer',
    'Authenticity',
    'Committed to Succeed',
    'Creative Thinker',
    'Curiosity',
    'Deep Empathizer',
    'Dependable',
    'Detail-oriented Thinker',
    'Entrepreneurial',
    'Fact Retainer',
    'Geo-spatial Thinker',
    'Great Storyteller',
    'High Energy & Enthusiasm',
    'Honesty',
    'Hyperfocus',
    'Innovative Thinker',
    'Integrity',
    'Lateral Thinking',
    'Mathematical Thinker',
    'Methodical Task Executor',
    'Out of the Box Problem Solver',
    'Patient',
    'Pattern Recognition',
    'Precision',
    'Process Oriented',
    'Reliable',
    'Resilience',
    'Self Starter',
    'Socially Savvy',
    'Strong Crisis Management',
    'Strong Moral Compass',
    'Strong Emotional Intelligence',
    'Strong Sense of Justice or Fairness',
    'Strong Task Persistence',
    'Tech or Computer Savvy',
    'Visual Memorizer',
  ];



  // // Initialize email from sessionStorage on component mount
  // useEffect(() => {
  //   if (status === "loading") return; // Wait until session is ready
  //   if (!session?.user?.email) return; // No email yet (not logged in)

  //   const sessionEmail = session.user.email;

  //   // Only set if candidateProfile.email is empty
  //   if (!candidateProfile.email) {
  //     setCandidateProfile((prev) => ({
  //       ...prev,
  //       email: sessionEmail,
  //       personalIdentifiers: {
  //         ...prev.personalIdentifiers,
  //         emailAddress: sessionEmail,
  //       },
  //     }));
  //   }
  // }, [status, session?.user?.email, candidateProfile.email]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      let preferredEmail = "";
      try {
      setIsLoading(true);
      if (status === "loading") {
        console.log("Session status: loading, returning.");
        return;
      }
      if (status === "unauthenticated") {
        console.log("Session status: unauthenticated, redirecting.");
        router.push("/auth/signin");
        setIsLoading(false);
        return;
      }

      console.log('Full session object:', session); // Add this
      console.log('Session user email:', session?.user?.email); // Add this

      // Always use login email as primary - backend will handle linking resume email
      preferredEmail = session?.user?.email || "";

      if (!preferredEmail) {
        console.error('No email available to fetch profile.');
        setIsLoading(false);
        return;
      }
        
        const candidate_email = encodeURIComponent(preferredEmail);
        console.log('Using email for profile fetch:', preferredEmail);

        const response = await fetch(`${API_BASE}/profiles/${candidate_email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          console.log('Personal Identifiers from API:', data.personal_identifiers);
          console.log('Educations from API:', data.educations);
          console.log('Experiences from API:', data.experiences);
          if (data) {
            // Update candidate profile with fetched data
            const updatedProfile = {
              ...candidateProfile,
              name: data.name || candidateProfile.name,
              email: data.email || data.personal_identifiers?.emailAddress || preferredEmail || candidateProfile.email,
              location: data.location || candidateProfile.location,
              profileCompletion: data.profile_completion || candidateProfile.profileCompletion,
              accommodations: data.accommodations || candidateProfile.accommodations,
              profilePictureUrl: data.profile_picture_url || candidateProfile.profilePictureUrl,
              preferences: data.preferences || candidateProfile.preferences,
              personalIdentifiers: {
                ...candidateProfile.personalIdentifiers,
                ...data.personal_identifiers,
                emailAddress: data.personal_identifiers?.emailAddress || data.email || preferredEmail || candidateProfile.personalIdentifiers.emailAddress
              },
              education: {
                ...candidateProfile.education,
                ...data.education
              },
              exp_skill: {
                ...candidateProfile.exp_skill,
                ...data.experience,
                ...data.skills
              },
              environment: {
                ...candidateProfile.environment,
                ...data.environment
              },
            };
            
            // Update profile picture state from API response
            // The backend extracts profile_picture_url from personal_identifiers
            const pictureUrl = data.profile_picture_url || data.personal_identifiers?.profile_picture_url;
            if (pictureUrl) {
              setProfilePictureUrl(pictureUrl);
              console.log('Profile picture URL loaded:', pictureUrl);
            } else {
              // If not in top level, check personal_identifiers
              const picFromIdentifiers = updatedProfile.personalIdentifiers?.profile_picture_url;
              if (picFromIdentifiers) {
                setProfilePictureUrl(picFromIdentifiers);
                console.log('Profile picture URL loaded from personal_identifiers:', picFromIdentifiers);
              }
            }
            
            // Ensure profilePictureUrl is set in updatedProfile
            if (pictureUrl) {
              updatedProfile.profilePictureUrl = pictureUrl;
            }
            
            console.log('Updated personalIdentifiers:', updatedProfile.personalIdentifiers);
            setCandidateProfile(updatedProfile);

            // Helper function to map education data
            const mapEducation = (edu: any, isFromArray = true) => {
              console.log('Mapping education:', edu);
              return {
                id: isFromArray ? edu.id : Date.now(),
                level: edu.level || "",
                fieldOfStudy: edu.fieldOfStudy || edu.field_of_study || "",  // Handle both field name formats
                institution: edu.institution || "",
                graduationYear: edu.graduationYear || edu.graduation_year || null,  // Handle both field name formats
                cgpa_grade: edu.grade || edu.cgpa_grade || "",
                award: edu.award || "",
              };
            };

            // Set educations from API response
            if (data.educations?.length > 0) {
              setEducations(data.educations.map((edu: any) => mapEducation(edu)));
            } else if (data.education && Object.keys(data.education).length > 0) {
              setEducations([mapEducation(data.education, false)]);
            } else if (educations.length === 0) {
              setEducations([mapEducation({})]);
            }
            // Helper function to map experience data
            const mapExperience = (exp: any) => {
              console.log('Mapping experience:', exp);
              return {
                id: exp.id || Date.now(),
                employer: exp.employer || "",
                title: exp.title || "",
                industry: exp.industry || "",
                start: exp.start || exp.start_date || "",  // Handle both field name formats
                end: exp.end || exp.end_date || "",  // Handle both field name formats
                isCurrent: exp.isCurrent !== undefined ? exp.isCurrent : false,
                seniorityLevel: exp.seniorityLevel || exp.seniority_level || "",  // Handle both field name formats
                skillsToolsUsed: exp.skillsToolsUsed || exp.skills_tools_used || "",  // Handle both field name formats
                projectHighlights: exp.projectHighlights || exp.project_highlights || "",  // Handle both field name formats
                achievements: exp.achievements || "",
              };
            };

            // Set experiences from API response
            if (data.experiences?.length > 0) {
              setExperiences(data.experiences.map((exp: any) => mapExperience(exp)));
            } else if (experiences.length === 0) {
              setExperiences([mapExperience({})]);
            }

            // Set language proficiencies from API response
            if (data.language_proficiencies?.length > 0) {
              setLanguageProficiencies(data.language_proficiencies);
            } else if (languageProficiencies.length === 0) {
              setLanguageProficiencies([{
                id: Date.now(),
                language: "",
                reading: "",
                writing: "",
                listening: "",
                speaking: "",
              }]);
            }

            // Set neurodivergent strengths from API response
            // Only set on initial load (when selectedStrengths is empty) to prevent overwriting user's current selections
            // Resume uploads will trigger refreshSignal > 0, but we preserve user's current selections
            if (data.neurodivergent_strengths?.length > 0) {
              if (selectedStrengths.length === 0) {
                // Initial load - set from database
              setSelectedStrengths(data.neurodivergent_strengths);
              }
              // If user already has selections, don't overwrite them
              // This prevents the "refresh" from resetting user's form state
            }
            
            setDataLoaded(true);
          } else {
            console.error('No data in response:', data);
            
            // If no data but we have email, at least populate the email field
            if (preferredEmail) {
              setCandidateProfile(prev => ({
                ...prev,
                email: preferredEmail,
                personalIdentifiers: {
                  ...prev.personalIdentifiers,
                  emailAddress: preferredEmail
                }
              }));
            }
          }
          setIsLoading(false);
        } else if (response.status === 404) {
          console.log('Profile not found, creating new profile with email');
          
          // If profile not found but we have email, create a basic profile
          if (preferredEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: preferredEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: preferredEmail
              }
            }));
          }
          
          setDataLoaded(true);
          setIsLoading(false);
        } else {
          console.error('API request failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          // If API fails but we have email, at least populate the email field
          if (preferredEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: preferredEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: preferredEmail
              }
            }));
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        if (preferredEmail) {
          setCandidateProfile(prev => ({
            ...prev,
            email: preferredEmail,
            personalIdentifiers: {
              ...prev.personalIdentifiers,
              emailAddress: preferredEmail
            }
          }));
        }
        
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [status, session, resumeRefreshSignal]);

  // Listen for navigation to profile from job listing
  useEffect(() => {
    const handleNavigateToProfile = () => {
      setActiveTab("profile");
    };
    
    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
    };
  }, []);

    useEffect(() => {
    const fetchEducationData = async () => {
      if (status === "loading") return;
      // Always use login email - backend handles linking resume email
      const preferredEmail = session?.user?.email || "";
      if (!preferredEmail) return;

      setIsLoading(true);


      try {
        const response = await fetch(
          `${API_BASE}/profiles/${encodeURIComponent(preferredEmail)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch candidate profile");
        }

        const data = await response.json();

        // ✅ Check if education data exists and is valid - check both 'education' and 'educations' fields
        if (data.educations && Array.isArray(data.educations) && data.educations.length > 0) {
          setEducations(data.educations);
        } else if (data.education && Array.isArray(data.education) && data.education.length > 0) {
          setEducations(data.education);
        } else {
          // no existing data, keep default empty education
          setEducations([
            {
              id: Date.now(),
              level: "",
              fieldOfStudy: "",
              institution: "",
              graduationYear: null,
              cgpa_grade: "",
              award: "",
            },
          ]);
        }
      } catch (err: any) {
        console.error("Error fetching education data:", err);

      } finally {
        setIsLoading(false);
      }
    };

    fetchEducationData();
  }, [session, status, resumeRefreshSignal]); 
  
  useEffect(() => {
  const fetchExperienceData = async () => {
    if (status === "loading") return;
    // Always use login email - backend handles linking resume email
    const preferredEmail = session?.user?.email || "";
    if (!preferredEmail) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/profiles/${encodeURIComponent(preferredEmail)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candidate profile");
      }

      const data = await response.json();

      // ✅ Check if experience data exists and is valid - check both 'experience' and 'experiences' fields
      if (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
        setExperiences(data.experiences);
      } else if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        setExperiences(data.experience);
      } else {
        // No existing data, set default blank experience
        setExperiences([
          {
            id: Date.now(),
            employer: "",
            title: "",
            industry: "",
            start: "",
            end: "",
            isCurrent: true,
            seniorityLevel: "",
            skillsToolsUsed: "",
            projectHighlights: "",
            achievements: "",
          },
        ]);
      }
    } catch (err: any) {
      console.error("Error fetching experience data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchExperienceData();
}, [session, status, resumeRefreshSignal]);

  // Listen for resume upload event to trigger refresh
  useEffect(() => {
    const handler = () => setResumeRefreshSignal((s) => s + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('resumeUploaded', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resumeUploaded', handler as EventListener);
      }
    };
  }, []);

  // Listen for job saved event to refresh saved jobs
  useEffect(() => {
    const handler = () => {
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        // Refetch saved jobs
        fetch(`/api/saved-jobs?candidateEmail=${encodeURIComponent(sessionEmail)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => res.json())
          .then(data => {
            const mapped = Array.isArray(data)
              ? data.map((job: any) => ({
                  id: job.id ?? job.saved_job_id ?? job.job_id ?? undefined,
                  jobTitle: job.jobTitle ?? job.job_title ?? job.title ?? '',
                  company: job.company ?? job.employer ?? '',
                  location: job.location ?? '',
                  salary: job.salary ?? '',
                  type: job.type ?? job.job_type ?? '',
                  isInclusive: job.isInclusive ?? job.is_inclusive ?? false,
                  hasAccommodations: job.hasAccommodations ?? job.has_accommodations ?? false,
                }))
              : [];
            setSavedJobs(mapped);
            if (mapped.length > 0 && !selectedSavedJob) {
              setSelectedSavedJob(mapped[0]);
            }
          })
          .catch(err => console.error('Error refreshing saved jobs:', err));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('jobSaved', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('jobSaved', handler as EventListener);
      }
    };
  }, [session, selectedSavedJob]);

  // Fetch applications data from database via Next.js API route
  const fetchApplicationsData = useCallback(async (email: string) => {
    try {
      // Fetch both applications and all jobs in parallel
      const [applicationsResponse, jobsResponse] = await Promise.all([
        fetch(`/api/applications?candidateEmail=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/jobs', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      ]);

      if (!applicationsResponse.ok) {
        console.error('Failed to fetch applications:', applicationsResponse.status);
        setApplications([]);
        return;
      }

      const applicationsData = await applicationsResponse.json();
      const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];

      console.log('📊 [Applications] Raw applications data:', applicationsData);
      console.log('📊 [Applications] Applications count:', Array.isArray(applicationsData) ? applicationsData.length : 0);
      console.log('📊 [Applications] Jobs data count:', jobsData.length);
      
      // Log interview scheduled applications
      if (Array.isArray(applicationsData)) {
        const interviewScheduled = applicationsData.filter((app: any) => app.status === 'interview_scheduled');
        console.log('📅 [Applications] Interview scheduled applications:', interviewScheduled.length);
        interviewScheduled.forEach((app: any) => {
          console.log(`  - ${app.jobTitle || app.job_title}: ${app.interviewDate || app.interview_date || 'No date'}`);
        });
      }

      // Fetch match results for applications
      console.log("📊 [Applications] Fetching match results...");
      let matchResultsMap = new Map();
      if (email) {
        try {
          const matchResponse = await fetch(`${API_BASE}/match_results/candidate/${encodeURIComponent(email)}`);
          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            if (Array.isArray(matchData)) {
              matchData.forEach((match: any) => {
                if (match.job_id) {
                  matchResultsMap.set(match.job_id.toString(), match);
                }
              });
            }
          }
        } catch (matchErr) {
          console.warn('Failed to fetch match results for applications:', matchErr);
        }
      }

      // Import transform utilities
      const { transformJob, findMatchingJob } = await import('./utils/jobTransform');

      const mapped = Array.isArray(applicationsData)
        ? applicationsData.map((app: any) => {
            const appJobTitle = app.jobTitle ?? app.job_title ?? '';
            const appCompany = app.company ?? app.employer ?? '';
            
            console.log(`Looking for match: jobTitle="${appJobTitle}", company="${appCompany}"`);
            
            // Find matching job from all jobs
            const matchingJob = findMatchingJob(jobsData, appJobTitle, appCompany);
            
            console.log(`Match found:`, matchingJob ? 'YES' : 'NO', matchingJob ? `Job ID: ${matchingJob.id}` : '');
            
            // Get AI match score if available
            const aiMatchScore = matchingJob?.id ? matchResultsMap.get(matchingJob.id.toString()) : null;
            
            // Base application data - ensure status is properly included
            const baseApp = {
              id: app.id ?? app.application_id ?? undefined,
              job_id: app.job_id ?? (matchingJob as any)?.id ?? undefined, // Add job_id for saving
              jobTitle: appJobTitle,
              company: appCompany,
              appliedDate: app.appliedDate ?? app.applied_date ?? '',
              status: app.status ?? 'under_review', // Status from backend
              location: app.location ?? '',
              salary: app.salary ?? '',
              accommodationsRequested: app.accommodationsRequested ?? app.accommodations_requested ?? false,
              score: app.score ?? undefined,
              interviewDate: app.interviewDate ?? app.interview_date ?? undefined,
            };

            // If matching job found, enrich with full job details
            if (matchingJob) {
              const transformedJob = transformJob(matchingJob);
              console.log(`Enriching application with job data:`, {
                description: transformedJob.description?.substring(0, 50),
                requirements: transformedJob.requirements?.length,
                accommodations: transformedJob.accommodations?.length,
              });
              
              return {
                ...baseApp,
                // Override with transformed job data
                description: transformedJob.description,
                requirements: transformedJob.requirements,
                accommodations: transformedJob.accommodations,
                companySize: transformedJob.companySize,
                industry: transformedJob.industry,
                postedDate: transformedJob.postedDate,
                applicationDeadline: transformedJob.applicationDeadline,
                salaryRange: transformedJob.salaryRange,
                salary: transformedJob.salary, // Use formatted salary from transformJob
                // Use AI match scores if available, otherwise use transformed job scores
                primaryMatchScore: aiMatchScore ? aiMatchScore.primary_score : transformedJob.primaryMatchScore,
                secondaryMatchScore: aiMatchScore ? aiMatchScore.secondary_score : transformedJob.secondaryMatchScore,
                tertiaryMatchScore: aiMatchScore ? aiMatchScore.tertiary_score : transformedJob.tertiaryMatchScore,
                score: aiMatchScore ? Math.round(aiMatchScore.total_score) : (app.score ?? transformedJob.matchScore),
                accommodationsFriendly: transformedJob.accommodationsFriendly,
                type: transformedJob.type,
                jobStatus: transformedJob.status, // Include job status separately
              };
            }

            console.log(`No matching job found for application:`, baseApp);
            return baseApp;
          })
        : [];

      console.log("📊 [Applications] Match scores updated:", mapped.map((app: any) => ({
        jobTitle: app.jobTitle,
        score: app.score,
        primary_score: app.primaryMatchScore
      })));
      
      // Update appliedJobs Set from fetched applications
      const appliedJobKeys = new Set<string>(
        mapped.map((app: any) => `${app.jobTitle}-${app.company}`)
      );
      setAppliedJobs(appliedJobKeys);
      console.log("📊 [Applications] Updated appliedJobs Set:", Array.from(appliedJobKeys));

      setApplications(mapped);
      if (mapped.length > 0 && !selectedApplication) {
        setSelectedApplication(mapped[0]);
      }
    } catch (error) {
      console.error('Error fetching applications data:', error);
      setApplications([]);
    }
  }, [selectedApplication]);

  // Listen for match scores update event to refresh applications
  useEffect(() => {
    const handleMatchScoresUpdated = (event: CustomEvent) => {
      console.log('🔄 [Applications] Received matchScoresUpdated event, refreshing applications...');
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        fetchApplicationsData(sessionEmail);
      }
    };
    
    window.addEventListener('matchScoresUpdated', handleMatchScoresUpdated as EventListener);
    return () => {
      window.removeEventListener('matchScoresUpdated', handleMatchScoresUpdated as EventListener);
    };
  }, [session, fetchApplicationsData]);

  // Initial fetch on mount
  useEffect(() => {
    const sessionEmail = session?.user?.email;
    if (sessionEmail) {
      fetchApplicationsData(sessionEmail);
    }
  }, [session, fetchApplicationsData]);

  // Refresh applications when Applications tab is activated
  useEffect(() => {
    if (activeTab === 'applications') {
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        console.log('Refreshing applications data for Applications tab');
        fetchApplicationsData(sessionEmail);
      }
    }
  }, [activeTab, session, fetchApplicationsData]);

  // Periodic refresh for applications when Applications tab is active (every 30 seconds)
  useEffect(() => {
    if (activeTab !== 'applications') return;
    
    const sessionEmail = session?.user?.email;
    if (!sessionEmail) return;

    const interval = setInterval(() => {
      console.log('🔄 [Applications] Periodic refresh...');
      fetchApplicationsData(sessionEmail);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab, session?.user?.email, fetchApplicationsData]);

  // Refresh when page becomes visible (user switches back to tab/window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab === 'applications') {
        const sessionEmail = session?.user?.email;
        if (sessionEmail) {
          console.log('🔄 [Applications] Page became visible, refreshing...');
          fetchApplicationsData(sessionEmail);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab, session?.user?.email, fetchApplicationsData]);

  // Listen for job applied event to refresh applications
  useEffect(() => {
    const handler = () => {
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        // Refetch applications
        fetch(`/api/applications?candidateEmail=${encodeURIComponent(sessionEmail)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res => res.json())
          .then(data => {
            const mapped = Array.isArray(data)
              ? data.map((app: any) => ({
                  id: app.id ?? app.application_id ?? undefined,
                  jobTitle: app.jobTitle ?? app.job_title ?? '',
                  company: app.company ?? app.employer ?? '',
                  appliedDate: app.appliedDate ?? app.applied_date ?? '',
                  status: app.status ?? 'under_review',
                  location: app.location ?? '',
                  salary: app.salary ?? '',
                  accommodationsRequested: app.accommodationsRequested ?? app.accommodations_requested ?? false,
                  score: app.score ?? undefined,
                }))
              : [];
            setApplications(mapped);
            if (mapped.length > 0 && !selectedApplication) {
              setSelectedApplication(mapped[0]);
            }
          })
          .catch(err => console.error('Error refreshing applications:', err));
      }
    };
    
    const handleJobStatusChanged = () => {
      // Refetch applications to get updated job status
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        fetchApplicationsData(sessionEmail);
      }
    };

    const handleApplicationWithdrawn = () => {
      // Refetch applications after withdrawal
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        fetchApplicationsData(sessionEmail);
      }
    };
    
    const handleApplicationStatusUpdated = () => {
      // Refetch applications when status is updated (e.g., interview scheduled)
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        console.log('🔄 [Applications] Application status updated, refreshing applications...');
        fetchApplicationsData(sessionEmail);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('jobApplied', handler as EventListener);
      window.addEventListener('jobStatusChanged', handleJobStatusChanged as EventListener);
      window.addEventListener('applicationWithdrawn', handleApplicationWithdrawn as EventListener);
      window.addEventListener('applicationStatusUpdated', handleApplicationStatusUpdated as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('jobApplied', handler as EventListener);
        window.removeEventListener('jobStatusChanged', handleJobStatusChanged as EventListener);
        window.removeEventListener('applicationWithdrawn', handleApplicationWithdrawn as EventListener);
        window.removeEventListener('applicationStatusUpdated', handleApplicationStatusUpdated as EventListener);
      }
    };
  }, [session, selectedApplication, fetchApplicationsData]);

  // Track if saved jobs have been loaded
  const [savedJobsLoaded, setSavedJobsLoaded] = useState(false);

  // Fetch saved jobs data from database via Next.js API route
  useEffect(() => {
    const fetchSavedJobsData = async (email: string) => {
      try {
        setSavedJobsLoaded(false);
        // Fetch saved jobs, all jobs, and match results in parallel
        const [savedJobsResponse, jobsResponse, matchResponse] = await Promise.all([
          fetch(`/api/saved-jobs?candidateEmail=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('/api/jobs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${API_BASE}/match_results/candidate/${encodeURIComponent(email)}`).catch(() => null)
        ]);

        if (!savedJobsResponse.ok) {
          console.error('Failed to fetch saved jobs:', savedJobsResponse.status);
          setSavedJobs([]);
          setSavedJobsLoaded(true);
          return;
        }

        const savedJobsData = await savedJobsResponse.json();
        const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
        
        // Build match results map
        let matchResultsMap = new Map();
        if (matchResponse && matchResponse.ok) {
          try {
            const matchData = await matchResponse.json();
            console.log(`[Saved Jobs] Fetched ${Array.isArray(matchData) ? matchData.length : 0} match results`);
            if (Array.isArray(matchData)) {
              matchData.forEach((match: any) => {
                if (match.job_id) {
                  matchResultsMap.set(match.job_id.toString(), match);
                  console.log(`[Saved Jobs] Added match result for job_id: ${match.job_id}, total_score: ${match.total_score}`);
                }
              });
            }
            console.log(`[Saved Jobs] Match results map size: ${matchResultsMap.size}`);
          } catch (matchErr) {
            console.warn('Failed to parse match results:', matchErr);
          }
        } else {
          console.warn('[Saved Jobs] Match response not OK:', matchResponse?.status, matchResponse?.statusText);
        }

        // Import transform utilities
        const { transformJob, findMatchingJob } = await import('./utils/jobTransform');

        const mapped = Array.isArray(savedJobsData)
          ? savedJobsData.map((job: any) => {
              // Find matching job from all jobs
              const matchingJob = findMatchingJob(jobsData, job.jobTitle ?? job.job_title ?? job.title ?? '', job.company ?? job.employer ?? '');
              
              // Extract job_id - this is the actual job posting ID needed for applications
              const actualJobId = job.job_id ?? (matchingJob as any)?.id ?? (matchingJob as any)?.job_id ?? undefined;
              
              // Get AI match score if available
              const aiMatchScore = actualJobId ? matchResultsMap.get(actualJobId.toString()) : null;
              
              // Base saved job data
              const baseJob = {
                id: job.id ?? job.saved_job_id ?? actualJobId,
                job_id: actualJobId, // Store the actual job ID for applying
                jobTitle: job.jobTitle ?? job.job_title ?? job.title ?? '',
                company: job.company ?? job.employer ?? '',
                location: job.location ?? '',
                salary: job.salary ?? '',
                type: job.type ?? job.job_type ?? '',
                isInclusive: job.isInclusive ?? job.is_inclusive ?? false,
                hasAccommodations: job.hasAccommodations ?? job.has_accommodations ?? false,
              };

              // If matching job found, enrich with full job details
              if (matchingJob) {
                const transformedJob = transformJob(matchingJob);
                // Log for debugging
                if (actualJobId) {
                  console.log(`[Saved Jobs] Job ${actualJobId}:`, {
                    jobTitle: job.jobTitle ?? job.job_title ?? job.title,
                    company: job.company ?? job.employer,
                    hasAiMatch: !!aiMatchScore,
                    aiMatchScore: aiMatchScore ? {
                      total: aiMatchScore.total_score,
                      primary: aiMatchScore.primary_score,
                      secondary: aiMatchScore.secondary_score,
                      tertiary: aiMatchScore.tertiary_score
                    } : null,
                    fallbackScore: transformedJob.matchScore
                  });
                }
                return {
                  ...baseJob,
                  // Override with transformed job data
                  description: transformedJob.description,
                  requirements: transformedJob.requirements,
                  accommodations: transformedJob.accommodations,
                  companySize: transformedJob.companySize,
                  industry: transformedJob.industry,
                  postedDate: transformedJob.postedDate,
                  applicationDeadline: transformedJob.applicationDeadline,
                  salaryRange: transformedJob.salaryRange,
                  salary: transformedJob.salary, // Use formatted salary from transformJob
                  // Use AI match scores if available, otherwise use transformed job scores
                  primaryMatchScore: aiMatchScore ? aiMatchScore.primary_score : transformedJob.primaryMatchScore,
                  secondaryMatchScore: aiMatchScore ? aiMatchScore.secondary_score : transformedJob.secondaryMatchScore,
                  tertiaryMatchScore: aiMatchScore ? aiMatchScore.tertiary_score : transformedJob.tertiaryMatchScore,
                  matchScore: aiMatchScore ? Math.round(aiMatchScore.total_score) : transformedJob.matchScore,
                  accommodationsFriendly: transformedJob.accommodationsFriendly,
                  type: transformedJob.type,
                  status: transformedJob.status, // Include job status
                };
              }

              return baseJob;
            })
          : [];

        console.log("📊 [Saved Jobs] Match scores updated:", mapped.map((job: any) => ({
          jobTitle: job.jobTitle,
          matchScore: job.matchScore,
          primary_score: job.primaryMatchScore
        })));

        setSavedJobs(mapped);
        
        const savedKeys = new Set<string>();
        const savedIds = new Map<string, number>();
        mapped.forEach((job: any) => {
          const jobKey = `${job.jobTitle || job.title}-${job.company}`;
          savedKeys.add(jobKey);
          if (job.id) {
            savedIds.set(jobKey, job.id);
          }
        });
        setSavedJobKeys(savedKeys);
        setSavedJobIds(savedIds);
        
        // Update selectedSavedJob if it exists in the updated jobs
        if (selectedSavedJob) {
          const updatedSelectedJob = mapped.find((job: any) => 
            job.id === selectedSavedJob.id || 
            (job.jobTitle === selectedSavedJob.jobTitle && job.company === selectedSavedJob.company)
          );
          if (updatedSelectedJob) {
            setSelectedSavedJob(updatedSelectedJob);
          }
        } else if (mapped.length > 0) {
          setSelectedSavedJob(mapped[0]);
        }
        setSavedJobsLoaded(true);
      } catch (error) {
        console.error('Error fetching saved jobs data:', error);
        setSavedJobs([]);
        setSavedJobsLoaded(true);
      }
    };

    const sessionEmail = session?.user?.email;
    if (sessionEmail) {
      fetchSavedJobsData(sessionEmail);
    }
    
    // Listen for match scores update event to refresh saved jobs
    const handleMatchScoresUpdated = (event: CustomEvent) => {
      console.log('🔄 [Saved Jobs] Received matchScoresUpdated event, refreshing saved jobs...');
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        fetchSavedJobsData(sessionEmail);
      }
    };
    
    window.addEventListener('matchScoresUpdated', handleMatchScoresUpdated as EventListener);
    return () => {
      window.removeEventListener('matchScoresUpdated', handleMatchScoresUpdated as EventListener);
    };
  }, [session]);

  // Refresh saved jobs when Saved Jobs tab is activated
  useEffect(() => {
    if (activeTab === 'saved') {
      const sessionEmail = session?.user?.email;
      if (sessionEmail) {
        console.log('Refreshing saved jobs data for Saved Jobs tab');
        const fetchSavedJobsData = async (email: string) => {
          try {
            setSavedJobsLoaded(false);
            // Fetch saved jobs, all jobs, and match results in parallel
            const [savedJobsResponse, jobsResponse, matchResponse] = await Promise.all([
              fetch(`/api/saved-jobs?candidateEmail=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }),
              fetch('/api/jobs', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }),
              fetch(`${API_BASE}/match_results/candidate/${encodeURIComponent(email)}`).catch(() => null)
            ]);

            if (!savedJobsResponse.ok) {
              console.error('Failed to fetch saved jobs:', savedJobsResponse.status);
              setSavedJobs([]);
              setSavedJobsLoaded(true);
              return;
            }

            const savedJobsData = await savedJobsResponse.json();
            const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
            
            // Build match results map from the parallel fetch
            let matchResultsMap = new Map();
                if (matchResponse && matchResponse.ok) {
              try {
                  const matchData = await matchResponse.json();
                  if (Array.isArray(matchData)) {
                    matchData.forEach((match: any) => {
                      if (match.job_id) {
                        matchResultsMap.set(match.job_id.toString(), match);
                      }
                    });
                }
              } catch (matchErr) {
                console.warn('Failed to parse match results:', matchErr);
              }
            }

            // Import transform utilities
            const { transformJob, findMatchingJob } = await import('./utils/jobTransform');

            const mapped = Array.isArray(savedJobsData)
              ? savedJobsData.map((job: any) => {
                  // Find matching job from all jobs
                  const matchingJob = findMatchingJob(jobsData, job.jobTitle ?? job.job_title ?? job.title ?? '', job.company ?? job.employer ?? '');
                  
                  // Extract job_id - this is the actual job posting ID needed for applications
                  const actualJobId = job.job_id ?? (matchingJob as any)?.id ?? (matchingJob as any)?.job_id ?? undefined;
                  
                  // Get AI match score if available
                  const aiMatchScore = actualJobId ? matchResultsMap.get(actualJobId.toString()) : null;
                  
                  // Base saved job data
                  const baseJob = {
                    id: job.id ?? job.saved_job_id ?? actualJobId,
                    job_id: actualJobId, // Store the actual job ID for applying
                    jobTitle: job.jobTitle ?? job.job_title ?? job.title ?? '',
                    company: job.company ?? job.employer ?? '',
                    location: job.location ?? '',
                    salary: job.salary ?? '',
                    type: job.type ?? job.job_type ?? '',
                    isInclusive: job.isInclusive ?? job.is_inclusive ?? false,
                    hasAccommodations: job.hasAccommodations ?? job.has_accommodations ?? false,
                  };

                  // If matching job found, enrich with full job details
                  if (matchingJob) {
                    const transformedJob = transformJob(matchingJob);
                    return {
                      ...baseJob,
                      // Override with transformed job data
                      description: transformedJob.description,
                      requirements: transformedJob.requirements,
                      accommodations: transformedJob.accommodations,
                      companySize: transformedJob.companySize,
                      industry: transformedJob.industry,
                      postedDate: transformedJob.postedDate,
                      applicationDeadline: transformedJob.applicationDeadline,
                      salaryRange: transformedJob.salaryRange,
                      salary: transformedJob.salary, // Use formatted salary from transformJob
                      // Use AI match scores if available, otherwise use transformed job scores
                      primaryMatchScore: aiMatchScore ? aiMatchScore.primary_score : transformedJob.primaryMatchScore,
                      secondaryMatchScore: aiMatchScore ? aiMatchScore.secondary_score : transformedJob.secondaryMatchScore,
                      tertiaryMatchScore: aiMatchScore ? aiMatchScore.tertiary_score : transformedJob.tertiaryMatchScore,
                      matchScore: aiMatchScore ? Math.round(aiMatchScore.total_score) : transformedJob.matchScore,
                      accommodationsFriendly: transformedJob.accommodationsFriendly,
                      type: transformedJob.type,
                      status: transformedJob.status, // Include job status
                    };
                  }

                  return baseJob;
                })
              : [];

            // Update selectedSavedJob if it exists in the updated jobs
            setSavedJobs(mapped);
            
            const savedKeys = new Set<string>();
            const savedIds = new Map<string, number>();
            mapped.forEach((job: any) => {
              const jobKey = `${job.jobTitle || job.title}-${job.company}`;
              savedKeys.add(jobKey);
              if (job.id) {
                savedIds.set(jobKey, job.id);
              }
            });
            setSavedJobKeys(savedKeys);
            setSavedJobIds(savedIds);
            
            // Update selectedSavedJob if it exists in the updated jobs
            if (selectedSavedJob) {
              const updatedSelectedJob = mapped.find((job: any) => 
                job.id === selectedSavedJob.id || 
                (job.jobTitle === selectedSavedJob.jobTitle && job.company === selectedSavedJob.company)
              );
              if (updatedSelectedJob) {
                setSelectedSavedJob(updatedSelectedJob);
              }
            } else if (mapped.length > 0) {
              setSelectedSavedJob(mapped[0]);
            }
            setSavedJobsLoaded(true);
          } catch (error) {
            console.error('Error fetching saved jobs data:', error);
            setSavedJobs([]);
            setSavedJobsLoaded(true);
          }
        };
        fetchSavedJobsData(sessionEmail);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);

  // Check if user has a profile/resume
  const checkUserProfile = async (userEmail: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/profiles?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      
      // Check if profile exists and has meaningful data
      // Check both singular and plural field names for compatibility
      const hasPersonalInfo = data.personal_identifiers && (
        data.personal_identifiers.fullName ||
        data.personal_identifiers.emailAddress ||
        data.name
      );
      
      const hasEducation = (data.educations && Array.isArray(data.educations) && data.educations.length > 0) ||
                          (data.education && Array.isArray(data.education) && data.education.length > 0) ||
                          (data.education && typeof data.education === 'object' && Object.keys(data.education).length > 0);
      
      const hasExperience = (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) ||
                           (data.experience && Array.isArray(data.experience) && data.experience.length > 0) ||
                           (data.experience && typeof data.experience === 'object' && Object.keys(data.experience).length > 0) ||
                           data.exp_skill?.employer;
      
      // Check if resume was uploaded (resume_url exists)
      const hasResume = data.resume_url && data.resume_url.trim() !== '';
      
      const hasValidProfile = hasPersonalInfo || hasEducation || hasExperience || hasResume;
      
      console.log('Profile check result:', {
        hasPersonalInfo,
        hasEducation,
        hasExperience,
        hasResume,
        hasValidProfile,
        educations: data.educations?.length,
        experiences: data.experiences?.length,
        resume_url: data.resume_url
      });
      
      return hasValidProfile;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  // Handle save/unsave job
  const handleSaveJob = async (job: any) => {
    const jobKey = `${job.jobTitle || job.title}-${job.company}`;
    
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before saving jobs.');
        return;
      }
      
      // Check if already saved - if so, unsave it
      if (savedJobKeys.has(jobKey)) {
        setSavingJobId(jobKey);
        const savedJobId = savedJobIds.get(jobKey);
        if (savedJobId) {
          const response = await fetch(`/api/saved-jobs?savedJobId=${savedJobId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            success('Job Removed', 'Job has been removed from your saved jobs.');
            
            setSavedJobKeys(prev => {
              const newSet = new Set(prev);
              newSet.delete(jobKey);
              return newSet;
            });
            setSavedJobIds(prev => {
              const newMap = new Map(prev);
              newMap.delete(jobKey);
              return newMap;
            });
            
            // Remove from savedJobs array
            setSavedJobs(prev => prev.filter(savedJob => {
              const key = `${savedJob.jobTitle || savedJob.title}-${savedJob.company}`;
              return key !== jobKey;
            }));
            
            if (selectedSavedJob && `${selectedSavedJob.jobTitle || selectedSavedJob.title}-${selectedSavedJob.company}` === jobKey) {
              const remaining = savedJobs.filter(savedJob => {
                const key = `${savedJob.jobTitle || savedJob.title}-${savedJob.company}`;
                return key !== jobKey;
              });
              setSelectedSavedJob(remaining.length > 0 ? remaining[0] : null);
            }
            
            window.dispatchEvent(new CustomEvent('jobUnsaved', {
              detail: { id: savedJobId, jobTitle: job.jobTitle || job.title, company: job.company }
            }));
          } else {
            const errorData = await response.json();
            showError('Unsave Failed', errorData.error || 'Failed to unsave job');
          }
        }
        setSavingJobId(null);
        return;
      }

      // Check if user has a valid profile
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please complete your profile or upload your resume to save.');
        return;
      }

      setSavingJobId(jobKey);

      // Save the job - need to get job_id from the job object or fetch it
      const jobId = job.job_id || job.id;
      if (!jobId) {
        showError('Save Failed', 'Job ID not found. Please try again.');
        setSavingJobId(null);
        return;
      }

      const response = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_email: userEmail,
          job_id: typeof jobId === 'string' ? parseInt(jobId) : jobId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success('Job Saved!', 'Job has been saved to your saved jobs.');
        const savedId = result?.saved_job?.id;
        
        setSavedJobKeys(prev => new Set([...prev, jobKey]));
        if (savedId) {
          setSavedJobIds(prev => new Map([...prev, [jobKey, savedId]]));
        }
        
        window.dispatchEvent(new CustomEvent('jobSaved', {
          detail: {
            id: savedId || jobId,
            jobTitle: job.jobTitle || job.title,
            company: job.company,
            location: job.location,
            jobType: job.type,
            salary: job.salary,
          }
        }));
      } else {
        const errorData = await response.json();
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

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // personalIdentifiers (weight: 20%)
    const personalFields = Object.values(candidateProfile.personalIdentifiers).filter(
      (val) => val !== '' && val !== null && val !== undefined
    );
    completedFields += personalFields.length;
    totalFields += Object.keys(candidateProfile.personalIdentifiers).length;

    // educations (weight: 15%)
    educations.forEach((edu) => {
      const eduFields = Object.values(edu).filter((val) => val !== '' && val !== null && val !== undefined);
      completedFields += eduFields.length;
      totalFields += Object.keys(edu).length;
    });

    // experiences (weight: 15%)
    experiences.forEach((exp) => {
      const expFields = Object.values(exp).filter((val) => val !== '' && val !== null && val !== undefined);
      completedFields += expFields.length;
      totalFields += Object.keys(exp).length;
    });

    // exp_skill (weight: 20%)
    const skillFields = Object.values(candidateProfile.exp_skill).filter(
      (val) => val !== '' && val !== null && val !== undefined
    );
    completedFields += skillFields.length;
    totalFields += Object.keys(candidateProfile.exp_skill).length;

    // environment (weight: 20%)
    const envFields = Object.values(candidateProfile.environment).filter(
      (val) => val !== '' && val !== null && val !== undefined
    );
    completedFields += envFields.length;
    totalFields += Object.keys(candidateProfile.environment).length;


    const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    
    // Update the profile completion in state
    setCandidateProfile(prev => ({
      ...prev,
      profileCompletion: completionPercentage
    }));

    return completionPercentage;
  };

  // Update profile completion when data changes
  useEffect(() => {
    if (dataLoaded) {
      calculateProfileCompletion();
    }
  }, [candidateProfile.personalIdentifiers, candidateProfile.education, candidateProfile.exp_skill, candidateProfile.environment, educations, experiences, dataLoaded]);

  useEffect(() => {
    console.log('Education state changed:', educations);
  }, [educations]);

  // Handle tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset mock interview step when switching to mock interview tab
    if (tabId === "mock interview") {
      setMockInterviewStep("setup");
      setSelectedReportId(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyToJob = async (job: any) => {
    console.log('Apply button clicked for job:', job.jobTitle);
    console.log('Full job object:', job);
    const jobKey = `${job.jobTitle}-${job.company}`;
    
    try {
      if (appliedJobs.has(jobKey)) {
        info('Already Applied', 'You have already applied to this job.');
        return;
      }
      
      // Check if job is closed or expired
      const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
      if (job.status === 'closed' || isExpired) {
        showError('Job Unavailable', 'This job is closed or expired and no longer accepting applications.');
        return;
      }
      
      const userEmail = session?.user?.email;
      if (!userEmail) {
        showError('Not Authenticated', 'Please sign in before applying to jobs.');
        return;
      }

      // Check if user has a valid profile BEFORE setting loading state
      const hasProfile = await checkUserProfile(userEmail);
      if (!hasProfile) {
        showError('Profile Incomplete', 'Please complete your profile or upload your resume to apply.');
        return;
      }

      // Only set loading state after validation passes
      setApplyingJobId(jobKey);

      // Get the job_id (could be job.job_id, job.id, or need to parse)
      const jobId = job.job_id || job.id;
      console.log('Extracted job ID:', jobId);
      
      if (!jobId) {
        console.error('Job ID not found. Job object:', job);
        showError('Application Failed', 'Job ID not found. Please try again.');
        setApplyingJobId(null);
        return;
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_email: userEmail,
          job_id: typeof jobId === 'string' ? parseInt(jobId) : jobId,
          accommodations_requested: job.accommodationsFriendly || job.hasAccommodations || false
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success('Application Submitted!', 'Your application has been submitted successfully.');
        
        // Update applied jobs state
        setAppliedJobs(prev => new Set([...prev, jobKey]));
        
        // Emit event so other tabs can update
        window.dispatchEvent(new CustomEvent('jobApplied', {
          detail: {
            id: typeof jobId === 'string' ? parseInt(jobId) : jobId,
            jobTitle: job.jobTitle,
            company: job.company,
            appliedDate: new Date().toISOString(),
            status: 'under_review',
            accommodationsRequested: job.accommodationsFriendly || job.hasAccommodations || false,
            location: job.location,
            salary: job.salary,
            matchScore: job.matchScore || job.primaryMatchScore
          }
        }));
        
        // Refetch applications to update the list
        if (userEmail) {
          fetch(`/api/applications?candidateEmail=${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
            .then(res => res.json())
            .then(data => {
              const mapped = Array.isArray(data) ? data.map((app: any) => ({
                id: app.application_id || app.id,
                jobTitle: app.job_title || app.jobTitle,
                company: app.employer_email || app.company,
                location: app.location || 'Not specified',
                salary: app.salary_range !== undefined ? app.salary_range : (app.salary || 'Not specified'),
                salaryRange: app.salary_range,
                employmentType: app.job_type || app.type || 'Full-time',
                status: app.status || 'under_review',
                appliedDate: app.application_date || app.appliedDate || new Date().toISOString(),
                accommodationsRequested: app.accommodations_requested || false,
              })) : [];
              setApplications(mapped);
            })
            .catch(err => console.error('Error refreshing applications:', err));
        }
      } else {
        const errorData = await response.json();
        console.error('Application failed:', errorData);
        
        const msg = errorData.error || errorData.detail || 'Failed to apply to job';
        if (msg.toLowerCase().includes('already applied')) {
          info('Already Applied', 'You have already applied to this job.');
          setAppliedJobs(prev => new Set([...prev, jobKey]));
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

  // Update individual education record
  const updateEducation = (id: number, updatedFields: any) => {
    setEducations((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, ...updatedFields } : edu))
    );
  };

  // Update individual experience record
  const updateExperience = (id: number, updates: Partial<Experience>) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "font-bold text-green-600";
    if (score >= 80) return "font-bold text-blue-600";
    if (score >= 70) return "font-bold text-yellow-600";
    return "font-bold text-red-600";
  };

  const getStatusBadge = (status: string, jobStatus?: string) => {
    // If job is closed, show "Closed" badge regardless of application status
    if (jobStatus === 'closed' || jobStatus === 'expired') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Closed</Badge>;
    }
    
    switch (status) {
      case "under_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "shortlisted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Shortlisted</Badge>;
      case "interview_scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interview Scheduled</Badge>;
      case "interview_accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Interview Accepted</Badge>;
      case "interview_rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Interview Rejected</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Not Selected</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Accepted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "interview_scheduled":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const currentYear = new Date().getFullYear();
  const grad_year = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Allow Browse Jobs tab to render even while loading (it doesn't depend on profile data)
  const shouldShowLoadingSkeleton = isLoading && activeTab !== "browse jobs";
  
  if (shouldShowLoadingSkeleton) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
        <div className="page-wrap py-8">
          <div className="flex flex-col-2 justify-between">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
          </div>
          <div className="grid lg:grid-cols-[260px_1fr] gap-8">
            <div>
              <div className="bg-white rounded-lg p-6">
                <ProfileSkeleton />
              </div>
            </div>
            <div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6">
                      <Skeleton className="h-8 w-8 mx-auto mb-2" />
                      <Skeleton className="h-6 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="page-wrap py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 py-8">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-[calc(var(--app-header-height)+32px)] lg:self-start lg:max-h-[calc(100vh-var(--app-header-height)-64px)] lg:overflow-y-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {(() => {
                        const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                        return picUrl && picUrl.trim() !== "";
                      })() ? (
                        <img
                          src={
                            (() => {
                              const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                              if (!picUrl) return '';
                              if (picUrl.startsWith("http")) {
                                return `${picUrl}?t=${Date.now()}`;
                              }
                              // Match employer dashboard logic exactly
                              return `${API_BASE}${picUrl.startsWith('/') ? '' : '/'}${picUrl}?t=${Date.now()}`;
                            })()
                          }
                          alt="Profile Picture"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                            console.error("Profile picture failed to load:", picUrl);
                            console.error("Constructed URL:", picUrl?.startsWith("http") 
                              ? picUrl 
                              : `${API_BASE}${picUrl?.startsWith('/') ? '' : '/'}${picUrl}`);
                            (e.target as HTMLImageElement).style.display = "none";
                            const parentDiv = e.currentTarget.parentElement;
                            if (parentDiv && !parentDiv.querySelector('.fallback-initials')) {
                              const fallback = document.createElement("div");
                              fallback.className = "fallback-initials w-full h-full flex items-center justify-center text-white text-sm font-semibold";
                              fallback.textContent = candidateProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
                              parentDiv.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span>{candidateProfile.name.split(' ').map(n => n[0]).join('')}</span>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                        title="Upload profile picture"
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#635bff]">{candidateProfile.name}</h3>
                      <p className="text-sm text-gray-600">{candidateProfile.email}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#635bff]">Profile Completion</span>
                      <span className="text-sm font-medium text-[#635bff]">{candidateProfile.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#635bff] h-2 rounded-full"
                        style={{ width: `${candidateProfile.profileCompletion}%` }}
                      />
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {[
                      { id: "overview", label: "Overview", icon: LayoutDashboard },
                      { id: "browse jobs", label: "Browse Jobs", icon: Search },
                      { id: "applications", label: "My Applications", icon: LetterTextIcon },
                      { id: "saved", label: "Saved Jobs", icon: Heart },
                      {
                        id: "profile", label: "Profile Settings", icon: Settings, children: [
                          { id: "profile config", label: "Profile Data", icon: User },
                          { id: "education", label: "Education", icon: Book },
                          { id: "experience", label: "Experience", icon: Briefcase },
                          { id: "skills", label: "Skills", icon: HandFist },
                          { id: "neuro_strength", label: "Neurodivergent Strengths", icon: BrainCircuit },
                          { id: "environment", label: "Preferred Environment", icon: House },
                        ],
                      },
                      {
                        id: "job coach", label: "Job Coach", icon: UserStar, children: [
                          { id: "mock interview", label: "Mock Interview", icon: MessagesSquare },
                          { id: "Appointment", label: "Appointment", icon: CalendarClock },
                          { id: "Report", label: "Report", icon: FileText },
                        ],
                      },

                    ].map((item) => {
                      const Icon = item.icon;
                      const hasChildren = Boolean(item.children);
                      const isOpen = !!openDropdowns[item.id];

                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => {
                              if (hasChildren) {
                                setOpenDropdowns((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }));
                              } else {
                                handleTabChange(item.id);
                              }
                            }}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-lg transition-colors ${activeTab === item.id
                              ? "bg-[#635bff] text-white"
                              : "text-[#3a4043] hover:bg-gray-100"
                              } hover:cursor-pointer`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </div>

                            {hasChildren && (
                              <svg
                                className={`h-4 w-4 transform transition-transform ${isOpen ? "rotate-180" : ""
                                  }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {hasChildren && isOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children?.map((child) => {
                                const ChildIcon = child.icon;
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleTabChange(child.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${activeTab === child.id
                                      ? "bg-[#635bff] text-white"
                                      : "text-[#3a4043] hover:bg-gray-100"
                                      } hover:cursor-pointer`}
                                  >
                                    <ChildIcon className="h-4 w-4" />
                                    {child.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
          </div>

          {/* Main Content */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-2xl font-bold text-[#3a4043]">
                  
                  {activeTab === "overview" && "Overview"}
                  {activeTab === "browse jobs" && "Browse Jobs"}
                  {activeTab === "applications" && "My Applications"}
                  {activeTab === "saved" && "Saved Jobs"}
                  {activeTab === "profile config" && "Profile Data"}
                  {activeTab === "education" && "Education"}
                  {activeTab === "experience" && "Experience"}
                  {activeTab === "skills" && "Skills"}
                  {activeTab === "neuro_strength" && "Neurodivergent Strengths"}
                  {activeTab === "environment" && "Preferred Environment"}
                  {activeTab === "mock interview" && "Mock Interview"}
                  {activeTab === "Report" && "Candidate Report"}
                  {activeTab === "Appointment" && "Book Appointment"}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <ResumeUploadButton
                    buttonText="Upload Resume"
                    buttonClassName="bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
                    onResumeProcessed={(parsedInfo) => {
                      console.log("Resume processed:", parsedInfo);
                    }}
                  />
                  {/* <Button
                    onClick={handleRunAiMatching}
                    disabled={isRunningAiMatch}
                    className="bg-white border border-[#635BFF] rounded-3xl text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isRunningAiMatch ? "Running..." : "Get AI Matches"}
                  </Button> */}
                </div>
              </div>
              {activeTab === "overview" && (
                <OverviewPage
                  applications={applications}
                  savedJobs={savedJobs}
                  handleTabChange={handleTabChange}
                  getStatusIcon={getStatusIcon}
                  getStatusBadge={getStatusBadge}
                />
              )}

            {activeTab === "browse jobs" && (
                <CandidateJobListing />
            )}

            {activeTab === "applications" && (
              <ApplicationsPage
                applications={applications}
                setApplications={setApplications}
                applicationSearchTerm={applicationSearchTerm}
                setApplicationSearchTerm={setApplicationSearchTerm}
                applicationFilterStatus={applicationFilterStatus}
                setApplicationFilterStatus={setApplicationFilterStatus}
                applicationFilterLocation={applicationFilterLocation}
                setApplicationFilterLocation={setApplicationFilterLocation}
                applicationFilterType={applicationFilterType}
                setApplicationFilterType={setApplicationFilterType}
                applicationSortBy={applicationSortBy}
                setApplicationSortBy={setApplicationSortBy}
                selectedApplication={selectedApplication}
                setSelectedApplication={setSelectedApplication}
                showMatchingScoreDialog={showMatchingScoreDialog}
                setShowMatchingScoreDialog={setShowMatchingScoreDialog}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
                handleSaveJob={handleSaveJob}
                savedJobKeys={savedJobKeys}
                savingJobId={savingJobId}
              />
            )}


            {/* Detailed Matching Score Dialog */}
            <Dialog open={showMatchingScoreDialog} onOpenChange={setShowMatchingScoreDialog}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#3a4043]">
                    Detailed Matching Analysis
                  </DialogTitle>
                  <DialogDescription>
                    {(selectedApplication || selectedSavedJob) && (
                      <div className="mt-2">
                        <p className="text-lg font-semibold text-[#635bff]">
                          {(selectedApplication || selectedSavedJob)?.jobTitle} at {(selectedApplication || selectedSavedJob)?.company}
                        </p>
              </div>
            )}
                  </DialogDescription>
                </DialogHeader>

                {(selectedApplication || selectedSavedJob) && (() => {
                  const currentJob = selectedApplication || selectedSavedJob;
                  // Calculate match scores dynamically
                  const primaryMatchScore = currentJob.primaryMatchScore || 96;
                  const secondaryMatchScore = currentJob.secondaryMatchScore || 90;
                  const tertiaryMatchScore = currentJob.tertiaryMatchScore || 85;
                  const overallMatchScore = Math.round((primaryMatchScore + secondaryMatchScore + tertiaryMatchScore) / 3);

                  return (
                  <div className="space-y-6 mt-4">
                    {/* Overall Match Score */}
                    <div className="text-center py-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Overall Match</p>
                      {/* <h3 className="text-xl font-bold text-[#635bff] mb-3">{selectedApplication.jobTitle}</h3> */}
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

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => setShowMatchingScoreDialog(false)}
                        className="bg-[#635bff] hover:bg-[#5748e5] text-white px-8"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                  );
                })()}
              </DialogContent>
            </Dialog>

            {activeTab === "saved" && (
              <SavedJobsPage
                savedJobs={savedJobs}
                setSavedJobs={setSavedJobs}
                savedJobsSearchTerm={savedJobsSearchTerm}
                setSavedJobsSearchTerm={setSavedJobsSearchTerm}
                savedJobsFilterLocation={savedJobsFilterLocation}
                setSavedJobsFilterLocation={setSavedJobsFilterLocation}
                savedJobsFilterType={savedJobsFilterType}
                setSavedJobsFilterType={setSavedJobsFilterType}
                savedJobsSortBy={savedJobsSortBy}
                setSavedJobsSortBy={setSavedJobsSortBy}
                selectedSavedJob={selectedSavedJob}
                setSelectedSavedJob={setSelectedSavedJob}
                getMatchScoreColor={getMatchScoreColor}
                handleSaveJob={handleSaveJob}
                savedJobKeys={savedJobKeys}
                savingJobId={savingJobId}
                appliedJobs={appliedJobs}
                applyingJobId={applyingJobId}
                handleApplyToJob={handleApplyToJob}
                savedJobsLoaded={savedJobsLoaded}
              />
            )}

            {false && activeTab === "saved" && (
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
                    Showing {savedJobs.filter(job => 
                      !savedJobsSearchTerm || 
                      job.jobTitle.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                      job.company.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                      job.location.toLowerCase().includes(savedJobsSearchTerm.toLowerCase())
                    ).length} of {savedJobs.length} jobs
                  </p>
                </div>
                
                {savedJobs.filter(job => 
                  !savedJobsSearchTerm || 
                  job.jobTitle.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                  job.company.toLowerCase().includes(savedJobsSearchTerm.toLowerCase()) ||
                  job.location.toLowerCase().includes(savedJobsSearchTerm.toLowerCase())
                ).length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
                    {/* Left side - Saved Jobs List */}
                    <div className="lg:col-span-1 xl:col-span-2 space-y-4">
                      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#c5c4d4] scrollbar-track-transparent overflow-visible">
                      {savedJobs.filter(job => 
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
                        }
                        return 0; // recent (default order)
                      }).map((job, index) => (
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
                                    <Badge className={`${getMatchScoreColor(Math.round(((job.primaryMatchScore || 96) + (job.secondaryMatchScore || 90) + (job.tertiaryMatchScore || 85)) / 3))} bg-opacity-10`}>
                                      {Math.round(((job.primaryMatchScore || 96) + (job.secondaryMatchScore || 90) + (job.tertiaryMatchScore || 85)) / 3)}% match
                                    </Badge>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#6f7a80] mb-3">
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="h-4 w-4" />
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
                                      {job.salary}
                                    </span>
                                  </div>

                                  <p className="text-[#6f7a80] text-sm mb-3 truncate overflow-hidden whitespace-nowrap">
                                    {job.description || "No description available"}
                                  </p>

                                  <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                                    <span>Saved: {job.savedDate || new Date().toISOString().split('T')[0]}</span>
                                  </div>
                                </div>

                                {/* RIGHT BUTTON */}
                                <div className="flex flex-col gap-2 sm:self-start shrink-0">
                                  <button
                                    className="p-2 rounded-md transition-colors text-red-500 hover:bg-red-50 cursor-pointer"
                                    disabled={savingJobId === `${job.jobTitle || job.title}-${job.company}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveJob(job);
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

                    {/* Right side - Job Details */}
                    <div className="lg:col-span-1 xl:col-span-3">
                      {selectedSavedJob ? (
                        <Card className="sticky top-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-2xl font-bold text-[#3a4043] mb-2">
                                  {selectedSavedJob.jobTitle}
                                </CardTitle>
                                <div className="flex items-center gap-4 text-[#6f7a80] mb-4">
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" />
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
                                    {selectedSavedJob.salary}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <Badge className={`${getMatchScoreColor(Math.round(((selectedSavedJob.primaryMatchScore || 96) + (selectedSavedJob.secondaryMatchScore || 90) + (selectedSavedJob.tertiaryMatchScore || 85)) / 3))} bg-opacity-10 text-lg px-4 py-2`}>
                                  {Math.round(((selectedSavedJob.primaryMatchScore || 96) + (selectedSavedJob.secondaryMatchScore || 90) + (selectedSavedJob.tertiaryMatchScore || 85)) / 3)}% match
                                </Badge>
                                <button
                                  className="p-2 rounded-md transition-colors text-red-500 hover:bg-red-50 cursor-pointer"
                                  disabled={savingJobId === `${selectedSavedJob.jobTitle || selectedSavedJob.title}-${selectedSavedJob.company}`}
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
                              <p className="text-[#6f7a80] break-words leading-relaxed whitespace-pre-line">
                                {selectedSavedJob.description || "No job description available."}
                              </p>
                            </div>

                            {/* Requirements */}
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">Requirements</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedSavedJob.requirements?.map((req: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {req}
                                  </Badge>
                                )) || (
                                  <p className="text-[#6f7a80] text-sm">No specific requirements listed.</p>
                                )}
                              </div>
                            </div>

                            {/* Benefits */}
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">Benefits</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedSavedJob.benefits?.map((benefit: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-[#635bff]/20 text-[#635bff]">
                                    {benefit}
                                  </Badge>
                                )) || (
                                  <p className="text-[#6f7a80] text-sm">No benefits information available.</p>
                                )}
                              </div>
                            </div>

                            {/* Company Information */}
                            <div>
                              <h4 className="font-semibold text-[#3a4043] mb-3">Company Information</h4>
                              <div className="space-y-2 text-sm text-[#6f7a80]">
                                <div className="flex justify-between">
                                  <span>Company Size:</span>
                                  <span>{selectedSavedJob.companySize || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Saved:</span>
                                  <span>{selectedSavedJob.savedDate || new Date().toISOString().split('T')[0]}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Application Deadline:</span>
                                  <span>{selectedSavedJob.deadline || "Not specified"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-[#e8e6f0]">
                              <Button 
                                className="w-full bg-[#635bff] hover:bg-[#524aff] text-white cursor-pointer"
                                onClick={() => handleApplyToJob(selectedSavedJob)}
                              >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Apply Now
                              </Button>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 cursor-pointer"
                                  onClick={() => {
                                    setSavedJobs(prev => prev.filter(j => j.id !== selectedSavedJob.id));
                                    const remainingSavedJobs = savedJobs.filter(j => j.id !== selectedSavedJob.id);
                                    setSelectedSavedJob(remainingSavedJobs.length > 0 ? remainingSavedJobs[0] : null);
                                  }}
                                >
                                  <Bookmark className="w-4 h-4 mr-2" />
                                  Remove from Saved
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setShowMatchingScoreDialog(true)}
                                >
                                  <Share className="w-4 h-4 mr-2" />
                                  View Match
                                </Button>
                              </div>
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
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-base font-semibold text-gray-600 mb-2">
                        {savedJobs.length === 0 
                          ? "No saved jobs yet" 
                          : "No jobs found"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {savedJobs.length === 0 
                          ? "Browse jobs and save them for later!" 
                          : "Try adjusting your search criteria or filters to find more opportunities."}
                      </p>
                      {savedJobs.length > 0 && (
                        <Button
                          size="sm"
                          className="bg-[#635bff] hover:bg-[#5748e5] text-white"
                          onClick={() => setSavedJobsSearchTerm("")}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "profile config" && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {(() => {
                            const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                            return picUrl && picUrl.trim() !== "";
                          })() ? (
                            <img
                              src={
                                (() => {
                                  const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                                  if (!picUrl) return '';
                                  if (picUrl.startsWith("http")) {
                                    return `${picUrl}?t=${Date.now()}`;
                                  }
                                  // Match employer dashboard logic exactly
                                  return `${API_BASE}${picUrl.startsWith('/') ? '' : '/'}${picUrl}?t=${Date.now()}`;
                                })()
                              }
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                const picUrl = profilePictureUrl || candidateProfile.profilePictureUrl;
                                console.error("Profile picture failed to load in Profile Data tab:", picUrl);
                                console.error("Constructed URL:", picUrl?.startsWith("http") 
                                  ? picUrl 
                                  : `${API_BASE}${picUrl?.startsWith('/') ? '' : '/'}${picUrl}`);
                                // Show fallback camera icon
                                (e.target as HTMLImageElement).style.display = "none";
                                const parentDiv = e.currentTarget.parentElement;
                                if (parentDiv && !parentDiv.querySelector('.fallback-camera')) {
                                  const fallback = document.createElement("div");
                                  fallback.className = "w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 fallback-camera";
                                  fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`;
                                  parentDiv.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <input
                            id="profilePictureInput"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-[#635bff] text-white rounded-full cursor-pointer hover:bg-[#524aff] transition-colors"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Upload your profile picture</p>
                          <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { label: "Full Name", key: "fullName", type: "text", required: true },
                          { label: "Email", key: "emailAddress", type: "email", required: true },
                          { label: "Phone Number", key: "phoneNumber", type: "tel", required: true },
                          { label: "Date of Birth", key: "dateOfBirth", type: "date", required: true },
                          { label: "Gender", key: "gender", type: "select", options: ["Male", "Female", "Prefer not to mention"], required: true },
                          { label: "Nationality", key: "nationality", type: "select", options: ["Malaysian", "Non-Malaysian"], required: true },
                          { label: "OKU Card", key: "oku_card", type: "text" },
                          { label: "Preferred Role", key: "preferred_role", type: "select", options: ["Permanent", "Contract", "Part Time", "Internship"], required: true },
                          { label: "Preferred Industry", key: "preferred_industry", type: "select", options: ["Aerospace", "Agriculture", "Automotive", "Banking & Finance", "Biotechnology", "Chemical & Petrochemical", "Construction & Building Materials", "Creative & Media", "Digital Economy & Startups", "E-commerce & Retail", "Education", "Electrical & Electronics (E&E)", "Energy & Utilities", "Engineering & Machinery", "Fisheries & Aquaculture", "Food & Beverage Processing", "Forestry & Timber", "Green Technology & Renewable Energy", "Healthcare & Medical", "ICT & Software Development", "Legal & Professional Services", "Logistics & Transportation", "Manufacturing", "Mining & Minerals", "Oil & Gas", "Pharmaceuticals & Medical Devices", "Real Estate & Property Development", "Rubber", "Textiles & Apparel", "Tourism & Hospitality", "Others"], required: true },
                          { label: "Preferred Location", key: "preferred_location", type: "select", options: ["Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu", "Remote"], required: true },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {field.type === "select" ? (
                              <Select
                                value={
                                  (candidateProfile.personalIdentifiers[
                                    field.key as keyof typeof candidateProfile.personalIdentifiers
                                  ] as string) || ""
                                }
                                onValueChange={(val) => {
                                  setCandidateProfile({
                                    ...candidateProfile,
                                    personalIdentifiers: {
                                      ...candidateProfile.personalIdentifiers,
                                      [field.key as string]: val,
                                    },
                                    name: field.key === "fullName" ? val : candidateProfile.name,
                                    email: field.key === "emailAddress" ? val : candidateProfile.email,
                                  });
                                  if (field.required && val) {
                                    setErrors({ ...errors, [field.key]: "" });
                                  }
                                }}
                              >
                                <SelectTrigger className={`w-full rounded-lg px-3 py-2 text-left ${errors[field.key as string] ? "border-red-500" : "border-[#e8e6f0]"
                                  }`}>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                                  {field.options?.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                <input
                                  type={field.type}
                                  value={candidateProfile.personalIdentifiers[field.key as keyof typeof candidateProfile.personalIdentifiers] || ""}
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    let error = "";
                                    if (field.required && !value.trim()) {
                                      error = `${field.label} is required`;
                                    }
                                    if (field.type === "email") {
                                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                      if (!emailRegex.test(value)) {
                                        error = "Please enter a valid email address.";
                                      }
                                    }
                                    if (field.type === "tel") {
                                      const numericRegex = /^[0-9+\- ]*$/;
                                      if (!numericRegex.test(value)) {
                                        error = "Please enter a valid phone number.";
                                      }
                                    }

                                    setErrors({ ...errors, [field.key]: error });

                                    setCandidateProfile({
                                      ...candidateProfile,
                                      personalIdentifiers: {
                                        ...candidateProfile.personalIdentifiers,
                                        [field.key as keyof typeof candidateProfile.personalIdentifiers]: e.target.value,
                                      },
                                      name: field.key === "fullName" ? e.target.value : candidateProfile.name,
                                      email: field.key === "emailAddress" ? e.target.value : candidateProfile.email,
                                    });
                                  }}
                                  className={`w-full px-3 py-2 border rounded-lg outline-none focus-visible:ring-[1px] ${errors[field.key as string]
                                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                                    : "border-[#e8e6f0] focus-visible:border-gray-400 focus-visible:ring-gray-400/50"
                                    }`}
                                />
                                {errors[field.key as string] && (
                                  <p className="text-red-500 text-xs mt-1">{errors[field.key as string]}</p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                 <hr className="border-gray-200 my-8" />
                  <div className="flex justify-end mt-4">
                    <ProfileSubmission
                      candidateProfile={{
                        personalIdentifiers: candidateProfile.personalIdentifiers,
                        name: candidateProfile.name,
                        email: candidateProfile.email,
                        location: candidateProfile.location,
                      }}
                      onSave={() => {
                        calculateProfileCompletion();
                        refreshProfileData();
                      }}
                    />
                  </div>
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {educations.map((edu, index) => (
                    <Card key={edu.id}>
                      <CardHeader className="flex justify-between items-center">
                        <CardTitle>Education {index + 1}</CardTitle>
                        {index > 0 && (
                          <button
                            onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {[
                            {
                              label: "Level",
                              key: "level",
                              type: "select",
                              options: ["PT3", "SPM / O-level", "STPM / A-level / Diploma", "Degree", "Master", "PhD", "Vocational", "Professional Certificate"],
                            },
                            { label: "University / College / School", key: "institution", type: "text" },
                            { label: "Field of Study", key: "fieldOfStudy", type: "text" },
                            {
                              label: "Graduation Year",
                              key: "graduationYear",
                              type: "select",
                              options: grad_year.map(String),
                            },
                            { label: "CGPA / Grade", key: "cgpa_grade", type: "text" },
                            { label: "Award (If Applicable)", key: "award", type: "text" },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-[#3a4043] mb-1">
                                {field.label}
                              </label>

                              {field.type === "select" ? (
                                <select
                                  value={
                                    field.key === "graduationYear"
                                      ? edu[field.key] ?? ""
                                      : edu[field.key as keyof typeof edu] || ""
                                  }
                                  onChange={(e) =>
                                    updateEducation(edu.id, {
                                      [field.key]:
                                        field.key === "graduationYear"
                                          ? e.target.value
                                            ? parseInt(e.target.value)
                                            : null
                                          : e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                                >
                                  <option value="">
                                    {field.key === "graduationYear" ? "Select year" : "Select"}
                                  </option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={edu[field.key as keyof typeof edu] || ""}
                                  onChange={(e) =>
                                    updateEducation(edu.id, { [field.key]: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end py-3">
                          <Button
                            onClick={() =>
                              setEducations([
                                ...educations,
                                {
                                  id: Date.now(),
                                  level: "",
                                  fieldOfStudy: "",
                                  institution: "",
                                  graduationYear: null,
                                  cgpa_grade: "",
                                  award: "",
                                },
                              ])
                            }
                            className="bg-[#635bff] hover:bg-[#827CFF] text-white hover:cursor-pointer"
                          >
                            + Add Education
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                
                <hr className="border-gray-200 my-8" />
                <div className="flex justify-end">
                  <EducationSubmission
                    educations={educations}
                    onSave={() => {
                      calculateProfileCompletion();
                      refreshProfileData();
                    }}
                  />
                </div>
              </div>
            )}

             {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {experiences.map((exp, index) => (
                    <Card key={exp.id}>
                      <CardHeader className="flex justify-between items-center">
                        <CardTitle>Experience {index + 1}</CardTitle>
                        {index > 0 && (
                          <button
                            onClick={() =>
                              setExperiences(experiences.filter((e) => e.id !== exp.id))
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {[
                            { label: "Employer", key: "employer", type: "text" },
                            { label: "Title", key: "title", type: "text" },
                            { label: "Seniority", key: "seniorityLevel", type: "select", options: ["Non-executive", "Executive", "Managerial", "Head of Department", "C-suite"] },
                            { label: "Industry", key: "industry", type: "select", options: ["Aerospace", "Agriculture", "Automotive", "Banking & Finance", "Biotechnology", "Chemical & Petrochemical", "Construction & Building Materials", "Creative & Media", "Digital Economy & Startups", "E-commerce & Retail", "Education", "Electrical & Electronics (E&E)", "Energy & Utilities", "Engineering & Machinery", "Fisheries & Aquaculture", "Food & Beverage Processing", "Forestry & Timber", "Green Technology & Renewable Energy", "Healthcare & Medical", "ICT & Software Development", "Legal & Professional Services", "Logistics & Transportation", "Manufacturing", "Mining & Minerals", "Oil & Gas", "Pharmaceuticals & Medical Devices", "Real Estate & Property Development", "Rubber", "Textiles & Apparel", "Tourism & Hospitality", "Others"] },
                            { label: "Start Date", key: "start", type: "month" }, // <--- CHANGE HERE: type to "month"
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-[#3a4043] mb-1">
                                {field.label}
                              </label>

                              {field.type === "select" ? (
                                <Select
                                  value={String(exp[field.key as keyof typeof exp] ?? "")}
                                  onValueChange={(val) => updateExperience(exp.id, { [field.key]: val })}
                                >
                                  <SelectTrigger className="w-full border border-[#e8e6f0] rounded-lg px-3 py-2 text-left">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                                    {field.options?.map((opt) => (
                                      <SelectItem key={opt} value={opt}>
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <input
                                  type={field.type}
                                  // Ensure value is formatted as YYYY-MM for type="month"
                                  value={field.type === "month" 
                                    ? String(exp[field.key as keyof typeof exp] ?? "").substring(0, 7)
                                    : String(exp[field.key as keyof typeof exp] ?? "")}
                                  onChange={(e) => updateExperience(exp.id, { [field.key]: e.target.value })}
                                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                                />
                              )}
                            </div>
                          ))}

                          <div>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              End Date
                            </label>
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                id={`current-${exp.id}`}
                                checked={exp.isCurrent}
                                onChange={(e) =>
                                  updateExperience(exp.id, {
                                    isCurrent: e.target.checked,
                                    end: e.target.checked ? "" : exp.end,
                                  })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-[#635bff] focus:ring-[#635bff]"
                              />
                              <label
                                htmlFor={`current-${exp.id}`}
                                className="text-sm text-gray-600"
                              >
                                I currently work here
                              </label>
                            </div>
                            {!exp.isCurrent && (
                              <input
                                type="month" // <--- CHANGE HERE: type to "month"
                                // Ensure value is formatted as YYYY-MM for type="month"
                                value={exp.end ? exp.end.substring(0, 7) : ""} // <--- CHANGE HERE: substring(0,7)
                                onChange={(e) =>
                                  updateExperience(exp.id, { end: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              Project Highlights
                            </label>
                            <textarea
                              value={String(exp.projectHighlights ?? "")}
                              onChange={(e) => {
                                updateExperience(exp.id, { projectHighlights: e.target.value });
                              }}
                              rows={4}
                              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              Achievements
                            </label>
                            <textarea
                              value={String(exp.achievements ?? "")}
                              onChange={(e) => {
                                updateExperience(exp.id, { achievements: e.target.value });
                              }}
                              rows={4}
                              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                            />
                          </div>
                        </div> 
                        <div className="flex justify-end">
                          <Button
                            onClick={() =>
                              setExperiences([
                                ...experiences,
                                {
                                  id: Date.now(),
                                  employer: "",
                                  title: "",
                                  industry: "",
                                  start: "",
                                  end: "",
                                  isCurrent: true,
                                  seniorityLevel: "",
                                  skillsToolsUsed: "",
                                  projectHighlights: "",
                                  achievements: "",
                                },
                              ])
                            }
                            className="bg-[#635bff] hover:bg-[#827CFF] text-white hover:cursor-pointer"
                          >
                            + Add Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <hr className="border-gray-200 my-4" />

                  <div className="flex justify-end">
                    <ExperienceSkillsSubmission
                      experiences={experiences}
                      // exp_skill={candidateProfile.exp_skill}
                      onSave={() => {
                        calculateProfileCompletion();
                        refreshProfileData();
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* ---- Skill Types Card ---- */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Soft Skills", key: "SoftSkills" },
                        { label: "Hard Skills", key: "HardSkills" },
                      ].map((field) => {
                        const key = field.key as keyof typeof candidateProfile.exp_skill;
                        const value = candidateProfile.exp_skill[key] ?? "";

                        return (
                          <div key={key} className="w-full">
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                setCandidateProfile({
                                  ...candidateProfile,
                                  exp_skill: {
                                    ...candidateProfile.exp_skill,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                            />
                          </div>
                        );
                      })}
                      
                    </CardContent>
                  </Card>

                  {/* ---- Language Proficiency Card ---- */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <CardTitle>Language Proficiency</CardTitle>
                        <Button
                          onClick={() => {
                            setLanguageProficiencies([
                              ...languageProficiencies,
                              {
                                id: Date.now(),
                                language: "",
                                reading: "",
                                writing: "",
                                listening: "",
                                speaking: "",
                              },
                            ]);
                          }}
                          className="bg-[#635bff] hover:bg-[#827CFF] text-white w-full sm:w-auto hover:cursor-pointer"
                        >
                          + Add Language
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Desktop table view */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm md:text-base">
                          <thead>
                            <tr className="border-b">
                              {[
                                "Language",
                                "Reading",
                                "Writing",
                                "Listening",
                                "Speaking",
                                "Action",
                              ].map((heading) => (
                                <th
                                  key={heading}
                                  className="text-left p-2 font-medium text-[#3a4043] whitespace-nowrap"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {languageProficiencies.map((prof, index) => (
                              <tr key={prof.id || index} className="border-b">
                                <td className="p-2 min-w-[160px]">
                                  <Select
                                    value={prof.language}
                                    onValueChange={(value) => {
                                      const updated = [...languageProficiencies];
                                      updated[index] = { ...prof, language: value };
                                      setLanguageProficiencies(updated);
                                    }}
                                  >
                                    <SelectTrigger className="w-full md:w-[180px] hover:cursor-pointer">
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        "Arabic",
                                        "Bengali",
                                        "Chinese",
                                        "English",
                                        "French",
                                        "German",
                                        "Hindi",
                                        "Indonesian",
                                        "Italian",
                                        "Japanese",
                                        "Korean",
                                        "Malay",
                                        "Portuguese",
                                        "Russian",
                                        "Spanish",
                                        "Tamil",
                                        "Thai",
                                        "Turkish",
                                        "Vietnamese",
                                        "Other",
                                      ].map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                          {lang}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                {["reading", "writing", "listening", "speaking"].map(
                                  (skill) => (
                                    <td key={skill + prof.id} className="p-2 min-w-[140px]">
                                      <Select
                                        value={String(
                                          prof[skill as keyof LanguageProficiency]
                                        )}
                                        onValueChange={(value) => {
                                          const updated = [...languageProficiencies];
                                          updated[index] = { ...prof, [skill]: value };
                                          setLanguageProficiencies(updated);
                                        }}
                                      >
                                        <SelectTrigger className="w-full md:w-[140px] hover:cursor-pointer">
                                          <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {["Expert", "Intermediate", "Beginner"].map(
                                            (level) => (
                                              <SelectItem key={level} value={level}>
                                                {level}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </td>
                                  )
                                )}

                                <td className="p-2 text-center">
                                  <Button
                                    onClick={() => {
                                      const updated = languageProficiencies.filter(
                                        (_, i) => i !== index
                                      );
                                      setLanguageProficiencies(updated);
                                    }}
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-800 hover:bg-red-100 hover:cursor-pointer"
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile stacked view */}
                      <div className="flex flex-col gap-4 md:hidden">
                        {languageProficiencies.map((prof, index) => (
                          <div
                            key={prof.id ?? `lang-${index}`} // fallback to index if id missing
                            className="border border-[#e8e6f0] rounded-lg p-3 space-y-3"
                          >
                            <div>
                              <label className="block text-sm font-medium text-[#3a4043] mb-1">
                                Language
                              </label>
                              <Select
                                value={prof.language}
                                onValueChange={(value) => {
                                  const updated = [...languageProficiencies];
                                  updated[index] = { ...prof, language: value };
                                  setLanguageProficiencies(updated);
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Arabic",
                                    "Bengali",
                                    "Chinese",
                                    "English",
                                    "French",
                                    "German",
                                    "Hindi",
                                    "Indonesian",
                                    "Italian",
                                    "Japanese",
                                    "Korean",
                                    "Malay",
                                    "Portuguese",
                                    "Russian",
                                    "Spanish",
                                    "Tamil",
                                    "Thai",
                                    "Turkish",
                                    "Vietnamese",
                                    "Other",
                                  ].map((lang) => (
                                    <SelectItem key={lang} value={lang}>
                                      {lang}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {["Reading", "Writing", "Listening", "Speaking"].map((skill) => (
                              <div key={skill}>
                                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                                  {skill}
                                </label>
                                <Select
                                  value={
                                    prof[skill.toLowerCase() as keyof LanguageProficiency]
                                      ? String(
                                        prof[skill.toLowerCase() as keyof LanguageProficiency]
                                      )
                                      : ""
                                  }
                                  onValueChange={(value) => {
                                    const updated = [...languageProficiencies];
                                    updated[index] = {
                                      ...prof,
                                      [skill.toLowerCase()]: value,
                                    };
                                    setLanguageProficiencies(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["Expert", "Intermediate", "Beginner"].map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}

                            <div className="pt-2">
                              <Button
                                onClick={() => {
                                  const updated = languageProficiencies.filter(
                                    (_, i) => i !== index
                                  );
                                  setLanguageProficiencies(updated);
                                }}
                                variant="ghost"
                                className="text-red-600 hover:text-red-800 hover:bg-red-100 w-full"
                              >
                                Delete Language
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                    </CardContent>
                  </Card>
                  {/* Save Skills button */}
                  <hr className="border-gray-200 my-8" />
                      <div className="flex justify-end">
                        <SkillsSubmission
                          exp_skill={candidateProfile.exp_skill}
                          languageProficiencies={languageProficiencies}
                          userEmail={session?.user?.email || ""}
                          onSave={() => {
                            calculateProfileCompletion();
                            refreshProfileData();
                          }}
                        />
                      </div>
                </div>
              </div>
            )}


            {activeTab === "neuro_strength" && (
             <Card> 
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between my-6">
                      <p className="text-sm font-semibold text-gray-600">Select Your Top 10 Strengths</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {strengthOptions
                          .filter((strength) => !selectedStrengths.includes(strength))
                          .map((strength) => (
                            <Button
                              key={strength}
                              variant="outline"
                              className="rounded-full border border-purple-400 text-purple-600 hover:bg-purple-50"
                              onClick={() => toggleStrength(strength)}
                            >
                              {strength}
                              <Plus className="ml-2 h-4 w-4" />
                            </Button>
                          ))}
                      </div>

                      {selectedStrengths.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-[#3a4043] mb-2">Selected Strengths:</h3>
                          <div className="flex flex-wrap gap-3">
                            {selectedStrengths.map((strength) => (
                              <Button
                                key={strength}
                                variant="outline"
                                className="rounded-full border border-purple-400 bg-purple-100 text-purple-600 hover:bg-purple-200"
                                onClick={() => toggleStrength(strength)}
                              >
                                {strength}
                                <X className="ml-2 h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      <hr className="border-gray-200 my-8" />
                      <div className="flex justify-end mt-4">
                      <NeuroStrengthSubmission
                        selectedStrengths={selectedStrengths}
                        onSave={() => {
                          calculateProfileCompletion();
                          // Only dispatch event, don't trigger full data refetch
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('profileUpdated'));
                          }
                        }}
                      />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "environment" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication & Social Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Preferred Communication Medium", key: "communicationMedium", options: ["Written", "Verbal", "Mix"] },
                        { label: "Clarity of communication", key: "clarity", options: ["Prefer clear, literal instruction", "No preference on this"] },
                        { label: "Team Collaboration Style", key: "teamStyle", options: ["Prefer to work independently", "Prefer small, close-knit team", "Prefer large, dynamic team"] },
                        { label: "Presentation", key: "presentationComfort", options: ["Comfortable with presentation", "Not comfortable with presentation", "Not comfortable, but willing to try"] },
                        { label: "Check-ins", key: "checkIns", options: ["Prefer frequent check-ins", "Prefer scheduled check-ins", "Prefer autonomy and check-ins at agreed milestone"] },
                        { label: "Job Coach", key: "jobCoach", options: ["Prefer having a job coach", "Not required any job coach"] },
                      ].map((field) => {
                        const value = candidateProfile.environment[field.key as keyof typeof candidateProfile.environment] ?? "";
                        return (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">{field.label}</label>
                            <Select
                              value={value}
                              onValueChange={(val) =>
                                setCandidateProfile({
                                  ...candidateProfile,
                                  environment: { ...candidateProfile.environment, [field.key]: val },
                                })
                              }
                            >
                              <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                                {field.options.map((opt) => (
                                  <SelectItem
                                    key={opt}
                                    value={opt}
                                    className="
                                      cursor-pointer
                                      text-gray-700
                                      hover:bg-[#635bff]/10
                                      hover:text-[#635bff]
                                      focus:bg-[#635bff]/20
                                      focus:text-[#635bff]
                                      transition-colors
                                    "
                                  >
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sensory Needs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Auditory Preferences", key: "auditory", options: ["Prefer quiet environment", "Can have ambient noise", "Prefer lively environment"] },
                        { label: "Visual Preferences", key: "visual", options: ["Bright lighting", "Natural lighting", "Dim lighting"] },
                        { label: "Workspace Preferences", key: "workspace", options: ["Fixed table", "Hot desk", "Work from anywhere / home"] },
                        { label: "Workday Structure", key: "workdayStructure", options: ["Fixed work hour", "Flexible work hour"] },
                      ].map((field) => {
                        const value = candidateProfile.environment[field.key as keyof typeof candidateProfile.environment] ?? "";
                        return (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">{field.label}</label>
                            <Select
                              value={value}
                              onValueChange={(val) =>
                                setCandidateProfile({
                                  ...candidateProfile,
                                  environment: { ...candidateProfile.environment, [field.key]: val },
                                })
                              }
                            >
                              <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                                {field.options.map((opt) => (
                                  <SelectItem
                                    key={opt}
                                    value={opt}
                                    className="
                                      cursor-pointer
                                      text-gray-700
                                      hover:bg-[#635bff]/10
                                      hover:text-[#635bff]
                                      focus:bg-[#635bff]/20
                                      focus:text-[#635bff]
                                      transition-colors
                                    "
                                  >
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
                <hr className="border-gray-200 my-8" />
                <div className="flex justify-end mt-4">
                  <EnvironmentSubmission
                    environment={candidateProfile.environment}
                    onSave={() => {
                      calculateProfileCompletion();
                      refreshProfileData();
                    }}
                  />
                
                </div>
              </div>
            )}

            {activeTab === "mock interview" && (
              <>
                {mockInterviewStep === "setup" && (
                  <MockInterviewSetupPage onNavigate={(target) => {
                    if (target === "interview") {
                      setMockInterviewStep("process");
                    } else if (target === "history") {
                      setMockInterviewStep("history");
                    }
                  }} />
                )}

                {mockInterviewStep === "process" && (
                  <MockInterviewProcessPage onNavigate={(target) => {
                    if (target === "feedback") {
                      setMockInterviewStep("feedback");
                    }
                  }} />
                )}

                {mockInterviewStep === "feedback" && (
                  <MockInterviewFeedbackPage onNavigate={(target) => {
                    if (target === "setup") {
                      setMockInterviewStep("setup");
                    } else if (target === "history") {
                      setMockInterviewStep("history");
                    }
                  }} />
                )}

                {mockInterviewStep === "history" && (
                  <InterviewHistoryPage onNavigate={(target, reportId) => {
                    if (target === "history-detail" && reportId) {
                      setSelectedReportId(reportId);
                      setMockInterviewStep("history-detail");
                    } else if (target === "setup") {
                      setMockInterviewStep("setup");
                    }
                  }} />
                )}

                {mockInterviewStep === "history-detail" && selectedReportId && (
                  <InterviewReportDetailPage 
                    reportId={selectedReportId}
                    onNavigate={(target) => {
                      if (target === "history") {
                        setMockInterviewStep("history");
                        setSelectedReportId(null);
                      } else if (target === "setup") {
                        setMockInterviewStep("setup");
                        setSelectedReportId(null);
                      }
                    }}
                  />
                )}
              </>
            )}

            {activeTab === "Report" && (
              <ReportPage handleTabChangeProp={() => handleTabChange("mock interview")}/>
            )}

            {activeTab === "Appointment" && (
              <AppointmentPage />
            )}

          </div>
        </div>
        
      </div>
    </div>
  );
}
