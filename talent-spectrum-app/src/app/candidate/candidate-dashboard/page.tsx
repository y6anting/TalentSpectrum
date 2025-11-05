"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  User, Briefcase, Heart, Eye, Settings, Book, House, Clock, CheckCircle, XCircle, MapPin, DollarSign, Shield, Plus, X, BrainCircuit,
  HandFist, LetterTextIcon, UserStar, MessagesSquare, CalendarClock, FileText, 
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

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mockInterviewStep, setMockInterviewStep] = useState<"setup" | "process" | "feedback">("setup");

  const [jobCoachSearch, setJobCoachSearch] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentMonth, setAppointmentMonth] = useState(new Date().getMonth());
  const [appointmentYear, setAppointmentYear] = useState(new Date().getFullYear());

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



  // Initialize email from localStorage on component mount
  useEffect(() => {
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (storedEmail && !candidateProfile.email) {
      setCandidateProfile(prev => ({
        ...prev,
        email: storedEmail,
        personalIdentifiers: {
          ...prev.personalIdentifiers,
          emailAddress: storedEmail
        }
      }));
    }
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let localEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        
        // If no email in localStorage but we have session email, store it
        if (!localEmail && session?.user?.email) {
          localEmail = session.user.email;
          localStorage.setItem('userEmail', localEmail);
        }
        
        const emailToUse = encodeURIComponent(localEmail || '');
        console.log('Using email for profile fetch:', emailToUse);
        
        if (!emailToUse) {
          console.error('No email found in localStorage or session');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/profiles/${emailToUse}`, {
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
              email: data.email || localEmail || candidateProfile.email,
              location: data.location || candidateProfile.location,
              profileCompletion: data.profile_completion || candidateProfile.profileCompletion,
              accommodations: data.accommodations || candidateProfile.accommodations,
              preferences: data.preferences || candidateProfile.preferences,
              personalIdentifiers: {
                ...candidateProfile.personalIdentifiers,
                ...data.personal_identifiers,
                emailAddress: data.personal_identifiers?.emailAddress || data.email || localEmail || candidateProfile.personalIdentifiers.emailAddress
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
            if (localEmail) {
              setCandidateProfile(prev => ({
                ...prev,
                email: localEmail,
                personalIdentifiers: {
                  ...prev.personalIdentifiers,
                  emailAddress: localEmail
                }
              }));
            }
          }
          setIsLoading(false);
        } else if (response.status === 404) {
          console.log('Profile not found, creating new profile with email');
          
          // If profile not found but we have email, create a basic profile
          if (localEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: localEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: localEmail
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
          if (localEmail) {
            setCandidateProfile(prev => ({
              ...prev,
              email: localEmail,
              personalIdentifiers: {
                ...prev.personalIdentifiers,
                emailAddress: localEmail
              }
            }));
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        // If there's an error but we have email, at least populate the email field
        const fallbackEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
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

  // Fetch applications data
  useEffect(() => {
    const fetchApplicationsData = async () => {
      try {
        let localEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        
        // If no email in localStorage but we have session email, use it
        if (!localEmail && session?.user?.email) {
          localEmail = session.user.email;
        }
        
        if (!localEmail) {
          console.error('No email found for fetching applications');
          return;
        }

        const emailToUse = encodeURIComponent(localEmail);
        console.log('Fetching applications for email:', emailToUse);
        
        const response = await fetch(`http://127.0.0.1:8000/profiles/${emailToUse}/applications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Applications API Response:', data);
          setApplications(data);
        } else {
          console.error('Failed to fetch applications:', response.status);
          setApplications([]); // Set empty array if no applications found
        }
      } catch (error) {
        console.error('Error fetching applications data:', error);
        setApplications([]); // Set empty array on error
      }
    };

    if (session?.user?.email || (typeof window !== 'undefined' && localStorage.getItem('userEmail'))) {
      fetchApplicationsData();
    }
  }, [session]);

  // Fetch saved jobs data
  useEffect(() => {
    const fetchSavedJobsData = async () => {
      try {
        let localEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        
        // If no email in localStorage but we have session email, use it
        if (!localEmail && session?.user?.email) {
          localEmail = session.user.email;
        }
        
        if (!localEmail) {
          console.error('No email found for fetching saved jobs');
          return;
        }

        const emailToUse = encodeURIComponent(localEmail);
        console.log('Fetching saved jobs for email:', emailToUse);
        
        const response = await fetch(`http://127.0.0.1:8000/profiles/${emailToUse}/saved-jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Saved Jobs API Response:', data);
          setSavedJobs(data);
        } else {
          console.error('Failed to fetch saved jobs:', response.status);
          setSavedJobs([]); // Set empty array if no saved jobs found
        }
      } catch (error) {
        console.error('Error fetching saved jobs data:', error);
        setSavedJobs([]); // Set empty array on error
      }
    };

    if (session?.user?.email || (typeof window !== 'undefined' && localStorage.getItem('userEmail'))) {
      fetchSavedJobsData();
    }
  }, [session]);

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

  // Handle tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const jobCoachTemporary = [
    {
      name: "one",
      appointments: [
        {
          time: 1730617200
        },
        {
          time: 1730649600
        },
        {
          time: 1730667600
        }
      ]
    },
    {
      name: "two",
      appointments: [
        {
          time: 1730624400
        },
        {
          time: 1730628000
        },
        {
          time: 1730671200
        }
      ]
    },
    {
      name: "three",
      appointments: [
        {
          time: 1730620800
        },
        {
          time: 1730620800
        },
        {
          time: 1730631600
        },
      ]
    },
    {
      name: "four",
      appointments: [
        {
          time: 1730617200
        },
        {
          time: 1730649600
        },
        {
          time: 1730667600
        }
      ]
    },
    {
      name: "five",
      appointments: [
        {
          time: 1730624400
        },
        {
          time: 1730628000
        },
        {
          time: 1730671200
        }
      ]
    },
    {
      name: "six",
      appointments: [
        {
          time: 1730620800
        },
        {
          time: 1730620800
        },
        {
          time: 1730631600
        },
      ]
    },
    {
      name: "seven",
      appointments: [
        {
          time: 1730617200
        },
        {
          time: 1730649600
        },
        {
          time: 1730667600
        }
      ]
    },
    {
      name: "eight",
      appointments: [
        {
          time: 1730624400
        },
        {
          time: 1730628000
        },
        {
          time: 1730671200
        }
      ]
    },
    {
      name: "nine",
      appointments: [
        {
          time: 1730620800
        },
        {
          time: 1730620800
        },
        {
          time: 1730631600
        },
      ]
    },
  ]

  const filteredJobCoachSearch = jobCoachTemporary.filter((c) =>
    c.name.toLowerCase().includes(jobCoachSearch.toLowerCase())
  );

  const handleSelect = (name: string) => {
  setSelectedCoach((prev) => (prev === name ? null : name));
  setSelectedDate(null); 
};

  const selectedCoachData = jobCoachTemporary.find(
    (c) => c.name === selectedCoach
  );

  // --- FIX: Store all available appointment dates (not just strings)
  const availableDays = selectedCoachData
    ? selectedCoachData.appointments.map(
        (a) => new Date(a.time * 1000)
      )
    : [];

  // Build days for current month
  const daysInMonth = new Date(appointmentYear, appointmentMonth + 1, 0).getDate();
  const firstDay = new Date(appointmentYear, appointmentMonth, 1).getDay();

  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  // When a date is selected, show that day’s appointments
  const selectedDayAppointments =
    selectedCoachData && selectedDate
      ? selectedCoachData.appointments.filter(
          (a) =>
            new Date(a.time * 1000).toDateString() ===
            selectedDate.toDateString()
        )
      : [];

  // Navigation handlers
  const handlePrevMonth = () => {
    if (appointmentMonth === 0) {
      setAppointmentMonth(11);
      setAppointmentYear((y) => y - 1);
    } else {
      setAppointmentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (appointmentMonth === 11) {
      setAppointmentMonth(0);
      setAppointmentYear((y) => y + 1);
    } else {
      setAppointmentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

 

  // --- FIX: Match available days by date/month/year instead of string match
  const isDateAvailable = (d: Date) =>
    availableDays.some(
      (a) =>
        a.getDate() === d.getDate() &&
        a.getMonth() === d.getMonth() &&
        a.getFullYear() === d.getFullYear()
    );

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

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
            <Button
              asChild
              variant="outline"
              className="border-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
            >
              <Link href="/candidate/jobListing">Browse More Jobs</Link>
            </Button>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                    {candidateProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#635bff]">{candidateProfile.name}</h3>
                    <p className="text-sm text-gray-600">{candidateProfile.location}</p>
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
                    { id: "overview", label: "Overview", icon: User },
                    { id: "applications", label: "My Applications", icon: LetterTextIcon },
                    { id: "saved", label: "Saved Jobs", icon: Heart },
                    { id: "profile", label: "Profile Settings", icon: Settings, children: [
                      { id: "education", label: "Education", icon: Book },
                      { id: "experience", label: "Experience", icon: Briefcase },
                      { id: "skills", label: "Skills", icon: HandFist },
                      { id: "neuro_strength", label: "Neurodivergent Strengths", icon: BrainCircuit },
                      { id: "environment", label: "Preferred Environment", icon: House },
                    ],},
                    { id: "job coach", label: "Job Coach", icon: UserStar, children: [
                      { id: "mock interview", label: "Mock Interview", icon: MessagesSquare },
                      { id: "Appointment", label: "Appointment", icon: CalendarClock },
                      { id: "Report", label: "Report", icon: FileText },
                    ],},

                  ].map((item) => {
                    const Icon = item.icon;
                    const hasChildren = Boolean(item.children);
                    const isOpen = openDropdown === item.id;
                    
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              setOpenDropdown(isOpen ? null : item.id);
                            } else {
                              handleTabChange(item.id);
                            }
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                            activeTab === item.id
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
                              className={`h-4 w-4 transform transition-transform ${
                                isOpen ? "rotate-180" : ""
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
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                                    activeTab === child.id
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
                      <div className="text-sm text-[#635bff] font-medium hover:underline hover:cursor-pointer">
                        View More
                      </div>
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
                            <p className="text-xs text-gray-500 mt-1">Score: {app.score}%</p>
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

            {activeTab === "applications" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">My Applications</h1>
                </div>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">{app.jobTitle}</h3>
                            <p className="text-[#635bff] font-medium mb-2">{app.company}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {app.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {app.salary}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-gray-500 mt-1">Applied {app.appliedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {app.accommodationsRequested && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Accommodations Requested
                              </Badge>
                            )}
                            {app.interviewDate && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Interview: {app.interviewDate}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {app.status === "interview_scheduled" && (
                              <Button
                                size="sm"
                                className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 shadow-md transition-all duration-200 hover:cursor-pointer"
                                onClick={() => router.push("/mock-interview/setup")}
                              >
                                Prepare for Interview
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "saved" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">Saved Jobs</h1>
                  <p className="text-gray-600">{savedJobs.length} jobs saved</p>
                </div>
                <div className="grid gap-6">
                  {savedJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-[#635bff] mb-1">{job.title}</h3>
                            <p className="text-[#635bff] font-medium mb-2">{job.company}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
                            <div className="flex gap-2">
                              {job.isInclusive && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Inclusive
                                </Badge>
                              )}
                              {job.hasAccommodations && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Accommodations
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                            <Button size="sm" className="bg-[#635bff] hover:bg-[#827CFF] text-white">
                              <Link href={`/jobs/${job.id}`}>Apply Now</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
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
                          // { label: "NRIC", key: "nric", type: "text" },
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
                                  // Clear error when user fills the field
                                  if (field.required && val) {
                                    setErrors({ ...errors, [field.key]: "" });
                                  }
                                }}
                              >
                                <SelectTrigger className={`w-full rounded-lg px-3 py-2 text-left ${
                                  errors[field.key as string] ? "border-red-500" : "border-[#e8e6f0]"
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
                                    // Check if required field is empty
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
                                  className={`w-full px-3 py-2 border rounded-lg outline-none focus-visible:ring-[1px] ${
                                    errors[field.key as string]
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

                {/* Render all education cards */}
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

                {/* Manage Multiple Education Cards */}
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
                  {/* Experience Info */}
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
                            { label: "Start Date", key: "start", type: "date" },
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
                                  value={String(exp[field.key as keyof typeof exp] ?? "")}
                                  onChange={(e) => updateExperience(exp.id, { [field.key]: e.target.value })}
                                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                                />
                              )}
                            </div>
                          ))}

                          {/* End Date with "Currently working here" checkbox */}
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
                                    end: e.target.checked ? "" : exp.end, // Clear end date if checked
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
                                type="date"
                                value={exp.end || ""}
                                onChange={(e) =>
                                  updateExperience(exp.id, { end: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                              />
                            )}
                            </div>

                          {/* Project Highlights */}
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

                          {/* Achievements */}
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

                  {/* Add Experience Button */}
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

                  {/* Save Experience Button */}
                  <div className="flex justify-end">
                    <ExperienceSkillsSubmission
                      experiences={experiences}
                      exp_skill={candidateProfile.exp_skill}
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
                  {/* Skills Info */}
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
                          <div key={key}>
                            <label className="block text-sm font-medium text-[#3a4043] mb-1">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                setCandidateProfile({
                                  ...candidateProfile,
                                  exp_skill: { ...candidateProfile.exp_skill, [key]: e.target.value },
                                })
                              }
                              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                            />
                          </div>
                        );
                      })}
                      <SkillsSubmission 
                        exp_skill={candidateProfile.exp_skill}
                        languageProficiencies={languageProficiencies}
                        onSave={() => {
                          calculateProfileCompletion();
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
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
                              }
                            ]);
                          }}
                          className="bg-[#635bff] hover:bg-[#827CFF] text-white"
                        >
                          + Add Language
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium text-[#3a4043]">Language</th>
                              <th className="text-left p-2 font-medium text-[#3a4043]">Reading</th>
                              <th className="text-left p-2 font-medium text-[#3a4043]">Writing</th>
                              <th className="text-left p-2 font-medium text-[#3a4043]">Listening</th>
                              <th className="text-left p-2 font-medium text-[#3a4043]">Speaking</th>
                              <th className="text-left p-2 font-medium text-[#3a4043]">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {languageProficiencies.map((prof, index) => (
                              <tr key={prof.id} className="border-b">
                                <td className="p-2">
                            <Select
                                    value={prof.language}
                                    onValueChange={(value) => {
                                      const updated = [...languageProficiencies];
                                      updated[index] = { ...prof, language: value };
                                      setLanguageProficiencies(updated);
                                    }}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                                    <SelectContent>
                                      {["Arabic", "Bengali", "Chinese", "English", "French", "German", "Hindi", "Indonesian", "Italian", "Japanese", "Korean", "Malay", "Portuguese", "Russian", "Spanish", "Tamil", "Thai", "Turkish", "Vietnamese", "Other"].map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                          {lang}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                {["reading", "writing", "listening", "speaking"].map((skill) => (
                                  <td key={skill} className="p-2">
                                    <Select
                                      value={String(prof[skill as keyof LanguageProficiency])}
                                      onValueChange={(value) => {
                                        const updated = [...languageProficiencies];
                                        updated[index] = { ...prof, [skill]: value };
                                        setLanguageProficiencies(updated);
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px]">
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
                                  </td>
                                ))}
                                <td className="p-2">
                                  {languageProficiencies.length > 0 && (
                                    <Button
                                      onClick={() => {
                                        const updated = languageProficiencies.filter((_, i) => i !== index);
                                        setLanguageProficiencies(updated);
                                      }}
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                  {/* Communication & Social Preferences */}
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

                  {/* Sensory Needs */}
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

                  {/* Save Environment Button */}
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

            {activeTab === "Appointment" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 focus-within:border-[#635bff] transition-colors">
                      <input
                        className="flex-grow bg-transparent outline-none text-m text-gray-700 placeholder-gray-400"
                        placeholder="Find and select a job coach:"
                        onChange={(e) => setJobCoachSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-80 overflow-y-auto border rounded-lg p-3 space-y-3">
                      {filteredJobCoachSearch.length > 0 ? (
                        filteredJobCoachSearch.map((coach, index) => {
                          const isSelected = selectedCoach === coach.name;
                          return (
                            <li
                              key={index}
                              onClick={() => handleSelect(coach.name)}
                              className={` p-3 border rounded-lg cursor-pointer transition flex items-center gap-3 ${isSelected
                                ? "bg-[#635bff] text-white border-[#635bff]"
                                : "hover:bg-[#f5f3ff] text-gray-800"
                                }`}
                            >
                              {/* Profile picture placeholder */}
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"
                                  }`}
                              >
                                {coach.name.charAt(0).toUpperCase()}
                              </div>

                              {/* Coach name */}
                              <p className="font-semibold">{coach.name}</p>
                            </li>
                          );
                        })
                      ) : (
                        <p className="text-gray-400 text-sm mt-2 text-center">
                          No matching coaches found.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-5">
                    {selectedCoach ? (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <button
                            onClick={handlePrevMonth}
                            className="text-[#635bff] font-bold hover:text-[#4b44e0]"
                          >
                            ← Prev
                          </button>
                          <h2 className="font-bold text-lg">
                            {monthNames[appointmentMonth]} {appointmentYear}
                          </h2>
                          <button
                            onClick={handleNextMonth}
                            className="text-[#635bff] font-bold hover:text-[#4b44e0]"
                          >
                            Next →
                          </button>
                        </div>

                        {/* Days of week */}
                        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-3">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="font-semibold">
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2 text-center text-sm">
                          {daysArray.map((day, i) => {
                            if (!day) return <div key={i}></div>;
                            const date = new Date(appointmentYear, appointmentMonth, day);
                            const available = isDateAvailable(date);
                            const isSelected =
                              selectedDate?.toDateString() === date.toDateString();

                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  setSelectedDate(date);
                                }}
                                className={`p-2 rounded-lg cursor-pointer transition ${isSelected
                                    ? "bg-[#635bff] text-white font-bold"
                                    : available
                                      ? "bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4338ca]"
                                      : "text-gray-400 hover:bg-gray-100"
                                  }`}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>

                        {/* Appointments */}
                        {selectedDayAppointments.length > 0 ? (
                          <div className="mt-5">
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                                />
                              </svg>
                              <h3 className="font-semibold text-gray-800">Available Time Slots</h3>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                              Slots for {selectedDate?.toLocaleDateString(undefined, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>

                            <ul className="space-y-3">
                              {selectedDayAppointments.map((a, i) => (
                                <li
                                  key={i}
                                  className="flex items-center justify-between border rounded-xl px-4 py-3 hover:shadow-sm transition bg-white"
                                >
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="font-medium">
                                      {new Date(a.time * 1000).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>

                                  <button className="bg-[#635bff] text-white text-sm px-4 py-1.5 rounded-md font-medium hover:bg-black transition">
                                    Book
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : selectedDate ? (
                          <p className="mt-5 text-gray-400 text-center pt-5">
                            No available appointments on this day.
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-gray-400 text-center pt-[10%]">
                        Select a coach to view their calendar.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}
              
          </div>
        </div>
      </div>
    </div>
  );
}
