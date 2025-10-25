"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  Building,
  Users,
  Plus,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  MapPin,
  DollarSign,
  Bell,
  Shield,
  Heart,
  Star,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Globe,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";

export default function EmployerHomepage() {
  // Mock data for the homepage
  const companyStats = {
    name: "NeuroTech Inc.",
    industry: "Technology",
    location: "San Francisco, CA",
    employees: "50-100",
    inclusionScore: 95,
    activeJobs: 3,
    totalApplications: 47,
    totalViews: 1234,
    recentHires: 5,
  };

  const recentJobPostings = [
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
    },
    {
      id: "2",
      title: "UX Designer",
      department: "Design",
      location: "Hybrid",
      type: "Full-time",
      salary: "$65k - $85k",
      status: "active",
      postedDate: "2024-01-20",
      applicants: 8,
      views: 156,
      accommodationsFriendly: true,
    },
    {
      id: "3",
      title: "Data Analyst",
      department: "Analytics",
      location: "On-site",
      type: "Full-time",
      salary: "$80k - $110k",
      status: "active",
      postedDate: "2024-01-10",
      applicants: 15,
      views: 289,
      accommodationsFriendly: false,
    },
  ];

  const recentApplications = [
    {
      id: "1",
      candidateName: "Alex Johnson",
      jobTitle: "Backend Developer",
      appliedDate: "2024-01-18",
      status: "under_review",
      accommodationsRequested: true,
      experience: "3 years",
      score: 92,
    },
    {
      id: "2",
      candidateName: "Sam Chen",
      jobTitle: "UX Designer",
      appliedDate: "2024-01-17",
      status: "interview_scheduled",
      accommodationsRequested: false,
      experience: "2 years",
      score: 88,
    },
    {
      id: "3",
      candidateName: "Jordan Smith",
      jobTitle: "Data Analyst",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      accommodationsRequested: true,
      experience: "4 years",
      score: 95,
    },
  ];

  const companyCertifications = [
    "Neurodivergent Friendly",
    "Equal Opportunity",
    "Accessibility Certified",
    "Inclusive Hiring",
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-[#3a4043] mb-4">
              Welcome to Talent Spectrum
            </h1>
            <p className="text-xl text-[#6f7a80] mb-6 max-w-3xl mx-auto">
              Connect with exceptional neurodivergent talent and build an inclusive workplace
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/post-job">
              <Button className="bg-[#635bff] hover:bg-[#524aff] text-white px-6 py-3 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Post a Job
              </Button>
            </Link>
            <Link href="/employer-dashboard">
              <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 px-6 py-3 text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Company Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#635bff] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#3a4043]">{companyStats.name}</h2>
                  <p className="text-[#6f7a80]">{companyStats.industry} • {companyStats.location}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{companyStats.inclusionScore}%</div>
                  <div className="text-sm text-[#6f7a80]">Inclusion Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{companyStats.activeJobs}</div>
                  <div className="text-sm text-[#6f7a80]">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{companyStats.totalApplications}</div>
                  <div className="text-sm text-[#6f7a80]">Total Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#635bff] mb-1">{companyStats.recentHires}</div>
                  <div className="text-sm text-[#6f7a80]">Recent Hires</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              icon: FileText,
              iconColor: "text-[#635bff]",
              title: "Active Jobs",
              value: companyStats.activeJobs,
              change: "+2 this week",
            },
            {
              icon: Users,
              iconColor: "text-blue-600",
              title: "New Applications",
              value: companyStats.totalApplications,
              change: "+12 this week",
            },
            {
              icon: Eye,
              iconColor: "text-green-600",
              title: "Job Views",
              value: companyStats.totalViews,
              change: "+156 this week",
            },
            {
              icon: Shield,
              iconColor: "text-purple-600",
              title: "Inclusion Score",
              value: `${companyStats.inclusionScore}%`,
              change: "Excellent",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-xl overflow-hidden hover:cursor-pointer"
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.iconColor}`} />
                    <h3 className="text-2xl font-bold text-[#3a4043] mb-1">{stat.value}</h3>
                    <p className="text-sm text-[#6f7a80] mb-1">{stat.title}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Job Postings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#635bff]" />
                    Recent Job Postings
                  </CardTitle>
                  <Link href="/employer-dashboard">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobPostings.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{job.title}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">{job.department}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(job.status)}
                        {job.accommodationsFriendly && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-1 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Accommodation Friendly
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#635bff]" />
                    Recent Applications
                  </CardTitle>
                  <Link href="/employer-dashboard">
                    <Button variant="outline" size="sm" className="text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <motion.div
                      key={app.id}
                      whileHover={{ boxShadow: "2px 2px 4px rgba(99,91,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-between p-4 border border-[#e8e6f0] rounded-xl bg-white hover:cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#3a4043] mb-1">{app.candidateName}</h4>
                        <p className="text-sm text-[#6f7a80] mb-2">Applied for: {app.jobTitle}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6f7a80]">
                          <span>Experience: {app.experience}</span>
                          <span>Score: {app.score}%</span>
                          <span>Applied: {app.appliedDate}</span>
                        </div>
                        {app.accommodationsRequested && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-2 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Accommodations Requested
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Company Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Award className="w-5 h-5" />
                Company Certifications
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Your commitment to inclusive hiring practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {companyCertifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 border-emerald-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                  <Globe className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-[#635bff]/5 to-[#635bff]/10 border-[#635bff]/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#3a4043] mb-4">
                Ready to Find Your Next Great Hire?
              </h3>
              <p className="text-[#6f7a80] mb-6 max-w-2xl mx-auto">
                Join thousands of companies that have found exceptional neurodivergent talent through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/post-job">
                  <Button className="bg-[#635bff] hover:bg-[#524aff] text-white px-6 py-3">
                    <Plus className="w-5 h-5 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
                <Link href="/job-coach?role=employer">
                  <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 px-6 py-3">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Get Hiring Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



