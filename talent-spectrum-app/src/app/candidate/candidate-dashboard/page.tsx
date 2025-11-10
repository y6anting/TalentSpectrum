"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  User, Briefcase, Heart, Eye, Settings, Book, House, Clock, CheckCircle, XCircle, MapPin, DollarSign, Shield, Plus, X, BrainCircuit,
  HandFist, LetterTextIcon, UserStar, MessagesSquare, CalendarClock, FileText, LayoutDashboard, Search, Calendar, Video
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
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
import ReportPage from "./Report/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AppointmentPage from "./Appointment/page";

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mockInterviewStep, setMockInterviewStep] = useState<"setup" | "process" | "feedback">("setup");

  const [showMatchingScoreDialog, setShowMatchingScoreDialog] = useState(false);

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
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [selectedSavedJob, setSelectedSavedJob] = useState<any | null>(null);
  
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    name: "Aminah",
    email: "",
    location: "Remote",
    profileCompletion: 85,
    accommodations: ["Flexible hours", "Quiet workspace", "Written instructions"],
    preferences: {
      workType: "Remote",
      communication: "Email preferred",
      schedule: "Flexible hours",
    },
    personalIdentifiers: {
      fullName: "Alex Johnson",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      emailAddress: "alex.johnson@email.com",
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

      const sessionEmail = session?.user?.email || "";
      // const candidate_email = sessionEmail

      if (!sessionEmail) {
        console.error('No email found in session.user.email. Cannot fetch profile.');
        setIsLoading(false);
        return;
      }
        
        const emailToUse = encodeURIComponent(sessionEmail); // Removed || '' as sessionEmail is already guaranteed not empty here
        const candidate_email = encodeURIComponent(sessionEmail);
        console.log('Using email for profile fetch:', emailToUse);

        const response = await fetch(`http://127.0.0.1:8000/profiles/${candidate_email}`, {
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
              email: data.email || sessionEmail || candidateProfile.email,
              location: data.location || candidateProfile.location,
              profileCompletion: data.profile_completion || candidateProfile.profileCompletion,
              accommodations: data.accommodations || candidateProfile.accommodations,
              preferences: data.preferences || candidateProfile.preferences,
              personalIdentifiers: {
                ...candidateProfile.personalIdentifiers,
                ...data.personal_identifiers,
                emailAddress: data.personal_identifiers?.emailAddress || data.email || sessionEmail || candidateProfile.personalIdentifiers.emailAddress
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
            if (data.neurodivergent_strengths?.length > 0) {
              setSelectedStrengths(data.neurodivergent_strengths);
            }
            
            setDataLoaded(true);
          } else {
            console.error('No data in response:', data);
            
            // If no data but we have email, at least populate the email field
            if (sessionEmail) {
              setCandidateProfile(prev => ({
                ...prev,
                email: sessionEmail,
                personalIdentifiers: {
                  ...prev.personalIdentifiers,
                  emailAddress: sessionEmail
                }
              }));
            }
          }
          setIsLoading(false);
        } else if (response.status === 404) {
          console.log('Profile not found, creating new profile with email');
          
          // If profile not found but we have email, create a basic profile
          if (sessionEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: sessionEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: sessionEmail
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
          if (sessionEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: sessionEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: sessionEmail
              }
            }));
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        // If there's an error but we have email, at least populate the email field
        const fallbackEmail = typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : null;
        if (fallbackEmail) {
          setCandidateProfile(prev => ({
            ...prev,
            email: fallbackEmail,
            personalIdentifiers: {
              ...prev.personalIdentifiers,
              emailAddress: fallbackEmail
            }
          }));
        }
        
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [status, session]);

    useEffect(() => {
    const fetchEducationData = async () => {
      if (status === "loading") return;
      if (!session?.user?.email) return;

      setIsLoading(true);


      try {
        const response = await fetch(
          `http://127.0.0.1:8000/profiles/${session.user.email}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch candidate profile");
        }

        const data = await response.json();

        // ✅ Check if education data exists and is valid
        if (data.education && Array.isArray(data.education) && data.education.length > 0) {
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
  }, [session, status]); 
  
  useEffect(() => {
  const fetchExperienceData = async () => {
    if (status === "loading") return;
    if (!session?.user?.email) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/profiles/${session.user.email}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candidate profile");
      }

      const data = await response.json();

      // ✅ Check if experience data exists and is valid
      if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
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
}, [session, status]);

  // rerun when user logs in
  // // Fetch applications data
  // useEffect(() => {
  //   const fetchApplicationsData = async () => {
  //     try {
  //       let sessionEmail = typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : null;
        
  //       // If no email in sessionStorage but we have session email, use it
  //       if (!sessionEmail && session?.user?.email) {
  //         sessionEmail = session.user.email;
  //       }
        
  //       if (!sessionEmail) {
  //         console.error('No email found for fetching applications');
  //         return;
  //       }

  //       const emailToUse = encodeURIComponent(sessionEmail);
  //       console.log('Fetching applications for email:', emailToUse);
        
  //       const response = await fetch(`http://127.0.0.1:8000/profiles/${emailToUse}/applications`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });
        
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Applications API Response:', data);
  //         setApplications(data);
  //       } else {
  //         console.error('Failed to fetch applications:', response.status);
  //         setApplications([]); // Set empty array if no applications found
  //       }
  //     } catch (error) {
  //       console.error('Error fetching applications data:', error);
  //       setApplications([]); // Set empty array on error
  //     }
  //   };

  //   if (session?.user?.email || (typeof window !== 'undefined' && sessionStorage.getItem('userEmail'))) {
  //     fetchApplicationsData();
  //   }
  // }, [session]);

  // // Fetch saved jobs data
  // useEffect(() => {
  //   const fetchSavedJobsData = async () => {
  //     try {
  //       let sessionEmail = typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : null;
        
  //       // If no email in sessionStorage but we have session email, use it
  //       if (!sessionEmail && session?.user?.email) {
  //         sessionEmail = session.user.email;
  //       }
        
  //       if (!sessionEmail) {
  //         console.error('No email found for fetching saved jobs');
  //         return;
  //       }

  //       const emailToUse = encodeURIComponent(sessionEmail);
  //       console.log('Fetching saved jobs for email:', emailToUse);
        
  //       const response = await fetch(`http://127.0.0.1:8000/profiles/${emailToUse}/saved-jobs`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });
        
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Saved Jobs API Response:', data);
  //         setSavedJobs(data);
  //       } else {
  //         console.error('Failed to fetch saved jobs:', response.status);
  //         setSavedJobs([]); // Set empty array if no saved jobs found
  //       }
  //     } catch (error) {
  //       console.error('Error fetching saved jobs data:', error);
  //       setSavedJobs([]); // Set empty array on error
  //     }
  //   };

  //   if (session?.user?.email || (typeof window !== 'undefined' && sessionStorage.getItem('userEmail'))) {
  //     fetchSavedJobsData();
  //   }
  // }, [session]);

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

  // Debug education state changes
  useEffect(() => {
    console.log('Education state changed:', educations);
  }, [educations]);

  // Load sample applications data (for demonstration)
  useEffect(() => {
    // Sample applications data
    const sampleApplications = [
      {
        id: 1,
        jobTitle: "Marketing Director",
        company: "Olive Club",
        location: "Kuala Lumpur",
        salary: "RM 7500 - RM 10,000 / month",
        status: "under_review",
        appliedDate: "2025-01-17",
        score: 90,
        accommodationsRequested: true,
        description: "We are seeking a creative and strategic Marketing Director to lead our marketing team and drive brand awareness across multiple channels. The ideal candidate will have a proven track record in developing and executing comprehensive marketing strategies.",
        requirements: [
          "Bachelor's degree in Marketing, Business, or related field",
          "7+ years of experience in marketing, with 3+ years in a leadership role",
          "Strong analytical and project management skills",
          "Excellent communication and presentation abilities",
          "Experience with digital marketing platforms and analytics tools"
        ],
        benefits: [
          "Competitive salary package",
          "Health and dental insurance",
          "Flexible working hours",
          "Professional development opportunities",
          "Annual performance bonus"
        ],
        companySize: "50-200 employees",
        founded: "2015",
        deadline: "2025-02-28"
      },
      {
        id: 2,
        jobTitle: "Senior Manager",
        company: "Olive Club",
        location: "Kuala Lumpur",
        salary: "RM 6500 - RM 9000 / month",
        status: "interview_scheduled",
        appliedDate: "2025-01-15",
        interviewDate: "2025-01-25 at 10:00 AM",
        score: 85,
        accommodationsRequested: true,
        description: "Join our dynamic team as a Senior Manager where you'll oversee daily operations, lead a team of professionals, and contribute to strategic planning initiatives.",
        requirements: [
          "Bachelor's degree in Business Administration or related field",
          "5+ years of management experience",
          "Strong leadership and team building skills",
          "Excellent problem-solving abilities",
          "Proficiency in project management tools"
        ],
        benefits: [
          "Comprehensive health coverage",
          "Retirement savings plan",
          "Paid time off and holidays",
          "Team building activities",
          "Career advancement opportunities"
        ],
        companySize: "50-200 employees",
        founded: "2015",
        deadline: "2025-02-15"
      },
      {
        id: 3,
        jobTitle: "Marketing Director",
        company: "Olive Club",
        location: "Remote",
        salary: "RM 8000 - RM 12,000 / month",
        status: "under_review",
        appliedDate: "2025-01-12",
        score: 88,
        accommodationsRequested: false,
        description: "Remote opportunity for an experienced Marketing Director to develop and implement marketing strategies that align with business objectives and drive growth.",
        requirements: [
          "Master's degree preferred, Bachelor's required",
          "8+ years in marketing with leadership experience",
          "Strong digital marketing expertise",
          "Data-driven decision making skills",
          "Experience managing remote teams"
        ],
        benefits: [
          "Fully remote position",
          "Flexible schedule",
          "Generous PTO policy",
          "Home office stipend",
          "Professional development budget"
        ],
        companySize: "200-500 employees",
        founded: "2012",
        deadline: "2025-03-01"
      },
      {
        id: 4,
        jobTitle: "Senior Manager",
        company: "Olive Club",
        location: "Kuala Lumpur",
        salary: "RM 7000 - RM 9500 / month",
        status: "under_review",
        appliedDate: "2025-01-10",
        score: 92,
        accommodationsRequested: true,
        description: "We're looking for a Senior Manager to join our operations team and help streamline processes while maintaining our high standards of quality and customer satisfaction.",
        requirements: [
          "Relevant degree in Business or Operations Management",
          "6+ years of progressive management experience",
          "Strong analytical and strategic thinking",
          "Excellent interpersonal skills",
          "Proven track record of process improvement"
        ],
        benefits: [
          "Competitive compensation package",
          "Medical and wellness benefits",
          "Performance-based bonuses",
          "Learning and development programs",
          "Work-life balance initiatives"
        ],
        companySize: "50-200 employees",
        founded: "2015",
        deadline: "2025-02-20"
      },
      {
        id: 5,
        jobTitle: "Marketing Director",
        company: "Olive Club",
        location: "Kuala Lumpur",
        salary: "RM 7500 - RM 10,500 / month",
        status: "under_review",
        appliedDate: "2025-01-08",
        score: 87,
        accommodationsRequested: false,
        description: "Lead our marketing efforts and shape brand strategy for one of the fastest-growing companies in the region. This role offers the opportunity to make a significant impact.",
        requirements: [
          "Bachelor's or Master's in Marketing",
          "7+ years of marketing experience",
          "Experience in brand development",
          "Strong creativity and innovation skills",
          "Budget management experience"
        ],
        benefits: [
          "Attractive salary and benefits",
          "Stock options",
          "Health and wellness programs",
          "Collaborative work environment",
          "Career growth opportunities"
        ],
        companySize: "50-200 employees",
        founded: "2015",
        deadline: "2025-02-25"
      }
    ];

    setApplications(sampleApplications);
    // Automatically select the first application
    if (sampleApplications.length > 0) {
      setSelectedApplication(sampleApplications[0]);
    }

    // Sample saved jobs data
    const sampleSavedJobs = [
      {
        id: 101,
        jobTitle: "Software Engineer",
        company: "TechCorp Solutions",
        location: "Kuala Lumpur",
        salary: "RM 6000 - RM 9000 / month",
        type: "Full-time",
        score: 88,
        description: "Join our innovative team as a Software Engineer where you'll develop cutting-edge applications and work with the latest technologies.",
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          "3+ years of software development experience",
          "Proficiency in JavaScript, React, and Node.js",
          "Strong problem-solving skills",
          "Experience with agile methodologies"
        ],
        benefits: [
          "Competitive salary and bonuses",
          "Health insurance coverage",
          "Flexible working hours",
          "Professional development budget",
          "Modern office environment"
        ],
        companySize: "100-500 employees",
        founded: "2010",
        deadline: "2025-03-15",
        isInclusive: true,
        hasAccommodations: true
      },
      {
        id: 102,
        jobTitle: "UX Designer",
        company: "Creative Studio",
        location: "Remote",
        salary: "RM 5500 - RM 8000 / month",
        type: "Full-time",
        score: 92,
        description: "We're looking for a talented UX Designer to create intuitive and beautiful user experiences for our diverse range of clients.",
        requirements: [
          "Portfolio demonstrating UX design expertise",
          "4+ years of UX/UI design experience",
          "Proficiency in Figma, Sketch, or Adobe XD",
          "Understanding of user-centered design principles",
          "Experience conducting user research"
        ],
        benefits: [
          "Remote work flexibility",
          "Generous PTO policy",
          "Creative freedom",
          "Latest design tools and software",
          "Collaborative team culture"
        ],
        companySize: "20-50 employees",
        founded: "2018",
        deadline: "2025-03-20",
        isInclusive: true,
        hasAccommodations: true
      },
      {
        id: 103,
        jobTitle: "Data Analyst",
        company: "Analytics Inc",
        location: "Penang",
        salary: "RM 5000 - RM 7500 / month",
        type: "Full-time",
        score: 85,
        description: "Seeking a detail-oriented Data Analyst to help us make data-driven decisions and provide insights that drive business growth.",
        requirements: [
          "Bachelor's degree in Statistics, Mathematics, or related field",
          "2+ years of data analysis experience",
          "Strong SQL and Excel skills",
          "Experience with data visualization tools (Tableau, Power BI)",
          "Analytical and critical thinking abilities"
        ],
        benefits: [
          "Competitive compensation",
          "Health and wellness programs",
          "Training and development opportunities",
          "Work-life balance initiatives",
          "Collaborative work environment"
        ],
        companySize: "50-200 employees",
        founded: "2015",
        deadline: "2025-03-10",
        isInclusive: false,
        hasAccommodations: true
      }
    ];

    setSavedJobs(sampleSavedJobs);
    // Automatically select the first saved job
    if (sampleSavedJobs.length > 0) {
      setSelectedSavedJob(sampleSavedJobs[0]);
    }
  }, []);

  // Handle tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle applying for a saved job - move it from saved to applications
  const handleApplyForSavedJob = (job: any) => {
    // Create a new application from the saved job
    const newApplication = {
      ...job,
      id: applications.length > 0 ? Math.max(...applications.map(app => app.id)) + 1 : 1,
      status: "under_review",
      appliedDate: new Date().toISOString().split('T')[0],
      accommodationsRequested: job.hasAccommodations || false,
    };

    // Add to applications
    setApplications(prev => [newApplication, ...prev]);

    // Remove from saved jobs
    setSavedJobs(prev => prev.filter(savedJob => savedJob.id !== job.id));

    // Update selected saved job if needed
    if (selectedSavedJob?.id === job.id) {
      const remainingSavedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
      setSelectedSavedJob(remainingSavedJobs.length > 0 ? remainingSavedJobs[0] : null);
    }

    // Switch to applications tab and select the new application
    setActiveTab("applications");
    setSelectedApplication(newApplication);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "interview_scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interview Scheduled</Badge>;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6">
                <ProfileSkeleton />
              </div>
            </div>
            <div className="lg:col-span-3">
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col-2 justify-between">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#3a4043] mb-1">Welcome back, {candidateProfile.name.split(' ')[0]}!</h1>
            <p className="text-gray-600">Here's your job search activity and recommendations.</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <ResumeUploadButton
              buttonText="Upload Resume"
              buttonClassName="bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
              onResumeProcessed={(parsedInfo) => {
                console.log("Resume processed:", parsedInfo);
              }}
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 sticky top-4 self-start">
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                      {candidateProfile.name.split(' ').map(n => n[0]).join('')}
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Briefcase,
                      iconColor: "text-[#635bff]",
                      title: "Applications Submitted",
                      value: applications.length,
                    },
                    {
                      icon: Eye,
                      iconColor: "text-blue-600",
                      title: "Profile Views",
                      value: 12,
                    },
                    {
                      icon: Heart,
                      iconColor: "text-red-500",
                      title: "Saved Jobs",
                      value: savedJobs.length,
                    },
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{
                          boxShadow: "2px 2px 2px rgba(99,91,255,0.3)",
                        }}
                        className="rounded-xl overflow-hidden hover:cursor-pointer"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => {
                          card.icon == Briefcase
                            ? handleTabChange("applications")
                            : card.icon == Heart
                              ? handleTabChange("saved")
                              : null
                        }}
                      >
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Icon className={`h-8 w-8 mx-auto mb-2 ${card.iconColor}`} />
                            <h3 className="font-semibold text-[#3a4043] mb-1">{card.value}</h3>
                            <p className="text-sm text-gray-600">{card.title}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Applications</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-gray-200">
                      {applications.slice(0, 3).map((app, index) => (
                        <motion.div
                          key={app.id}
                          whileHover={{
                            backgroundColor: "rgba(99,91,255,0.04)",
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={`flex items-center justify-between py-3 ${index === 0 ? "" : ""} hover:cursor-pointer`}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">{app.jobTitle}</h4>
                              <p className="text-sm text-gray-600">
                                {app.company} • {app.location}
                              </p>
                            </div>
                            {app.accommodationsRequested && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800 flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                Accommodations
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-gray-500 mt-1">Score: {Math.round(((app.primaryMatchScore || 96) + (app.secondaryMatchScore || 90) + (app.tertiaryMatchScore || 85)) / 3)}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Your Accommodations Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidateProfile.accommodations.map((accommodation, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-[#3a4043]">{accommodation}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4">
                      Update Accommodations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "browse jobs" && (
              <div>
                <h1 className="text-2xl font-bold text-[#3a4043]">Browse Jobs</h1>
                {/* the component goes here */}
              </div>
            )}

            {activeTab === "applications" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">My Applications</h1>
                  {/* <Button
                    asChild
                    variant="outline"
                    className="border-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
                  >
                    <Link href="/candidate/JobListing">Browse More Jobs</Link>
                  </Button> */}
                </div>
                
                {applications.length > 0 ? (
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left side - Applications List */}
                    <div className="lg:col-span-2 space-y-3">
                      {applications.map((app) => (
                        <Card 
                          key={app.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedApplication?.id === app.id 
                              ? 'border-2 border-[#635bff] shadow-md' 
                              : 'border border-gray-200'
                          }`}
                          onClick={() => setSelectedApplication(app)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-[#3a4043] mb-1">{app.jobTitle}</h3>
                                <p className="text-sm text-[#635bff] font-medium">{app.company}</p>
                              </div>
                              {getStatusBadge(app.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {app.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {app.salary}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">Posted: {app.appliedDate}</p>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                {Math.round(((app.primaryMatchScore || 96) + (app.secondaryMatchScore || 90) + (app.tertiaryMatchScore || 85)) / 3)}% match
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Right side - Application Details */}
                    <div className="lg:col-span-3">
                      {selectedApplication ? (
                        <Card className="sticky top-4">
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {/* Header */}
                              <div>
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                                      {selectedApplication.jobTitle}
                                    </h2>
                                    <p className="text-lg text-[#635bff] font-medium mb-3">
                                      {selectedApplication.company}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedApplication.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {selectedApplication.salary}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedApplication.score && (
                                    <div className="text-center">
                                      <div className="text-4xl font-bold text-[#635bff] mb-1">
                                        {selectedApplication.score}%
                                      </div>
                                      <p className="text-sm text-gray-600">match</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(selectedApplication.status)}
                                  {selectedApplication.accommodationsRequested && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Accommodations Requested
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Job Description */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Job Description</h3>
                                <p className="text-gray-700 leading-relaxed">
                                  {selectedApplication.description || "No job description available."}
                                </p>
                              </div>

                              {/* Requirements */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Requirements</h3>
                                <ul className="space-y-2">
                                  {selectedApplication.requirements?.map((req: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{req}</span>
                                    </li>
                                  )) || (
                                    <li className="text-gray-500">No specific requirements listed.</li>
                                  )}
                                </ul>
                              </div>

                              {/* Benefits */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Benefits</h3>
                                <ul className="space-y-2">
                                  {selectedApplication.benefits?.map((benefit: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span>{benefit}</span>
                                    </li>
                                  )) || (
                                    <li className="text-gray-500">No benefits information available.</li>
                                  )}
                                </ul>
                              </div>

                              {/* Company Information */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Company Information</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><strong>Company Size:</strong> {selectedApplication.companySize || "Not specified"}</p>
                                  <p><strong>Founded:</strong> {selectedApplication.founded || "Not specified"}</p>
                                  <p><strong>Application Deadline:</strong> {selectedApplication.deadline || "Not specified"}</p>
                                </div>
                              </div>

                              {/* Interview Information */}
                              {selectedApplication.interviewDate && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h3 className="text-lg font-semibold text-[#3a4043] mb-2">Interview Scheduled</h3>
                                  <p className="text-gray-700 mb-3">
                                    <strong>Date:</strong> {selectedApplication.interviewDate}
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
                              <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                  className="flex-1 bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold cursor-pointer"
                                  onClick={() => {
                                    if (selectedApplication) {
                                      // Remove the application from the list
                                      setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));
                                      // Get the remaining applications
                                      const remainingApplications = applications.filter(app => app.id !== selectedApplication.id);
                                      // Set the selected application to the first remaining one, or null if none left
                                      setSelectedApplication(remainingApplications.length > 0 ? remainingApplications[0] : null);
                                    }
                                  }}
                                >
                                  Withdraw Application
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="flex-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 cursor-pointer"
                                  onClick={() => setShowMatchingScoreDialog(true)}
                                >
                                  Detailed Matching Score
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="sticky top-4">
                          <CardContent className="p-12 text-center">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              Select an Application
                            </h3>
                            <p className="text-gray-500">
                              Click on an application from the list to view details
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-[100px] w-full justify-center">
                    <span className="text-[#5748e5] font-bold text-lg">
                      No applied applications. Apply for jobs in "Browse More Jobs" to see them here!
                    </span>
                  </div>
                )}
              </div>
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">Saved Jobs</h1>
                  <Button
                    asChild
                    variant="outline"
                    className="border-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
                  >
                    <Link href="/candidate/JobListing">Browse More Jobs</Link>
                  </Button>
                </div>
                
                {savedJobs.length > 0 ? (
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left side - Saved Jobs List */}
                    <div className="lg:col-span-2 space-y-3">
                      {savedJobs.map((job) => (
                        <Card 
                          key={job.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedSavedJob?.id === job.id 
                              ? 'border-2 border-[#635bff] shadow-md' 
                              : 'border border-gray-200'
                          }`}
                          onClick={() => setSelectedSavedJob(job)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-[#3a4043] mb-1">{job.jobTitle}</h3>
                                <p className="text-sm text-[#635bff] font-medium">{job.company}</p>
                              </div>
                              <div className="flex gap-2">
                                {job.isInclusive && (
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                                    <Heart className="h-3 w-3 mr-1" />
                                    Inclusive
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {job.salary}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">Type: {job.type}</p>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                {Math.round(((job.primaryMatchScore || 96) + (job.secondaryMatchScore || 90) + (job.tertiaryMatchScore || 85)) / 3)}% match
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Right side - Job Details */}
                    <div className="lg:col-span-3">
                      {selectedSavedJob ? (
                        <Card className="sticky top-4">
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {/* Header */}
                              <div>
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h2 className="text-2xl font-bold text-[#3a4043] mb-2">
                                      {selectedSavedJob.jobTitle}
                                    </h2>
                                    <p className="text-lg text-[#635bff] font-medium mb-3">
                                      {selectedSavedJob.company}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {selectedSavedJob.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {selectedSavedJob.salary}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedSavedJob.score && (
                                    <div className="text-center">
                                      <div className="text-4xl font-bold text-[#635bff] mb-1">
                                        {selectedSavedJob.score}%
                                      </div>
                                      <p className="text-sm text-gray-600">match</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedSavedJob.isInclusive && (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                      <Heart className="h-3 w-3 mr-1" />
                                      Inclusive
                                    </Badge>
                                  )}
                                  {selectedSavedJob.hasAccommodations && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Accommodations Available
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Job Description */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Job Description</h3>
                                <p className="text-gray-700 leading-relaxed">
                                  {selectedSavedJob.description || "No job description available."}
                                </p>
                              </div>

                              {/* Requirements */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Requirements</h3>
                                <ul className="space-y-2">
                                  {selectedSavedJob.requirements?.map((req: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{req}</span>
                                    </li>
                                  )) || (
                                    <li className="text-gray-500">No specific requirements listed.</li>
                                  )}
                                </ul>
                              </div>

                              {/* Benefits */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Benefits</h3>
                                <ul className="space-y-2">
                                  {selectedSavedJob.benefits?.map((benefit: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <span>{benefit}</span>
                                    </li>
                                  )) || (
                                    <li className="text-gray-500">No benefits information available.</li>
                                  )}
                                </ul>
                              </div>

                              {/* Company Information */}
                              <div>
                                <h3 className="text-lg font-semibold text-[#3a4043] mb-3">Company Information</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><strong>Company Size:</strong> {selectedSavedJob.companySize || "Not specified"}</p>
                                  <p><strong>Founded:</strong> {selectedSavedJob.founded || "Not specified"}</p>
                                  <p><strong>Application Deadline:</strong> {selectedSavedJob.deadline || "Not specified"}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                  variant="outline"
                                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => {
                                    setSavedJobs(prev => prev.filter(j => j.id !== selectedSavedJob.id));
                                    const remainingSavedJobs = savedJobs.filter(j => j.id !== selectedSavedJob.id);
                                    setSelectedSavedJob(remainingSavedJobs.length > 0 ? remainingSavedJobs[0] : null);
                                  }}
                                >
                                  Remove from Saved
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="flex-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 cursor-pointer"
                                  onClick={() => setShowMatchingScoreDialog(true)}
                                >
                                  Detailed Matching Score
                                </Button>
                                <Button 
                                  className="flex-1 bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold cursor-pointer"
                                  onClick={() => handleApplyForSavedJob(selectedSavedJob)}
                                >
                                  Apply Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="sticky top-4">
                          <CardContent className="p-12 text-center">
                            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                              Select a Saved Job
                            </h3>
                            <p className="text-gray-500">
                              Click on a job from the list to view details
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-[100px] w-full justify-center">
                    <span className="text-[#5748e5] font-bold text-lg">
                      No saved jobs yet. Browse jobs and save them for later!
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile config" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Profile Settings</h1>
                <div className="grid gap-6">
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
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Education</h1>

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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end mb-4">
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
                    className="bg-[#635bff] hover:bg-[#827CFF] text-white"
                  >
                    + Add Education
                  </Button>
                </div>

                <div className="flex justify-end">
                  <EducationSubmission
                    educations={educations}
                    onSave={() => {
                      calculateProfileCompletion();
                    }}
                  />
                </div>
              </div>
            )}

             {activeTab === "experience" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Experience</h1>

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
                                  value={String(exp[field.key as keyof typeof exp] ?? "").substring(0, 7)} // <--- CHANGE HERE: substring(0,7)
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
                      </CardContent>
                    </Card>
                  ))}

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
                      className="bg-[#635bff] hover:bg-[#827CFF] text-white"
                    >
                      + Add Experience
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <ExperienceSkillsSubmission
                      experiences={experiences}
                      // exp_skill={candidateProfile.exp_skill}
                      onSave={() => {
                        calculateProfileCompletion();
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Skills</h1>

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

                      {/* Save Skills button — unchanged style/location */}
                      <div className="mt-4">
                        <SkillsSubmission
                          exp_skill={candidateProfile.exp_skill}
                          languageProficiencies={languageProficiencies}
                          userEmail={session?.user?.email || ""}
                          onSave={() => {
                            calculateProfileCompletion();
                          }}
                        />
                      </div>
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
                          className="bg-[#635bff] hover:bg-[#827CFF] text-white w-full sm:w-auto"
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
                                    <SelectTrigger className="w-full md:w-[180px]">
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
                                        <SelectTrigger className="w-full md:w-[140px]">
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
                                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
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
                </div>
              </div>
            )}


            {activeTab === "neuro_strength" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-[#3a4043]">Neurodivergent Strengths</h1>
                  <p className="text-sm text-gray-600">Select Your Top 10 Strengths</p>
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

                  <NeuroStrengthSubmission
                    selectedStrengths={selectedStrengths}
                    onSave={() => {
                      calculateProfileCompletion();
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === "environment" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Preferred Environment</h1>

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

                <div className="flex justify-end mt-4">
                  <EnvironmentSubmission
                    environment={candidateProfile.environment}
                    onSave={() => {
                      calculateProfileCompletion();
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === "mock interview" && (
              <>
                <h1 className="text-2xl font-bold text-[#3a4043] pb-4 ">Conduct a Mock Interview</h1>
                {mockInterviewStep === "setup" && (
                  <MockInterviewSetupPage onNavigate={(target) => {
                    if (target === "interview") {
                      setMockInterviewStep("process");
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
                    }
                  }} />
                )}
              </>
            )}

            {activeTab === "Report" && (
              <><h1 className="text-2xl font-bold text-[#3a4043] pb-4 ">Candidate Report</h1>
                <ReportPage /></>
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