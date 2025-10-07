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
  MapPin,
  DollarSign,
  Bell,
  Shield,
  Eye,
  Star,
  Camera,
  Book,
  House
} from "lucide-react";
import { motion } from "motion/react";
import  {useRouter} from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
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
      title: "Kucing Engineer",
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
    industry: "",
    start: "",
    end: "",
    seniorityLevel: "",
    skillsToolsUsed: "",
    projectHighlights: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
		
		<div className="flex flex-col-2 justify-between">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-[#3a4043] mb-1">Welcome back, {MockCandidateProfile.lastName.split(' ')[0]}!</h1>
				<p className="text-gray-600">Here's your job search activity and recommendations.</p>
			</div>
<div className="flex flex-wrap gap-4 justify-center mt-6"> 
      <Button
        asChild
        className="bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
      >
        <Link href="/jobs/${job.id}/apply">Upload Resume</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="border-1 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
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
                    { id: "applications", label: "My Applications", icon: Briefcase },
                    { id: "saved", label: "Saved Jobs", icon: Heart },
                    { id: "profile", label: "Profile Settings", icon: Settings },
          					{ id: "education", label: "Education", icon: Book },
          					{ id: "exp_skill", label: "Experience & Skills", icon: Briefcase },
							{ id: "environment", label: "Environment Profile", icon: House },
							
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

            {/* Profile Settings Tab */}
			{activeTab === "profile" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#3a4043]">Profile Settings</h1>

				<div className="grid gap-6">
				{/* Personal Info */}
				<Card>
					<CardHeader>
					<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
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
							value={candidateProfile.personalIdentifiers[field.key as keyof typeof candidateProfile.personalIdentifiers]}
							onChange={(e) =>
								setCandidateProfile({
								...candidateProfile,
								personalIdentifiers: {
									...candidateProfile.personalIdentifiers,
									[field.key as keyof typeof candidateProfile.personalIdentifiers]: e.target.value,
								},
								})
							}
							className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							/>
						</div>
						))}
					</div>

					{/* Residential Address */}
					<div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">
						Residential Address
						</label>
						<textarea
						value={candidateProfile.personalIdentifiers.residentialAddress}
						onChange={(e) =>
							setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: {
								...candidateProfile.personalIdentifiers,
								residentialAddress: e.target.value,
							},
							})
						}
						className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus:ring-0 focus:border-[#635bff] focus:border-[1px]"
						/>
					</div>

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
    <h1 className="text-2xl font-bold text-[#3a4043]">Education Settings</h1>

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
        { label: "CGPA / Grade", key: "cgpa_grade", type: "text" },
        { label: "Award", key: "award", type: "text" },
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

			{/* Experience & Skills Tab */}
			{activeTab === "exp_skill" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#3a4043]">Experiences & Skills</h1>

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
          { label: "Employer", key: "employer" },
          { label: "Industry", key: "industry" },
          { label: "Start", key: "start" },
          { label: "End", key: "end" },
          { label: "Seniority", key: "seniorityLevel" },
          { label: "Tools Used", key: "skillsToolsUsed" },
          { label: "Project Highlights", key: "projectHighlights" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#3a4043] mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={exp[field.key as keyof typeof exp] || ""}
              onChange={(e) =>
                updateExperience(exp.id, { [field.key]: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
          </div>
        ))}
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
          industry: "",
          start: "",
          end: "",
          seniorityLevel: "",
          skillsToolsUsed: "",
          projectHighlights: "",
        },
      ])
    }
    className="bg-[#635bff] hover:bg-[#827CFF] text-white"
  >
    + Add Experience
  </Button>
</div>

				{/* Skills Info */}
				<Card>
					<CardHeader>
					<CardTitle>Skills</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					{[
						{ label: "Soft Skills", key: "SoftSkills" },
						{ label: "Hard Skills", key: "HardSkills" },
						{ label: "Language Proficiency", key: "LanguageProficiency" },
						{ label: "Achievements", key: "Achievements" },
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
					<Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
					</CardContent>
				</Card>
				</div>
			</div>
			)}
	
			
				
           {/* Environment & Preferences Tab */}
			{activeTab === "environment" && (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#3a4043]">Environment & Preferences</h1>

				<div className="grid md:grid-cols-2 gap-6">

				{/* Cognitive & Technical */}
				<Card>
					<CardHeader>
					<CardTitle>Cognitive & Technical</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					{[
						{ label: "Pattern Recognition (Ability to spot patterns)", key: "patternRecognition", options: ["Good", "Moderate", "Fair"] },
						{ label: "Attention (Ability to concentrate)", key: "attention", options: ["Good", "Moderate", "Fair"] },
						{ label: "Systematic Thinking (Ability to think logically)", key: "systematicThinking", options: ["Good", "Moderate", "Fair"] },
						{ label: "Big Picture vs. Detail-Oriented", key: "bigVsDetail", options: ["Big Picture", "Detail-Oriented"] },
						{ label: "Task-Switching (Ability to think logically)", key: "taskSwitching", options: ["One task at a time", "Moderate", "Multi Tasking"] },
						{ label: "Hyperfocus (Ability to concentrate for extended period)", key: "hyperfocus", options: ["Good", "Moderate", "Fair"] },
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

				{/* Communication & Social Preferences */}
				<Card>
					<CardHeader>
					<CardTitle>Communication & Social Preferences</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					{[
						{ label: "Preferred Communication Medium", key: "communicationMedium", options: ["Written", "Verbal", "Mix"] },
						{ label: "Clarity of communication", key: "clarity", options: ["Prefers clear, literal instructions", "Open-ended or indirect language"] },
						{ label: "Team Collaboration Style", key: "teamStyle", options: ["Work independently", "Small, close-knit team", "Large, dynamic team"] },
						{ label: "Presentation Comfort", key: "presentationComfort", options: ["Comfortable", "Not comfortable", "Not comfortable, but willing to try"] },
						{ label: "Check-ins", key: "checkIns", options: ["Prefers frequent check-ins", "Scheduled check-ins", "Given a task and left to complete"] },
						{ label: "Job Coach", key: "jobCoach", options: ["Need", "No Need"] },
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

				{/* Environmental & Sensory Needs */}
				<Card>
					<CardHeader>
					<CardTitle>Environmental & Sensory Needs</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					{[
						{ label: "Auditory Preferences", key: "auditory", options: ["Quiet environment", "Can have background noise", "Noisy environment"] },
						{ label: "Visual Preferences", key: "visual", options: ["Bright lighting", "Natural lighting", "Dim lighting"] },
						{ label: "Workspace Type", key: "workspace", options: ["Fixed table", "Shared table", "Private office", "Work from home"] },
						{ label: "Workday Structure", key: "workdayStructure", options: ["Fixed work hour", "Flexible work hour", "Not comfortable but willing to try"] },
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

				{/* Job Preferences */}
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
				</Card>

				</div>
			</div>
			)}
				
          </div>
        </div>
      </div>
    </div>
  );
}

