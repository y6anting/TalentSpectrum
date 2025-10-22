"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  Building,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  Bell,
  Settings,
  Shield,
  Heart,
  Star,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  // Mock data
  const companyProfile = {
    name: "NeuroTech Inc.",
    email: "hr@neurotech.com",
    location: "San Francisco, CA",
    website: "https://neurotech.com",
    employees: "50-100",
    industry: "Technology",
    inclusionScore: 95,
    certifications: [
      "Neurodivergent Friendly",
      "Equal Opportunity",
      "Accessibility Certified",
    ],
    size: "1-10 employees"
  };

  const jobPostings = [
    {
      id: "1",
      title: "Backend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$70k - $90k",
      status: "active",
      postedDate: "2024-01-15",
      applicants: 12,
      views: 234,
      accommodationsFriendly: true,
      size: "100-500 employees"
    },
    {
      id: "2",
      title: "UX Designer",
      department: "Design",
      location: "Hybrid",
      type: "Full-time",
      salary: "$65k - $85k",
      status: "draft",
      postedDate: "2024-01-20",
      applicants: 0,
      views: 0,
      accommodationsFriendly: true,
      size: "11-50 employees"
    },
    {
      id: "3",
      title: "Data Analyst",
      department: "Analytics",
      location: "On-site",
      type: "Full-time",
      salary: "$80k - $110k",
      status: "closed",
      postedDate: "2024-01-01",
      applicants: 25,
      views: 456,
      accommodationsFriendly: false,
      size: "50-100 employees"
    },
  ];

  const applications = [
    {
      id: "1",
      candidateName: "Alex Johnson",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-18",
      status: "under_review",
      accommodationsRequested: true,
      accommodationDetails: "Flexible hours, quiet workspace",
      experience: "3 years",
      score: 92,
    },
    {
      id: "2",
      candidateName: "Sam Chen",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-17",
      status: "interview_scheduled",
      accommodationsRequested: false,
      experience: "2 years",
      score: 88,
      interviewDate: "2024-01-25",
    },
    {
      id: "3",
      candidateName: "Jordan Smith",
      jobTitle: "Frontend Developer",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      accommodationsRequested: true,
      accommodationDetails: "Extended time for technical tests",
      experience: "4 years",
      score: 95,
    },
  ];

  const [companyName, setCompanyName] = useState(companyProfile.name);
  const [companyIndustry, setCompanyIndustry] = useState(companyProfile.industry)
  const [companyLocation, setCompanyLocation] = useState(companyProfile.location)
  const [companySize, setCompanySize] = useState(companyProfile.size)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Closed
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Under Review
          </Badge>
        );
      case "interview_scheduled":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Interview Scheduled
          </Badge>
        );
      case "shortlisted":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Shortlisted
          </Badge>
        );
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
      case "shortlisted":
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Left section */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-[#3a4043] mb-1">
              Welcome back, {companyProfile.name}!
            </h1>
            <p className="text-gray-600 mb-4 sm:mb-0">
              Manage your job postings and find the best neurodivergent talent.
            </p>

            {/* Button visible only on small screens */}
            <motion.div
              whileHover={{
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-block rounded-lg sm:hidden"
            >
              <Button
                className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
                onClick={() => router.push("/post-job")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </motion.div>
          </div>

          {/* Button visible only on larger screens */}
          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            className="hidden sm:inline-block rounded-lg"
          >
            <Button
              className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
              onClick={() => router.push("/post-job")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </motion.div>
      </div>

        <div className="grid lg:grid-cols-4 gap-8 space-y-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043]">
                      {companyProfile.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {companyProfile.industry}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#3a4043]">
                      Inclusion Score
                    </span>
                    <span className="text-sm font-medium text-[#635bff]">
                      {companyProfile.inclusionScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#635bff] h-2 rounded-full"
                      style={{ width: `${companyProfile.inclusionScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Excellent inclusion practices
                  </p>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3 },
                    { id: "jobs", label: "Job Postings", icon: FileText },
                    { id: "applications", label: "Applications", icon: Users },
                    {
                      id: "settings",
                      label: "Company Settings",
                      icon: Settings,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? "bg-[#635bff] text-white"
                            : "text-[#3a4043] hover:bg-gray-100"
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    icon: FileText,
                    iconColor: "text-[#635bff]",
                    title: "Active Jobs",
                    value: jobPostings.filter((j) => j.status === "active").length,
                  },
                  {
                    icon: Users,
                    iconColor: "text-blue-600",
                    title: "Total Applications",
                    value: applications.length,
                  },
                  {
                    icon: Eye,
                    iconColor: "text-green-600",
                    title: "Total Views",
                    value: jobPostings.reduce((sum, job) => sum + job.views, 0),
                  },
                  {
                    icon: Shield,
                    iconColor: "text-purple-600",
                    title: "Inclusion Score",
                    value: `${companyProfile.inclusionScore}%`,
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
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((app) => (
                        <motion.div
                          key={app.id}
                          whileHover={{
                            boxShadow: "2px 2px 4px rgba(99,91,255,0.3)",
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex items-center justify-between p-4 border border-[#9d95bd] rounded-xl overflow-hidden bg-white hover:cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">{app.candidateName}</h4>
                              <p className="text-sm text-gray-600">
                                {app.jobTitle} • {app.experience} experience
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

                {/* Company Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-emerald-600" />
                      Inclusion Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {companyProfile.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4 bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-200 hover:cursor-pointer">
                      View All Certifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Postings Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                    Job Postings
                  </h1>

                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">
                              {job.title}
                            </h3>
                            <p className="text-[#635bff] font-medium mb-2">
                              {job.department}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          </div>
                          <div className="text-right">
                            {getStatusBadge(job.status)}
                            <p className="text-xs text-gray-500 mt-1">
                              Posted {job.postedDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                {job.applicants}
                              </span>{" "}
                              applicants
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{job.views}</span>{" "}
                              views
                            </div>
                            {job.accommodationsFriendly && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Accommodation Friendly
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                    Applications
                  </h1>
                 
                  <div className="flex gap-2">
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Sort</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">
                              {app.candidateName}
                            </h3>
                            <p className="text-[#635bff] font-medium mb-2">
                              Applied for: {app.jobTitle}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Experience: {app.experience}</span>
                              <span>Match Score: {app.score}%</span>
                              <span>Applied: {app.appliedDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            {app.interviewDate && (
                              <p className="text-xs text-blue-600 mt-1">
                                Interview: {app.interviewDate}
                              </p>
                            )}
                          </div>
                        </div>

                        {app.accommodationsRequested && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-800">
                                  Accommodations Requested
                                </p>
                                <p className="text-sm text-purple-700">
                                  {app.accommodationDetails}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.floor(app.score / 20)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({app.score}% match)
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              Schedule Interview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                            >
                              Shortlist
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Company Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Company Settings
                </h1>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Company Name
                        </label>
                        <input
                          
                          type="text"
                          value={companyName}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							            onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Please enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Industry
                        </label>
                        <input
                          type="text"
                          value={companyIndustry}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							            onChange={(e) => setCompanyIndustry(e.target.value)}
                          placeholder="Please enter industry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={companyLocation}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							            onChange={(e) => setCompanyLocation(e.target.value)}
                          placeholder="Please enter company location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Company Size
                        </label>
                        <select 
                          value={companyProfile.size}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option selected>50-100 employees</option>
                          <option>100-500 employees</option>
                          <option>500+ employees</option>
                        </select>
                      </div>
                      <Button className="bg-[#635bff] hover:bg-[#5346e6] text-white">
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Inclusion Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked
                            className="text-[#635bff]"
                          />
                          <span className="text-sm">
                            Neurodivergent-friendly workplace
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked
                            className="text-[#635bff]"
                          />
                          <span className="text-sm">
                            Offer workplace accommodations
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked
                            className="text-[#635bff]"
                          />
                          <span className="text-sm">
                            Equal opportunity employer
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="text-[#635bff]" />
                          <span className="text-sm">
                            Accessible recruitment process
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">
                          Accommodation Policy
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
							            placeholder="Describe your workplace accommodation policies..."
                        />
                      </div>
                      <Button className="bg-[#635bff] hover:bg-[#5346e6] text-white">
                        Update Policies
                      </Button>
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
