"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  CheckCircle,
  Upload,
  MoveRight
} from "lucide-react";
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
  };
  jobPreferences: {
    preferredIndustries: string[];
    preferredRoles: string[];
    locationPreference: string;
    availability: string;
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

type OnboardingStep = "profile" | "education" | "experience" | "environment";

export default function CandidateOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [isLoading, setIsLoading] = useState(false);
  // Removed showDirectUpload state as it's now handled by the ResumeUploadButton component
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
    },
    jobPreferences: {
      preferredIndustries: [],
      preferredRoles: [],
      locationPreference: "",
      availability: "",
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

  // Step configuration
  const steps = [
    { id: "profile", title: "Profile Settings", icon: User, description: "Personal information and contact details" },
    { id: "education", title: "Education", icon: Book, description: "Academic background and qualifications" },
    { id: "experience", title: "Experience & Skills", icon: Briefcase, description: "Work experience and professional skills" },
    { id: "environment", title: "Environment Profile", icon: House, description: "Workplace preferences and accommodations" },
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving profile data:", candidateProfile);
      // In real app, save to API
    } catch (error) {
      console.error("Error saving data:", error);
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
        return <EducationStep profile={candidateProfile} updateProfile={updateProfile} />;
      case "experience":
        return <ExperienceStep profile={candidateProfile} updateProfile={updateProfile} />;
      case "environment":
        return <EnvironmentStep profile={candidateProfile} updateProfile={updateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
          <div className="flex items-center justify-center space-x-4 lg:space-x-8">
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                    <div className={`w-8 lg:w-24 h-1 rounded transition-all duration-300 ${
                      isCompleted ? 'bg-[#635bff]' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto">
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
                  onClick={saveData}
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

      {/* Direct Upload Modal now handled by ResumeUploadButton component */}
    </div>
  );
}

// Step Components
function ProfileStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Full Name", key: "fullName", type: "text" },
          { label: "NRIC", key: "nric", type: "text" },
          { label: "Email", key: "emailAddress", type: "email" },
          { label: "Phone Number", key: "phoneNumber", type: "text" },
          { label: "Date of Birth", key: "dateOfBirth", type: "date" },
          { label: "Gender", key: "gender", type: "text" },
          { label: "Nationality", key: "nationality", type: "text" },
          { label: "OKU Card", key: "oku_card", type: "text" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              value={profile.personalIdentifiers[field.key as keyof typeof profile.personalIdentifiers]}
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
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3a4043] mb-1">
          Residential Address
        </label>
        <textarea
          value={profile.personalIdentifiers.residentialAddress}
          onChange={(e) =>
            updateProfile({
              personalIdentifiers: {
                ...profile.personalIdentifiers,
                residentialAddress: e.target.value,
              },
            })
          }
          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
          rows={3}
        />
      </div>
    </div>
  );
}

function EducationStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  const currentYear = new Date().getFullYear();
  const grad_year = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => currentYear - i
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            label: "Level",
            key: "level",
            type: "select",
            options: ["Degree", "Master", "PhD", "Diploma", "STPM", "SPM/PT3"],
          },
          { label: "University/College/School", key: "institution", type: "text" },
          { label: "Field of Study", key: "fieldOfStudy", type: "text" },
          {
            label: "Graduation Year",
            key: "graduationYear",
            type: "select",
            options: grad_year.map(String),
          },
          { label: "CGPA / Grade", key: "grade", type: "text" },
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
                    ? profile.education[field.key]?.toString() ?? ""
                    : profile.education[field.key as keyof typeof profile.education]?.toString() ?? ""
                }
                onValueChange={(val) =>
                  updateProfile({
                    education: {
                      ...profile.education,
                      [field.key]:
                        field.key === "graduationYear"
                          ? val ? parseInt(val) : null
                          : val,
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
                value={profile.education[field.key as keyof typeof profile.education]?.toString() ?? ""}
                onChange={(e) =>
                  updateProfile({
                    education: {
                      ...profile.education,
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

function ExperienceStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Employer", key: "employer" },
          { label: "Industry", key: "industry" },
          { label: "Start Date", key: "start" },
          { label: "End Date", key: "end" },
          { label: "Role Title", key: "RoleTitle" },
          { label: "Years in Role", key: "YearsInRole" },
          { label: "Seniority Level", key: "SeniorityLevel" },
          { label: "Skills/Tools Used", key: "SkillsToolsUsed" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={profile.exp_skill[field.key as keyof typeof profile.exp_skill]}
              onChange={(e) =>
                updateProfile({
                  exp_skill: {
                    ...profile.exp_skill,
                    [field.key]: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3a4043] mb-1">
          Project Highlights
        </label>
        <textarea
          value={profile.exp_skill.ProjectHighlights}
          onChange={(e) =>
            updateProfile({
              exp_skill: {
                ...profile.exp_skill,
                ProjectHighlights: e.target.value,
              },
            })
          }
          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { label: "Hard Skills", key: "HardSkills" },
          { label: "Soft Skills", key: "SoftSkills" },
          { label: "Language Proficiency", key: "LanguageProficiency" },
          { label: "Technical Keywords", key: "TechnicalKeywords" },
          { label: "Achievements", key: "Achievements" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={profile.exp_skill[field.key as keyof typeof profile.exp_skill]}
              onChange={(e) =>
                updateProfile({
                  exp_skill: {
                    ...profile.exp_skill,
                    [field.key]: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EnvironmentStep({ profile, updateProfile }: { profile: CandidateProfile; updateProfile: (updates: Partial<CandidateProfile>) => void }) {
  return (
    <div className="space-y-8">
      {/* Cognitive & Technical */}
      <div>
        <h3 className="text-lg font-semibold text-[#3a4043] mb-4">Cognitive & Technical</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Pattern Recognition", key: "patternRecognition", options: ["Good", "Moderate", "Fair"] },
            { label: "Attention", key: "attention", options: ["Good", "Moderate", "Fair"] },
            { label: "Systematic Thinking", key: "systematicThinking", options: ["Good", "Moderate", "Fair"] },
            { label: "Big Picture vs Detail-Oriented", key: "bigVsDetail", options: ["Big Picture", "Detail-Oriented"] },
            { label: "Task-Switching", key: "taskSwitching", options: ["One task at a time", "Moderate", "Multi Tasking"] },
            { label: "Hyperfocus", key: "hyperfocus", options: ["Good", "Moderate", "Fair"] },
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

      {/* Communication & Social Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-[#3a4043] mb-4">Communication & Social Preferences</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Preferred Communication Medium", key: "communicationMedium", options: ["Written", "Verbal", "Mix"] },
            { label: "Clarity of communication", key: "clarity", options: ["Prefers clear, literal instructions", "Open-ended or indirect language"] },
            { label: "Team Collaboration Style", key: "teamStyle", options: ["Work independently", "Small, close-knit team", "Large, dynamic team"] },
            { label: "Presentation Comfort", key: "presentationComfort", options: ["Comfortable", "Not comfortable", "Not comfortable, but willing to try"] },
            { label: "Check-ins", key: "checkIns", options: ["Prefers frequent check-ins", "Scheduled check-ins", "Given a task and left to complete"] },
            { label: "Job Coach", key: "jobCoach", options: ["Need", "No Need"] },
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

      {/* Environmental & Sensory Needs */}
      <div>
        <h3 className="text-lg font-semibold text-[#3a4043] mb-4">Environmental & Sensory Needs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Auditory Preferences", key: "auditory", options: ["Quiet environment", "Can have background noise", "Noisy environment"] },
            { label: "Visual Preferences", key: "visual", options: ["Bright lighting", "Natural lighting", "Dim lighting"] },
            { label: "Workspace Type", key: "workspace", options: ["Fixed table", "Shared table", "Private office", "Work from home"] },
            { label: "Workday Structure", key: "workdayStructure", options: ["Fixed work hour", "Flexible work hour", "Not comfortable but willing to try"] },
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
