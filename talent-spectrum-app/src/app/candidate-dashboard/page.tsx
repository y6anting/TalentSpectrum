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
  Star
} from "lucide-react";

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const candidateProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    location: "Remote",
    profileCompletion: 85,
    accommodations: ["Flexible hours", "Quiet workspace", "Written instructions"],
    preferences: {
      workType: "Remote",
      communication: "Email preferred",
      schedule: "Flexible hours"
    }
  };

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
    }
  ];

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
                    {candidateProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3a4043]">{candidateProfile.name}</h3>
                    <p className="text-sm text-gray-600">{candidateProfile.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#3a4043]">Profile Completion</span>
                    <span className="text-sm font-medium text-[#6b8a7a]">{candidateProfile.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#6b8a7a] h-2 rounded-full" 
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
                <div>
                  <h1 className="text-2xl font-bold text-[#3a4043] mb-2">Welcome back, {candidateProfile.name.split(' ')[0]}!</h1>
                  <p className="text-gray-600">Here's your job search activity and recommendations.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Briefcase className="h-8 w-8 text-[#6b8a7a] mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">{applications.length}</h3>
                      <p className="text-sm text-gray-600">Applications Submitted</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-[#3a4043] mb-1">12</h3>
                      <p className="text-sm text-gray-600">Profile Views</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
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
                        <div key={app.id} className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-lg">
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
                  <h1 className="text-2xl font-bold text-[#3a4043]">My Applications</h1>
                  <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
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
                            <p className="text-[#6b8a7a] font-medium mb-2">{app.company}</p>
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
                              <Button size="sm" className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
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
                            <h3 className="text-lg font-semibold text-[#3a4043] mb-1">{job.title}</h3>
                            <p className="text-[#6b8a7a] font-medium mb-2">{job.company}</p>
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
                            <Button size="sm" className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
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

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Full Name</label>
                        <input 
                          type="text" 
                          value={candidateProfile.name}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Email</label>
                        <input 
                          type="email" 
                          value={candidateProfile.email}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Location</label>
                        <input 
                          type="text" 
                          value={candidateProfile.location}
                          className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg"
                        />
                      </div>
                      <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">Save Changes</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Work Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Preferred Work Type</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>Remote</option>
                          <option>Hybrid</option>
                          <option>On-site</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Communication Preference</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>Email preferred</option>
                          <option>Phone calls</option>
                          <option>Video calls</option>
                          <option>Instant messaging</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-1">Schedule Preference</label>
                        <select className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg">
                          <option>Flexible hours</option>
                          <option>Standard hours (9-5)</option>
                          <option>Early start</option>
                          <option>Late start</option>
                        </select>
                      </div>
                      <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">Update Preferences</Button>
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
