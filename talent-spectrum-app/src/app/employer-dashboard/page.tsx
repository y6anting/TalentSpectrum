"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
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
  BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";

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
    certifications: ["Neurodivergent Friendly", "Equal Opportunity", "Accessibility Certified"]
  };

  const jobPostings = [
    {
      id: "1",
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$70k - $90k",
      status: "active",
      postedDate: "2024-01-15",
      applicants: 12,
      views: 234,
      accommodationsFriendly: true,
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
    },
    {
      id: "3",
      title: "Data Scientist",
      department: "Analytics",
      location: "On-site",
      type: "Full-time",
      salary: "$80k - $110k",
      status: "closed",
      postedDate: "2024-01-01",
      applicants: 25,
      views: 456,
      accommodationsFriendly: false,
    }
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
      interviewDate: "2024-01-25"
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
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "closed":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Closed</Badge>;
      case "under_review":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "interview_scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interview Scheduled</Badge>;
      case "shortlisted":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Shortlisted</Badge>;
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
    <div className="min-h-screen bg-[#faf9f7]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#6b8a7a] rounded-full flex items-center justify-center text-white font-semibold">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043]">{companyProfile.name}</h3>
                    <p className="text-sm text-gray-600">{companyProfile.industry}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#3a4043]">Inclusion Score</span>
                    <span className="text-sm font-medium text-[#6b8a7a]">{companyProfile.inclusionScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#6b8a7a] h-2 rounded-full" 
                      style={{ width: `${companyProfile.inclusionScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Excellent inclusion practices</p>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3 },
                    { id: "jobs", label: "Job Postings", icon: FileText },
                    { id: "applications", label: "Applications", icon: Users },
                    { id: "settings", label: "Company Settings", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-[#6b8a7a] text-white'
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
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-[#3a4043] mb-2">Employer Dashboard</h1>
                    <p className="text-gray-600">Manage your job postings and find the best neurodivergent talent.</p>
                  </div>
                  <Button 
                    className="bg-[#6b8a7a] hover:bg-[#5d7c6b]"
                    onClick={() => {
                      router.push("/post-job");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 text-[#6b8a7a] mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{jobPostings.filter(j => j.status === 'active').length}</h3>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{applications.length}</h3>
                      <p className="text-sm text-gray-600">Total Applications</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{jobPostings.reduce((sum, job) => sum + job.views, 0)}</h3>
                      <p className="text-sm text-gray-600">Total Views</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{companyProfile.inclusionScore}%</h3>
                      <p className="text-sm text-gray-600">Inclusion Score</p>
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
                        <div key={app.id} className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">{app.candidateName}</h4>
                              <p className="text-sm text-gray-600">{app.jobTitle} • {app.experience} experience</p>
                            </div>
                            {app.accommodationsRequested && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Accommodations
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-gray-500 mt-1">Score: {app.score}%</p>
                          </div>
                        </div>
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
                        <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4">
                      View All Certifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Postings Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">Job Postings</h1>
                  <Button 
                    className="bg-[#6b8a7a] hover:bg-[#5d7c6b]"
                    onClick={() => {
                      router.push("/post-job");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Job
                  </Button>
                </div>

                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">{job.title}</h3>
                            <p className="text-[#6b8a7a] font-medium mb-2">{job.department}</p>
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
                            <p className="text-xs text-gray-500 mt-1">Posted {job.postedDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{job.applicants}</span> applicants
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{job.views}</span> views
                            </div>
                            {job.accommodationsFriendly && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-[#3a4043]">Applications</h1>
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
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">{app.candidateName}</h3>
                            <p className="text-[#6b8a7a] font-medium mb-2">Applied for: {app.jobTitle}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Experience: {app.experience}</span>
                              <span>Match Score: {app.score}%</span>
                              <span>Applied: {app.appliedDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            {app.interviewDate && (
                              <p className="text-xs text-blue-600 mt-1">Interview: {app.interviewDate}</p>
                            )}
                          </div>
                        </div>

                        {app.accommodationsRequested && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-800">Accommodations Requested</p>
                                <p className="text-sm text-purple-700">{app.accommodationDetails}</p>
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
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({app.score}% match)</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              Schedule Interview
                            </Button>
                            <Button size="sm" className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
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
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043]">Company Settings</h1>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Company Name</label>
                        <input 
                          type="text" 
                          value={companyProfile.name}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Industry</label>
                        <input 
                          type="text" 
                          value={companyProfile.industry}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Location</label>
                        <input 
                          type="text" 
                          value={companyProfile.location}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Company Size</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option selected>50-100 employees</option>
                          <option>100+ employees</option>
                        </select>
                      </div>
                      <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">Save Changes</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Inclusion Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked className="text-[#6b8a7a]" />
                          <span className="text-sm">Neurodivergent-friendly workplace</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked className="text-[#6b8a7a]" />
                          <span className="text-sm">Offer workplace accommodations</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked className="text-[#6b8a7a]" />
                          <span className="text-sm">Equal opportunity employer</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="text-[#6b8a7a]" />
                          <span className="text-sm">Accessible recruitment process</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Accommodation Policy</label>
                        <textarea 
                          rows={3}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                          placeholder="Describe your workplace accommodation policies..."
                        />
                      </div>
                      <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">Update Policies</Button>
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
