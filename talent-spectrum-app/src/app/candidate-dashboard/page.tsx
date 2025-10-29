"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { 
  User, 
  Briefcase, 
  Heart, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  MapPin,
  DollarSign,
  Bell,
  Shield,
  Eye,
  Star,
  Camera,
  Book,
  House,
  HandFist,
  LetterTextIcon,
  BrainCog,
  BrainCircuit
} from "lucide-react";
import { motion } from "motion/react";
import  {useRouter} from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"
import { X } from 'lucide-react';

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

// Mock Malaysian candidate profile
const MockCandidateProfile = {
  id: 1,
  firstName: "Siti",
  lastName: "Aminah",
  email: "siti.aminah@example.com",
  location: "Kuala Lumpur, Malaysia",
  phone: "+60 12-345 6789",
  linkedIn: "https://www.linkedin.com/in/sitiaminah",
  portfolio: "https://sitiportfolio.com",
  skills: ["Python", "Data Analysis", "Machine Learning", "NLP"],
  experience: [
    {
      company: "TechMalaysia Sdn Bhd",
      title: "Data Scientist",
      duration: "Jan 2023 - Present",
      description: "Built predictive models and NLP pipelines for local clients.",
    },
    {
      company: "Analytica Solutions",
      title: "Data Analyst",
      duration: "Jun 2021 - Dec 2022",
      description: "Performed data cleaning, visualization, and report generation.",
    },
  ],
  education: [
    {
      degree: "MSc in Data Science",
      school: "University of Malaya",
      year: 2024,
    },
    {
      degree: "BSc in Computer Science",
      school: "Universiti Kebangsaan Malaysia",
      year: 2022,
    },
  ],
  resume: "https://example.com/siti_aminah_resume.pdf",
  neurodivergentFriendly: true,
  accommodationsRequested: ["Flexible Hours", "Quiet Workspace"],
};

