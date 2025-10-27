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
  Calculator,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";

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
    size: "1-10 employees",
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
      size: "100-500 employees",
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
      size: "11-50 employees",
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
      size: "50-100 employees",
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
  const [companyIndustry, setCompanyIndustry] = useState(
    companyProfile.industry
  );
  const [companyLocation, setCompanyLocation] = useState(
    companyProfile.location
  );
  const [companySize, setCompanySize] = useState(companyProfile.size);

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

  const FIXED_EPF_RATE = 13; // Example: 13%
  const FIXED_SOCSO_RATE = 1.75;
  const FIXED_EIS_RATE = 0.2;
  const FIXED_CORPORATE_TAX_RATE = 24;

  const [inputs, setInputs] = useState({
    baseSalary: 10000,
  });

  const handleChange = (field: string, value: number | string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // --- Tax Relief Calculator Logic ---
  const calc = () => {
    const baseSalary = Number(inputs.baseSalary) || 0;

    const epfCost = (baseSalary * FIXED_EPF_RATE) / 100;
    const socsoCost = (baseSalary * FIXED_SOCSO_RATE) / 100;
    const eisCost = (baseSalary * FIXED_EIS_RATE) / 100;

    const monthlyEmployerCost = baseSalary + epfCost + socsoCost + eisCost;
    const annualCost = monthlyEmployerCost * 12;

    // For OKU, double deduction
    const neuroDeductible = annualCost;
    const okuDeductible = annualCost * 2;

    const neuroTaxSavings = (neuroDeductible * FIXED_CORPORATE_TAX_RATE) / 100;
    const okuTaxSavings = (okuDeductible * FIXED_CORPORATE_TAX_RATE) / 100;

    const neuroAfterTax = annualCost - neuroTaxSavings;
    const okuAfterTax = annualCost - okuTaxSavings;
    const annualSavings = neuroAfterTax - okuAfterTax;

    return {
      baseSalary,
      epfCost,
      socsoCost,
      eisCost,
      monthlyEmployerCost,
      annualCost,
      neuroTaxSavings,
      okuTaxSavings,
      neuroAfterTax,
      okuAfterTax,
      annualSavings,
    };
  };

  const result = calc();

  return (
    <div className="min-h-screen bg-gradient-to-b from--50 to-background">
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
          </div>

          {/* Button visible only on larger screens */}
          <Button
            className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
            onClick={() => router.push("/post-job")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
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
                    {
                      id: "tax-calculator",
                      label: "Calculator",
                      icon: Calculator,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors hover:cursor-pointer ${
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
                <div className="flex justify-between items-center"></div>

                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    {
                      icon: FileText,
                      iconColor: "text-[#635bff]",
                      title: "Active Jobs",
                      value: jobPostings.filter((j) => j.status === "active")
                        .length,
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
                      value: jobPostings.reduce(
                        (sum, job) => sum + job.views,
                        0
                      ),
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
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Icon
                            className={`h-8 w-8 mx-auto mb-2 ${card.iconColor}`}
                          />
                          <h3 className="font-semibold text-[#3a4043] mb-1">
                            {card.value}
                          </h3>
                          <p className="text-sm text-gray-600">{card.title}</p>
                        </CardContent>
                      </Card>
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
                    <div className="divide-y divide-[#e8e6f0]">
                      {applications.slice(0, 3).map((app) => (
                        <motion.div
                          key={app.id}
                          whileHover={{
                            scale: 1.01,
                            backgroundColor: "rgba(99,91,255,0.03)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center justify-between py-4 hover:cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(app.status)}
                            <div>
                              <h4 className="font-medium text-[#3a4043]">
                                {app.candidateName}
                              </h4>
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
                            <p className="text-xs text-gray-500 mt-1">
                              Score: {app.score}%
                            </p>
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
                    <Button
                      variant="outline"
                      className="mt-4 bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-200 hover:cursor-pointer hover:text-white"
                    >
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
                        {/* Shadcn UI Select Component */}
                        <Select
                          value={companySize}
                          onValueChange={setCompanySize}
                        >
                          <SelectTrigger className="w-full border border-[#e8e6f0] rounded-lg text-[#3a4043] focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#e8e6f0] shadow-md rounded-lg">
                            <SelectItem value="1-10 employees">
                              1-10 employees
                            </SelectItem>
                            <SelectItem value="11-50 employees">
                              11-50 employees
                            </SelectItem>
                            <SelectItem value="50-100 employees">
                              50-100 employees
                            </SelectItem>
                            <SelectItem value="100-500 employees">
                              100-500 employees
                            </SelectItem>
                            <SelectItem value="500+ employees">
                              500+ employees
                            </SelectItem>
                          </SelectContent>
                        </Select>
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

            {/* Tax Calculator Tab */}
            {activeTab === "tax-calculator" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#3a4043] mt-4">
                  Double Tax Relief Calculator
                </h1>

                <Card>
                  <CardHeader>
                    <CardTitle>Enter Employer Cost Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    {[{ label: "Base Salary (RM)", field: "baseSalary" }].map(
                      (item) => (
                        <div key={item.field}>
                          <label className="block text-sm font-medium text-[#3a4043] mb-1">
                            {item.label}
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              inputs[item.field as keyof typeof inputs] ?? ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                handleChange(item.field, "");
                                return;
                              }
                              if (!/^\d+$/.test(val)) return;
                              if (val.length > 1 && val.startsWith("0")) return;
                              handleChange(item.field, Number(val));
                            }}
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-[#635bff] focus-visible:ring-[#635bff]/30 focus-visible:ring-[1px]"
                          />
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Comparison: Neurotypical vs OKU Cardholder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="w-full border border-[#e8e6f0] text-sm">
                      <thead className="bg-[#f9f9ff] text-[#3a4043]">
                        <tr>
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">
                            Neurotypical Staff (RM)
                          </th>
                          <th className="p-2 text-left">OKU Cardholder (RM)</th>
                          <th className="p-2 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-2 min-h-[120px]">Base Salary</td>
                          <td className="p-2">
                            {result.baseSalary.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {result.monthlyEmployerCost.toFixed(2)}
                          </td>
                          <td>Same gross salary (Monthly)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">EPF </td>
                          <td className="p-2">{result.epfCost.toFixed(2)}</td>
                          <td className="p-2">{result.epfCost.toFixed(2)}</td>
                          <td>
                            Mandatory employer contribution (Employer 13%)
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">SOCSO </td>
                          <td className="p-2">{result.socsoCost.toFixed(2)}</td>
                          <td className="p-2">{result.socsoCost.toFixed(2)}</td>
                          <td>
                            Based on SOCSO rate for Employment Injury Scheme
                            (Employer ~1.75%)
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">EIS </td>
                          <td className="p-2">{result.eisCost.toFixed(2)}</td>
                          <td className="p-2">{result.eisCost.toFixed(2)}</td>
                          <td>
                            Employment Insurance System contribution (Employer
                            0.2%)
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Total monthly Employer Cost</td>
                          <td className="p-2">
                            {result.monthlyEmployerCost.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {result.monthlyEmployerCost.toFixed(2)}
                          </td>
                          <td>Same total cash flow (Before Tax Relief)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Annual Employer Cost</td>
                          <td className="p-2">
                            {result.annualCost.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {result.annualCost.toFixed(2)}
                          </td>
                          <td>
                            RM{result.monthlyEmployerCost} x 12 months (Before
                            Tax Relief)
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Tax Relief </td>
                          <td className="p-2">❌ not applicable</td>
                          <td className="p-2">
                            ✅ Eligible for Double Tax Deduction on remuneration
                            paid to OKU employees
                          </td>
                          <td>
                            Employers can claim twice the amount of remuneration
                            as deductible expense under Income Tax Act 1967
                            (Double Deduction)
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Effective Deductible Expense</td>
                          <td className="p-2">
                            {result.annualCost.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {(result.annualCost * 2).toFixed(2)}
                          </td>
                          <td>For OKU, deduction = 2 x salary paid</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-2">Tax Savings</td>
                          <td className="p-2 text-green-700">
                            {result.neuroTaxSavings.toFixed(2)}
                          </td>
                          <td className="p-2 text-green-700">
                            {result.okuTaxSavings.toFixed(2)}
                          </td>
                          <td>
                            Double deduction doubles the tax shield @ 24%
                            Corporate Tax Rate
                          </td>
                        </tr>
                        <tr className="border-t font-semibold bg-[#f7f6ff]">
                          <td className="p-2">
                            Net Effective Annual Employer Cost
                          </td>
                          <td className="p-2 text-[#3a4043]">
                            {result.neuroAfterTax.toFixed(2)}
                          </td>
                          <td className="p-2 text-[#3a4043]">
                            {result.okuAfterTax.toFixed(2)}
                          </td>
                          <td>
                            RM{result.annualCost.toFixed(2)} - tax savings
                            (After Tax)
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table>
                      <tbody>
                        <tr></tr>
                      </tbody>
                    </table>

                    <div className="mt-4 text-sm text-[#3a4043]">
                      <p>
                        <strong className="text-green-600 text-xl">
                          Annual Savings (Per OKU Hire):
                        </strong>{" "}
                        <span className="text-green-600 font-semibold text-xl">
                          RM{result.annualSavings.toFixed(2)}
                        </span>
                      </p>
                      <p className="mt-2 text-gray-600">
                        Hiring an OKU cardholder doesn't just promote inclusion
                        --it also reduces your effective headcount cost by
                        approximately{" "}
                        <strong>
                          {(
                            (result.annualSavings / result.neuroAfterTax) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        (thanks to the Double Tax Deduction incentive).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tabs (overview, jobs, etc.) remain unchanged */}
            {activeTab !== "tax-calculator" && (
              <div className="text-gray-500 text-center mt-10">
                {/* Placeholder for other content */}
                <p>Select a tab from the sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
