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

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");


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
	  

	  }  
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
      interviewDate: "2024-01-25"
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
	  name: "",
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
	});

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
    <div className="min-h-screen bg-[#faf9f7]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        }`}
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
                <div>
                  <h1 className="text-2xl font-bold text-[#635bff] mb-2">Welcome back, {candidateProfile.name.split(' ')[0]}!</h1>
                  <p className="text-gray-600">Here's your job search activity and recommendations.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="border border-[#d8d4f0] bg-white rounded-2xl 
             								hover:scale-[1.02] transition-all duration-300
             								hover:border-[#635bff] hover:shadow-[0_0_6px_2px_rgba(99,91,255,0.2)] 
											p-6 text-center">
                      <Briefcase className="h-8 w-8 text-[#635bff] mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{applications.length}</h3>
                      <p className="text-sm text-gray-600">Applications Submitted</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="border border-[#d8d4f0] bg-white rounded-2xl 
             								hover:scale-[1.02] transition-all duration-300
             								hover:border-[#635bff] hover:shadow-[0_0_6px_2px_rgba(99,91,255,0.2)] 
											p-6 text-center">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">12</h3>
                      <p className="text-sm text-gray-600">Profile Views</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="border border-[#d8d4f0] bg-white rounded-2xl 
             								hover:scale-[1.02] transition-all duration-300
             								hover:border-[#635bff] hover:shadow-[0_0_6px_2px_rgba(99,91,255,0.2)] 
											p-6 text-center">
                      <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{savedJobs.length}</h3>
                      <p className="text-sm text-gray-600">Saved Jobs</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-4 border border-[#635bff] rounded-lg ">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">{app.jobTitle}</h4>
                              <p className="text-sm text-gray-600">{app.company} • {app.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-gray-500 mt-1">Applied {app.appliedDate}</p>
                          </div>
                        </div>
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
                  <h1 className="text-2xl font-bold text-[#635bff]">My Applications</h1>
                  <Button className="bg-[#635bff] hover:bg-[#5d7c6b]">
                    <Link href="/opportunities">Browse More Jobs</Link>
                  </Button>
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
                              <Button size="sm" className="bg-[#635bff] hover:bg-[#5d7c6b]">
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
                  <h1 className="text-2xl font-bold text-[#635bff]">Saved Jobs</h1>
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
				<h1 className="text-2xl font-bold text-[#635bff]">Profile Settings</h1>

				<div className="grid gap-6">
				  {/* Personal Info */}
				  <Card>
					<CardHeader>
					  <CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					  <div className="grid md:grid-cols-2 gap-6">
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Full Name</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.fullName}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  fullName: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">NRIC</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.nric}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  fullName: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>					  
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Email</label>
						<input 
						  type="email" 
						  value={candidateProfile.personalIdentifiers.emailAddress}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  emailAddress: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Phone Number</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.phoneNumber}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  phoneNumber: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Date of Birth</label>
						<input 
						  type="date" 
						  value={candidateProfile.personalIdentifiers.dateOfBirth}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  dateOfBirth: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Gender</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.gender}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  gender: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Nationality</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.nationality}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  nationality: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">OKU Card</label>
						<input 
						  type="text" 
						  value={candidateProfile.personalIdentifiers.oku_card}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  nationality: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>					  
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Residential Address</label>
						<textarea
						  value={candidateProfile.personalIdentifiers.residentialAddress}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							personalIdentifiers: { 
							  ...candidateProfile.personalIdentifiers, 
							  residentialAddress: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Save Changes</Button>
					</CardContent>
				  </Card>
				</div>

				{/* You can repeat similar structure for Education, Work Experience, Skills, Languages */}
			  </div>
			)}
            {/* Education Settings Tab */}
			{activeTab === "education" && (
			  <div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#635bff]">Education Settings</h1>

				<div className="grid gap-6">
				  {/* Education Info */}
				  <Card>
					<CardHeader>
					  <CardTitle>Education Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					  <div className="grid md:grid-cols-2 gap-6">
					  <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Level</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>Degree</option>
                          <option>Master</option>
                          <option>Phd</option>
                          <option>Diploma</option>
						  <option>STPM</option>
						  <option>PT3/PMR</option>
                        </select>
                      </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Univercity/College/School</label>
						<input 
						  type="text" 
						  value={candidateProfile.education.institution ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							education: { 
							  ...candidateProfile.education, 
							  institution: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Field of Study</label>
						<input 
						  type="text" 
						  value={candidateProfile.education.institution ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							education: { 
							  ...candidateProfile.education, 
							  institution: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>					  
					<div>
					  <label className="block text-sm font-medium text-[#3a4043] mb-1">Graduation Year</label>
					  <select
						value={
						  candidateProfile.education.graduationYear !== null &&
						  candidateProfile.education.graduationYear !== undefined
							? String(candidateProfile.education.graduationYear)
							: ""
						}
						onChange={(e) => {
						  const val = e.target.value;
						  setCandidateProfile({
							...candidateProfile,
							education: {
							  ...candidateProfile.education,
							  graduationYear: val === "" ? null : parseInt(val, 10),
							},
						  });
						}}
						className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
					  >
						<option value="">Select year</option>
						{grad_year.map((y) => (
						  <option key={y} value={String(y)}>
							{y}
						  </option>
						))}
					  </select>
					</div>					  
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">CGPA</label>
						<input 
						  type="number" 
						  value={candidateProfile.education.cgpa ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							education: { 
							  ...candidateProfile.education, 
                cgpa: e.target.value ? parseFloat(e.target.value) : null, 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Grade</label>
						<input 
						  type="string" 
						  value={candidateProfile.education.grade ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							education: { 
							  ...candidateProfile.education, 
							  grade: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>	
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Award</label>
						<input 
						  type="string" 
						  value={candidateProfile.education.award ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							education: { 
							  ...candidateProfile.education, 
							  award: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>					  
					  </div>
					  <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Save Changes</Button>
					</CardContent>
				  </Card>	
				</div>
			</div>
			)}
            {/* Experience & Skill Tab */}
			{activeTab === "exp_skill" && (
			  <div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#635bff]">Experiences & Skills</h1>

				<div className="grid gap-6">
				  {/* Experience & Skill */}
				  <Card>
					<CardHeader>
					  <CardTitle>Experiences</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					  <div className="grid md:grid-cols-2 gap-6">
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Employer</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.employer ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  employer: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Industry</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.industry ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  industry: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Start</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.start ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  start: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>			
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">End</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.end ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  end: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>	
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Seniority</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.SeniorityLevel ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  SeniorityLevel: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Tools Used</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.SkillsToolsUsed ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  SkillsToolsUsed: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>		
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Project Highlights</label>
						<input 
						  type="text" 
						  value={candidateProfile.exp_skill.ProjectHighlights ?? ""}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  ProjectHighlights: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>						  				  
					  <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Save Changes</Button>
					</CardContent>
				  </Card>
				  {/* Skills */}
				  <Card>
					<CardHeader>
					  <CardTitle>Skills</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Soft Skills</label>
						<input
						  type="text"
						  value={candidateProfile.exp_skill.SoftSkills}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  SoftSkills: e.target.value
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Hard Skills</label>
						<input
						  type="text"
						  value={candidateProfile.exp_skill.HardSkills}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  HardSkills: e.target.value
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Language Proficiency</label>
						<input
						  type="text"
						  value={candidateProfile.exp_skill.LanguageProficiency}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  LanguageProficiency: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Achievements</label>
						<input
						  type="text"
						  value={candidateProfile.exp_skill.Achievements}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							exp_skill: { 
							  ...candidateProfile.exp_skill, 
							  Achievements: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>					  
					  <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
					</CardContent>
				  </Card>		  
				</div>			
			</div>
			)}		
            {/* Experience & Skill Tab */}
			{activeTab === "environment" && (
			  <div className="space-y-6">
				<h1 className="text-2xl font-bold text-[#635bff]">Environment & Preferences</h1>

				  {/* Environment */}
				<div className="grid md:grid-cols-2 gap-6">
				  {/* Environment */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cognitive & Technical </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Pattern Recognition (Ability to spot patterns)</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Good</option>
                          <option>Moderate</option>
                          <option>Fair</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Attention (Ability to concentrate)</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Good</option>
                          <option>Moderate</option>
                          <option>Fair</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Systematic Thinking (Ability to think logically)</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Good</option>
                          <option>Moderate</option>
                          <option>Fair</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Big Picture vs. Detail-Oriented</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Big Picture</option>
                          <option>Detail-Oriented</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Task-Switching (Ability to think logically)</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>One task at a time </option>
                          <option>Moderate</option>
						  <option>Multi Taskting</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Hyperfocus  (Ability to concentrate for extend period)</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Good</option>
                          <option>Moderate</option>
                          <option>Fair</option>
                        </select>
                      </div>					  
                      <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
                    </CardContent>
                  </Card>	
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication & Social Preferences </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Preferred Communication Medium</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Written</option>
                          <option>Verbal</option>
                          <option>Mix</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Clarity of communication</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Prefers clear, literal instructions </option>
                          <option>Open-ended or indirect language</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Team Collaboration Style</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Work independently</option>
                          <option>Small, close-knit team</option>
                          <option>Large, dynamic team</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Presentation Comfort</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Comfortable</option>
                          <option>Not comfortable</option>
                          <option>Not comfortable, but willing to try</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Check-ins</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Prefers frequent check-ins</option>
                          <option>Scheduled check-ins</option>
                          <option>Given a task and left to complete </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Job Coach</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Need</option>
                          <option>No Need</option>
                        </select>
                      </div>						  
                      <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
                    </CardContent>
                  </Card>	
                  <Card>
                    <CardHeader>
                      <CardTitle>Environmental & Sensory Needs</CardTitle>
                    </CardHeader>				  
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Auditory Preferences</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Quiet environment</option>
                          <option>Can have background noise</option>
                          <option>Noisy environment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Visual Preferences</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Bright lighting</option>
                          <option>Natural lighthing</option>
						  <option>Dim lighthing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Workspace Type</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Fixed table</option>
                          <option>Shared table</option>
                          <option>Private office</option>
						  <option>Work from home</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Workday Structure</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option></option>
						  <option>Fixed work hour</option>
                          <option>Flexible work hour</option>
                          <option>Not comfortable but willing to try</option>
                        </select>
                      </div>				  
                      <Button className="bg-[#635bff] hover:bg-[#827CFF] text-white">Update Preferences</Button>
                    </CardContent>
                  </Card>
				  {/* Job Preferences */}
				  <Card>
					<CardHeader>
					  <CardTitle>Job Preferences</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Preferred Industries</label>
						<input
						  type="text"
						  value={candidateProfile.jobPreferences.preferredIndustries.join(", ")}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							jobPreferences: { 
							  ...candidateProfile.jobPreferences, 
							  preferredIndustries: e.target.value.split(",").map(s => s.trim()) 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Preferred Roles</label>
						<input
						  type="text"
						  value={candidateProfile.jobPreferences.preferredRoles.join(", ")}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							jobPreferences: { 
							  ...candidateProfile.jobPreferences, 
							  preferredRoles: e.target.value.split(",").map(s => s.trim()) 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Location Preference</label>
						<input
						  type="text"
						  value={candidateProfile.jobPreferences.locationPreference}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							jobPreferences: { 
							  ...candidateProfile.jobPreferences, 
							  locationPreference: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
					  <div>
						<label className="block text-sm font-medium text-[#3a4043] mb-1">Availability</label>
						<input
						  type="text"
						  value={candidateProfile.jobPreferences.availability}
						  onChange={(e) => setCandidateProfile({
							...candidateProfile,
							jobPreferences: { 
							  ...candidateProfile.jobPreferences, 
							  availability: e.target.value 
							}
						  })}
						  className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
						/>
					  </div>
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

