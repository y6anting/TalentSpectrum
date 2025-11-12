"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Skeleton } from "@/app/components/loading-skeleton";
import { 
  User, 
  Book, 
  Briefcase, 
  House, 
  ArrowLeft, 
  ArrowRight, 
  HandFist,
  BrainCircuit,
  Plus,
  X
} from "lucide-react";
import { Badge } from "@/app/components/badge";
import ResumeUploadButton from "@/app/components/resume-upload/ResumeUploadButton";

// Types from candidate dashboard
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

type LanguageProficiency = {
  id: number;
  language: string;
  reading: string;
  writing: string;
  listening: string;
  speaking: string;
};

type OnboardingStep = "profile" | "education" | "experience" | "skills" | "neuro_strength" | "environment";

export default function CandidateInfoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [educations, setEducations] = useState<Education[]>([
    {
      id: Date.now(),
      level: "",
      fieldOfStudy: "",
      institution: "",
      graduationYear: null,
      cgpa_grade: "",
      award: "",
    }
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
    }
  ]);

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

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
    name: "",
    email: "",
    location: "",
    profileCompletion: 0,  
    accommodations: [],
    preferences: {
      workType: "",
      communication: "",
      schedule: "",
    },
    personalIdentifiers: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      emailAddress: "",
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

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && !candidateProfile.personalIdentifiers.emailAddress) {
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

  // Step configuration
  const steps = [
    { id: "profile", title: "Profile Settings", icon: User, description: "Personal information and contact details" },
    { id: "education", title: "Education", icon: Book, description: "Academic background and qualifications" },
    { id: "experience", title: "Experience", icon: Briefcase, description: "Work experience and professional skills" },
    { id: "skills", title: "Skills", icon: HandFist, description: "Language proficiency and technical skills" },
    { id: "neuro_strength", title: "Neurodivergent Strengths", icon: BrainCircuit, description: "Select your top strengths" },
    { id: "environment", title: "Preferred Environment", icon: House, description: "Workplace preferences and accommodations" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepConfig = steps[currentStepIndex];

  // Navigation functions
  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as OnboardingStep);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as OnboardingStep);
    }
  };

  const goToStep = (stepId: OnboardingStep) => {
    setCurrentStep(stepId);
  };

  // Save data function
  const saveData = async () => {
    setIsLoading(true);
    try {
      // Format payload according to the required structure
      const payload = {
        name: candidateProfile.personalIdentifiers.fullName,
        email: candidateProfile.personalIdentifiers.emailAddress,
        location: candidateProfile.personalIdentifiers.preferred_location,
        profile_completion: 100, // Assuming completion when user submits
        accommodations: [],
        preferences: {
          workType: candidateProfile.personalIdentifiers.preferred_role,
          communication: candidateProfile.environment.communicationMedium,
          schedule: candidateProfile.environment.workdayStructure
        },
        personal_identifiers: candidateProfile.personalIdentifiers,
        education: candidateProfile.education,
        experience: candidateProfile.exp_skill, // Map exp_skill to experience
        skills: candidateProfile.exp_skill, // Map exp_skill to skills for now
        environment: candidateProfile.environment,
        educations: educations.map(edu => ({
          level: edu.level,
          field_of_study: edu.fieldOfStudy,
          institution: edu.institution,
          graduation_year: edu.graduationYear,
          cgpa_grade: edu.cgpa_grade,
          award: edu.award
        })),
        experiences: experiences.map(exp => ({
          employer: exp.employer,
          industry: exp.industry,
          start_date: exp.start,
          end_date: exp.isCurrent ? null : exp.end, // Set end_date to null if currently working
          seniority_level: exp.seniorityLevel,
          skills_tools_used: exp.skillsToolsUsed,
          project_highlights: exp.projectHighlights,
          title: exp.title,
          achievements: exp.achievements
        })),
        language_proficiencies: languageProficiencies,
        neurodivergent_strengths: selectedStrengths
      };
      
      // Send data to API
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Error ${response.status}: ${response.statusText} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Profile saved successfully:", result);
      
      // Save user email to localStorage for use in dashboard
      // localStorage.setItem('userEmail', candidateProfile.personalIdentifiers.emailAddress);
      
      // Redirect to dashboard or show success message
      router.push('/candidate/candidate-dashboard');
    } catch (error) {
      console.error("Error saving data:", error);
      // Show error message to user
      // toast({
      //   title: "Error",
      //   description: "Failed to save profile data. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = (updates: Partial<CandidateProfile>) => {
    setCandidateProfile(prev => ({ ...prev, ...updates }));
  };

  // Handle direct file upload
  const handleDirectFileUpload = async (file: File, parsedInfo?: any) => {
    try {
      console.log("Processing file:", file.name);
      console.log("Parsed info:", parsedInfo);
      
      if (parsedInfo && parsedInfo.parsed_info) {
        // Here you would parse the extracted information and update the profile
        // For now, we'll just show the success message
        alert(`Resume ${file.name} processed successfully! Extracted information: ${parsedInfo.parsed_info.substring(0, 100)}...`);
        console.log("Parsed info:", parsedInfo);
        
        // TODO: Parse the extracted information and update the candidateProfile
        // You can implement logic here to extract specific fields from parsedInfo.parsed_info
        // and update the corresponding fields in candidateProfile
        
      } else {
        alert(`Resume ${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing resume. Please try again.");
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "profile":
        return <ProfileStep profile={candidateProfile} updateProfile={updateProfile} />;
      case "education":
        return <EducationStep 
          educations={educations}
          setEducations={setEducations}
          profile={candidateProfile}
          updateProfile={updateProfile}
        />;
      case "experience":
        return <ExperienceStep 
          experiences={experiences}
          setExperiences={setExperiences}
          profile={candidateProfile}
          updateProfile={updateProfile}
        />;
      case "skills":
        return <SkillsStep 
          profile={candidateProfile} 
          updateProfile={updateProfile}
          languageProficiencies={languageProficiencies}
          setLanguageProficiencies={setLanguageProficiencies}
        />;
      case "neuro_strength":
        return <NeuroStrengthStep 
          selectedStrengths={selectedStrengths}
          setSelectedStrengths={setSelectedStrengths}
          strengthOptions={strengthOptions}
          toggleStrength={toggleStrength}
        />;
      case "environment":
        return <EnvironmentStep profile={candidateProfile} updateProfile={updateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
  <div className="page-wrap py-8">
        
        {/* Skip Button - Top Right */}
        <div className="mb-6 flex justify-end">
          <ResumeUploadButton 
            buttonText="Skip? Upload Resume"
            buttonVariant="outline"
            buttonClassName="border-2 border-[#635bff]/30 text-gray-600 hover:bg-[#635bff] hover:text-white hover:cursor-pointer px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
            onResumeProcessed={handleDirectFileUpload}
          />
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Progress Bar - Clickable Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 lg:space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => goToStep(step.id as OnboardingStep)}
                    className="flex items-center group cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-[#635bff] text-white group-hover:bg-[#827CFF]' 
                        : isCurrent 
                        ? 'bg-[#635bff] text-white ring-4 ring-[#635bff]/20 group-hover:bg-[#827CFF]' 
                        : 'bg-gray-200 text-gray-400 group-hover:bg-gray-300 group-hover:text-gray-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <div className={`text-base font-medium transition-colors duration-300 ${
                        isCurrent 
                          ? 'text-[#635bff]' 
                          : isCompleted 
                          ? 'text-[#635bff] group-hover:text-[#827CFF]' 
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`}>
                        {step.title}
                      </div>
                      {/* <div className="text-xs text-gray-500 hidden lg:block group-hover:text-gray-600 transition-colors duration-300">
                        {step.description}
                      </div> */}
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 lg:w-14 h-1 rounded transition-all duration-300 ${
                      isCompleted ? 'bg-[#635bff]' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
  <div className="page-wrap">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentStepConfig && (
                  <>
                    <div className="w-10 h-10 bg-[#635bff] rounded-lg flex items-center justify-center">
                      <currentStepConfig.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{currentStepConfig.title}</CardTitle>
                      <p className="text-gray-600">{currentStepConfig.description}</p>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              variant="outline"
              className="border-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 text-base font-semibold px-8 py-3 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-4">
              {currentStepIndex === steps.length - 1 ? (
                <Button
                onClick={async () => {
                  await saveData();
                  router.push('/candidate/candidate-dashboard');
                }}
                disabled={isLoading}
                  className="bg-[#635bff] hover:bg-[#827CFF] text-white text-base font-semibold px-8 py-3 rounded-full shadow-md transition-all duration-200"
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-[#635bff] hover:bg-[#827CFF] text-white text-base font-semibold px-8 py-3 rounded-full shadow-md transition-all duration-200"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function ProfileStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Full Name", key: "fullName", type: "text", required: true },
          { label: "NRIC", key: "nric", type: "text" },
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
                value={profile.personalIdentifiers[field.key as keyof typeof profile.personalIdentifiers] || ""}
                onValueChange={(val) =>
                  updateProfile({
                    personalIdentifiers: {
                      ...profile.personalIdentifiers,
                      [field.key]: val,
                    },
                  })
                }
              >
                <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
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
                value={profile.personalIdentifiers[field.key as keyof typeof profile.personalIdentifiers] || ""}
                onChange={(e) =>
                  updateProfile({
                    personalIdentifiers: {
                      ...profile.personalIdentifiers,
                      [field.key]: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
              />
            )}
          </div>
        ))}
      </div>

     

     
    </div>
  );
}

function EducationStep({ 
  educations, 
  setEducations, 
  profile, 
  updateProfile 
}: { 
  educations: Education[]; 
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
  profile: CandidateProfile;
  updateProfile: (updates: Partial<CandidateProfile>) => void;
}) {
  const currentYear = new Date().getFullYear();
  const grad_year = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => currentYear - i
  );

  const updateEducation = (id: number, updatedFields: Partial<Education>) => {
    setEducations(prev =>
      prev.map(edu => (edu.id === id ? { ...edu, ...updatedFields } : edu))
    );
    
    // Also update the main profile with the first education entry
    const updatedEducations = educations.map(edu => (edu.id === id ? { ...edu, ...updatedFields } : edu));
    const firstEducation = updatedEducations[0];
    if (firstEducation) {
      updateProfile({
        education: {
          level: firstEducation.level,
          fieldOfStudy: firstEducation.fieldOfStudy,
          institution: firstEducation.institution,
          graduationYear: firstEducation.graduationYear,
          cgpa: firstEducation.cgpa_grade ? parseFloat(firstEducation.cgpa_grade) || null : null,
          grade: firstEducation.cgpa_grade,
          award: firstEducation.award
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {educations.map((edu, index) => (
        <div key={edu.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Education {index + 1}</h3>
            {index > 0 && (
              <button
                onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "Level",
                key: "level",
                type: "select",
                options: ["PT3", "SPM / O-level", "STPM / A-level / Diploma", "Degree", "Master", "PhD", "Vocational", "Professional Certificate"],
              },
              { label: "University/College/School", key: "institution", type: "text" },
              { label: "Field of Study", key: "fieldOfStudy", type: "text" },
              {
                label: "Graduation Year",
                key: "graduationYear",
                type: "select",
                options: grad_year.map(String),
              },
              { label: "CGPA / Grade", key: "cgpa_grade", type: "text" },
              { label: "Award", key: "award", type: "text" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <Select
                    value={
                      field.key === "graduationYear"
                        ? edu[field.key]?.toString() ?? ""
                        : edu[field.key as keyof typeof edu]?.toString() ?? ""
                    }
                    onValueChange={(val) =>
                      updateEducation(edu.id, {
                        [field.key]:
                          field.key === "graduationYear"
                            ? val ? parseInt(val) : null
                            : val,
                      })
                    }
                  >
                    <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
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
                    value={edu[field.key as keyof typeof edu]?.toString() ?? ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { [field.key]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
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
  );
}

function ExperienceStep({ 
  experiences, 
  setExperiences, 
  profile, 
  updateProfile 
}: { 
  experiences: Experience[]; 
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  profile: CandidateProfile;
  updateProfile: (updates: Partial<CandidateProfile>) => void;
}) {
  const updateExperience = (id: number, updatedFields: Partial<Experience>) => {
    setExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, ...updatedFields } : exp))
    );
    
    // Also update the main profile with the first experience entry
    const updatedExperiences = experiences.map(exp => (exp.id === id ? { ...exp, ...updatedFields } : exp));
    const firstExperience = updatedExperiences[0];
    if (firstExperience) {
      updateProfile({
        exp_skill: {
          ...profile.exp_skill,
          employer: firstExperience.employer,
          industry: firstExperience.industry,
          start: firstExperience.start,
          end: firstExperience.isCurrent ? "" : firstExperience.end,
          RoleTitle: firstExperience.title,
          YearsInRole: firstExperience.start && firstExperience.end ? 
            (new Date(firstExperience.end).getFullYear() - new Date(firstExperience.start).getFullYear()).toString() : "",
          SeniorityLevel: firstExperience.seniorityLevel,
          SkillsToolsUsed: firstExperience.skillsToolsUsed,
          ProjectHighlights: firstExperience.projectHighlights,
          Achievements: firstExperience.achievements
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={exp.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
            {index > 0 && (
              <button
                onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Employer", key: "employer", type: "text" },
              { label: "Title", key: "title", type: "text" },
              { label: "Industry", key: "industry", type: "text" },
              { label: "Start Date", key: "start", type: "date" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[#3a4043] mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={exp[field.key as keyof typeof exp]?.toString() ?? ""}
                  onChange={(e) =>
                    updateExperience(exp.id, { [field.key]: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                />
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
                  type="date"
                  value={exp.end || ""}
                  onChange={(e) =>
                    updateExperience(exp.id, { end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a4043] mb-1">
                Seniority Level
              </label>
              <input
                type="text"
                value={exp.seniorityLevel}
                onChange={(e) =>
                  updateExperience(exp.id, { seniorityLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              Project Highlights
            </label>
            <textarea
              value={exp.projectHighlights}
              onChange={(e) =>
                updateExperience(exp.id, { projectHighlights: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
              rows={3}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              Achievements
            </label>
            <textarea
              value={exp.achievements}
              onChange={(e) =>
                updateExperience(exp.id, { achievements: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
              rows={3}
            />
          </div>
        </div>
      ))}
      
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
  );
}

function SkillsStep({ 
  profile, 
  updateProfile, 
  languageProficiencies, 
  setLanguageProficiencies 
}: { 
  profile: CandidateProfile; 
  updateProfile: (updates: Partial<CandidateProfile>) => void;
  languageProficiencies: LanguageProficiency[];
  setLanguageProficiencies: (proficiencies: LanguageProficiency[]) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Skills Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Soft Skills", key: "SoftSkills" },
          { label: "Hard Skills", key: "HardSkills" },
        ].map((field) => {
          const key = field.key as keyof typeof profile.exp_skill;
          const value = profile.exp_skill[key] ?? "";

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-[#3a4043] mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  updateProfile({
                    exp_skill: { ...profile.exp_skill, [key]: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
              />
            </div>
          );
        })}
      </div>

      {/* Language Proficiency */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#3a4043]">Language Proficiency</h3>
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
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </div>
        
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
                        <SelectValue placeholder="Select" />
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
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NeuroStrengthStep({ 
  selectedStrengths, 
  setSelectedStrengths, 
  strengthOptions, 
  toggleStrength 
}: { 
  selectedStrengths: string[];
  setSelectedStrengths: (strengths: string[]) => void;
  strengthOptions: string[];
  toggleStrength: (strength: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#3a4043]">Neurodivergent Strengths</h3>
          <p className="text-sm text-gray-600">Select Your Top 10 Strengths</p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedStrengths.length}/10 selected
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {strengthOptions.map((strength) => (
            <Button
              key={strength}
              variant="outline"
              className={`rounded-full border border-purple-400 text-purple-600 hover:bg-purple-50 ${
                          selectedStrengths.includes(strength) ? 'bg-purple-100' : ''
                        }`}
                        onClick={() => toggleStrength(strength)}
            >
              {strength}
              {selectedStrengths.includes(strength) ? (
                <X className="ml-2 h-4 w-4" />
              ) : (
                <Plus className="ml-2 h-4 w-4" />
              )}
            </Button>
          ))}
        </div>

        {selectedStrengths.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[#3a4043] mb-2">Selected Strengths:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedStrengths.map((strength) => (
                <Badge
                  key={strength}
                  variant="secondary"
                  className="bg-purple-100 border border-purple-400 text-purple-600 flex items-center gap-1"
                >
                  {strength}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => toggleStrength(strength)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvironmentStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  return (
    <div className="space-y-8">
      {/* Communication & Social Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-[#3a4043] mb-4">Communication & Social Preferences</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Preferred Communication Medium", key: "communicationMedium", options: ["Written", "Verbal", "Mix"] },
            { label: "Clarity of communication", key: "clarity", options: ["Prefer clear, literal instruction", "No preference on this"] },
            { label: "Team Collaboration Style", key: "teamStyle", options: ["Prefer to work independently", "Prefer small, close-knit team", "Prefer large, dynamic team"] },
            { label: "Presentation", key: "presentationComfort", options: ["Comfortable with presentation", "Not comfortable with presentation", "Not comfortable, but willing to try"] },
            { label: "Check-ins", key: "checkIns", options: ["Prefer frequent check-ins", "Prefer scheduled check-ins", "Prefer autonomy and check-ins at agreed milestone"] },
            { label: "Job Coach", key: "jobCoach", options: ["Prefer having a job coach", "Not required any job coach"] },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[#3a4043] mb-1">{field.label}</label>
              <Select
                value={profile.environment[field.key as keyof typeof profile.environment]}
                onValueChange={(val) =>
                  updateProfile({
                    environment: { ...profile.environment, [field.key]: val },
                  })
                }
              >
                <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Sensory Needs */}
      <div>
        <h3 className="text-lg font-semibold text-[#3a4043] mb-4">Sensory Needs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Auditory Preferences", key: "auditory", options: ["Prefer quiet environment", "Can have ambient noise", "Prefer lively environment"] },
            { label: "Visual Preferences", key: "visual", options: ["Bright lighting", "Natural lighting", "Dim lighting"] },
            { label: "Workspace Preferences", key: "workspace", options: ["Fixed table", "Hot desk", "Work from anywhere / home"] },
            { label: "Workday Structure", key: "workdayStructure", options: ["Fixed work hour", "Flexible work hour"] },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[#3a4043] mb-1">{field.label}</label>
              <Select
                value={profile.environment[field.key as keyof typeof profile.environment]}
                onValueChange={(val) =>
                  updateProfile({
                    environment: { ...profile.environment, [field.key]: val },
                  })
                }
              >
                <SelectTrigger className="w-full border-[#d9d6f3] rounded-xl focus:ring-[#635bff]/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border border-[#e8e6f0] bg-white">
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