type Environment = {
    // Cognitive & Technical
    patternRecognition: string;
    attention: string;
    systematicThinking: string;
    bigVsDetail: string;
    taskSwitching: string;
    hyperfocus: string;
    // Communication & Social
    communicationMedium: string;
    clarity: string;
    teamStyle: string;
    presentationComfort: string;
    checkIns: string;
    jobCoach: string;
    // Environmental & Sensory
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
      preferredLocation: string;
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
    experience: {
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
    skill: {
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

  // Mock data
  const applications = [
    {
      id: "1",
      jobTitle: "Frontend Developer",
      company: "NeuroTech",
      appliedDate: "2024-01-15",
      status: "under_review",
      location: "Remote",
      salary: "$70k - $90k",
      accommodationsRequested: true,
      score: 78,
    },
    {
      id: "2",
      jobTitle: "UX Designer",
      company: "InclusiveDesign Co",
      appliedDate: "2024-01-10",
      status: "interview_scheduled",
      location: "Hybrid",
      salary: "$65k - $85k",
      accommodationsRequested: false,
      interviewDate: "2024-01-25",
      score: 92,
    },
    {
      id: "3",
      jobTitle: "Data Analyst",
      company: "DataWorks",
      appliedDate: "2024-01-05",
      status: "rejected",
      location: "On-site",
      salary: "$60k - $75k",
      accommodationsRequested: true,
      score: 65,
    }
  ];

  const savedJobs = [
    {
      id: "4",
      title: "React Developer",
      company: "TechForward",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $100k",
      isInclusive: true,
      hasAccommodations: true,
    },
    {
      id: "5",
      title: "Software Engineer",
      company: "InnovateCorp",
      location: "San Francisco, CA",
      type: "Full-time", 
      salary: "$90k - $120k",
      isInclusive: true,
      hasAccommodations: false,
    },
    {
      id: "6",
      title: "Engineer",
      company: "InnovateCorp",
      location: "San Francisco, CA",
      type: "Full-time", 
      salary: "$90k - $120k",
      isInclusive: true,
      hasAccommodations: false,
    }  
  ];

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
      fullName: "Alicia Chui",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      emailAddress: "alicia.chui@yahoo.com",
      phoneNumber: "",
      preferredLocation: "",
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
    experience: {
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
    skill: {
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

  const [educations, setEducations] = useState([
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

// Update individual education record
const updateEducation = (id: number, updatedFields: any) => {
  setEducations((prev) =>
    prev.map((edu) =>
      edu.id === id ? { ...edu, ...updatedFields } : edu
    )
  );
};

const [experiences, setExperiences] = useState([
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

const updateExperience = (id: number, updates: Partial<typeof experiences[0]>) => {
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
const grad_year = Array.from(
  { length: currentYear - 1990 + 1 },
  (_, i) => currentYear - i
); // [currentYear, currentYear-1, ..., 1990]  

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
    if (prev.length >= 10) { // Changed from 5 to 10
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

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 font-['Plus_Jakarta_Sans',_sans-serif]"
      style={{
        backgroundImage: "url('/TalentSpectrumBackground.png')",
        backgroundAttachment: "fixed",
      }}
    >

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
		
		<div className="flex flex-col-2 justify-between">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-1">Welcome back, {MockCandidateProfile.lastName.split(' ')[0]}!</h1>
				<p className="text-white">Here's your job search activity and recommendations.</p>
			</div>
<div className="flex flex-wrap gap-4 justify-center mt-6"> 
      <Button
        asChild
        className="bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
      >
        <Link href="candidate-dashboard/resume_extract">Upload Resume</Link>
      </Button>

      <Button
        asChild
        className="bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
      >
        <Link href="/jobListing">Browse More Jobs</Link>
      </Button>
    </div>
		</div>
        <div className="grid lg:grid-cols-4 gap-8 ">
          {/* Sidebar */}
          <div className="lg:col-span-1 ">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-[#635bff] font-semibold">
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
                    // { id: "resume", label: "Upload Resume", icon: Camera },
                    { id: "profile", label: "Profile Settings", icon: Settings },
          					{ id: "education", label: "Education", icon: Book },
          					{ id: "experience", label: "Experience", icon: Briefcase },
                    { id: "skills", label: "Skills", icon: HandFist },
                    { id: "neuro_strength", label: "Neurodivergent Strengths", icon: BrainCircuit },
							      { id: "environment", label: "Preferred Environment", icon: House },
							
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-[#635bff] text-white'
                            : 'text-[#3a4043] hover:bg-gray-100'
                        } hover:cursor-pointer`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
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
					// scale: 1.05,
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


                {/* Recent Applications */}
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
          className={`flex items-center justify-between py-3 ${
            index === 0 ? "" : ""
          } hover:cursor-pointer`}
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

                {/* Accommodations Status */}
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

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">My Applications</h1>
                  
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
                              <Button size="sm" className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 shadow-md transition-all duration-200 hover:cursor-pointer"
							  onClick={() => router.push("/mock-interview/setup")}>
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

            {/* Saved Jobs Tab */}
            {activeTab === "saved" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
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

            {/* Profile Settings Tab */}
			{activeTab === "profile" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-white">Profile Settings</h1>

				<div className="grid gap-6">
				{/* Personal Info */}
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
                                value={candidateProfile.personalIdentifiers[field.key as keyof typeof candidateProfile.personalIdentifiers]}
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

					{/* Preferred Location
					<div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">
						Preferred Location
						</label>
						<textarea
						value={candidateProfile.personalIdentifiers.preferredLocation}
						onChange={(e) =>
							setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: {
								...candidateProfile.personalIdentifiers,
								preferredLocation: e.target.value,
							},
							})
						}
						className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
						/>
					</div> */}

					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">
						Save Changes
					</Button>
					</CardContent>
				</Card>
				</div>
			</div>
			)}

{activeTab === "education" && (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-white">Education</h1>

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
              award:""
            },
          ])
        }
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
      >
        + Add Education
      </Button>
    </div>      
    </div>
  </div>
)}

			{/* Experience Tab */}
			{activeTab === "experience" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-white">Experience</h1>

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
          // { label: "End Date", key: "end", type: "date" },
          // { label: "Tools Used", key: "skillsToolsUsed" },
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
            <input
              type="text"
              value={String(exp.projectHighlights ?? "")}
              onChange={(e) => {
                updateExperience(exp.id, { projectHighlights: e.target.value });
              }}
              className="w-115 h-43 px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
        </div>

        {/* Achievements */}
        <div>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              Achievements
            </label>
            <input
              type="text"
              value={String(exp.achievements ?? "")}
              onChange={(e) => {
                updateExperience(exp.id, { achievements: e.target.value });
              }}
              className="w-115 h-43 px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
        </div>
      </div>
    </CardContent>
  </Card>
))}

{/* Add Experience Button */}
<div className="flex justify-end mt-4">
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
				</div>
			</div>
			)}

      {/* Skills Tab */}
			{activeTab === "skills" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-white">Skills</h1>

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
						const key = field.key as keyof typeof candidateProfile.experience;
						const value = candidateProfile.experience[key] ?? "";

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
								experience: { ...candidateProfile.experience, [key]: e.target.value },
								})
							}
							className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							/>
						</div>
						);
					})}
					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Save Changes</Button>
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
	
			{/* Neurodivergent Strengths Tab */}
			{activeTab === "neuro_strength" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-white">Neurodivergent Strengths</h1>
      <p className="text-sm text-white italic">( Select Your Top 10 Strengths )</p>
    </div>

    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {strengthOptions
          .filter(strength => !selectedStrengths.includes(strength))
          .map((strength) => (
          <Button
            key={strength}
            variant="outline"
            className="cursor-pointer rounded-full border border-purple-400 text-purple-600 hover:bg-purple-50"
            onClick={() => toggleStrength(strength)}
          >
            {strength}
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        ))}
      </div>

      {selectedStrengths.length > 0 && (
        <div className="mt-4">
          <h3 className="text-1xl font-bold text-white">Selected Strengths:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedStrengths.map((strength) => (
              <Badge
                key={strength}
                variant="secondary"
                className="rounded-full border border-purple-400 text-purple-600 hover:bg-purple-50 h-10 text-sm pl-3"
              >
                {strength}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent cursor-pointer"
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
)}
				
           {/* Preferred Environment Tab */}
			{activeTab === "environment" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-white">Preferred Environment</h1>

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
					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
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
					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
					</CardContent>
				</Card>

				{/* Job Preferences
				<Card>
					<CardHeader>
					<CardTitle>Job Preferences</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					{[
						{ label: "Preferred Industries", key: "preferredIndustries", type: "text", isArray: true },
						{ label: "Preferred Roles", key: "preferredRoles", type: "text", isArray: true },
						{ label: "Location Preference", key: "locationPreference", type: "text" },
						{ label: "Availability", key: "availability", type: "text" },
					].map((field) => {
						const key = field.key as keyof typeof candidateProfile.jobPreferences;
						const value = candidateProfile.jobPreferences[key];
						return (
						<div key={key}>
							<label className="block text-sm font-medium text-[#3a4043] mb-1">{field.label}</label>
							<input
							type="text"
							value={
								field.isArray
								? (value as string[]).join(", ")
								: (value as string)
							}
							onChange={(e) =>
								setCandidateProfile({
								...candidateProfile,
								jobPreferences: {
									...candidateProfile.jobPreferences,
									[key]: field.isArray
									? e.target.value.split(",").map((s) => s.trim())
									: e.target.value,
								},
								})
							}
							className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							/>
						</div>
						);
					})}
					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
					</CardContent>
				</Card> */}

				</div>
			</div>
			)}
				
          </div>
        </div>
      </div>
    </div>
  );
}

