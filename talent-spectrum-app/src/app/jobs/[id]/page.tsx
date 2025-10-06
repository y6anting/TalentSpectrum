"use client";

import React, { useState, use } from "react";
import { Button } from "@/app/components/button";
import { Separator } from "@/app/components/separator";
import { Badge } from "@/app/components/badge";
import { Card, CardContent, CardHeader } from "@/app/components/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Home,
  Shield,
  Building,
  CheckCircle,
} from "lucide-react";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
  setCurrentPage: (page: string) => void;
}

export default function JobDetailsPage({ params, setCurrentPage }: JobDetailsPageProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { id } = use(params);

  // Mock job data - in real app, fetch based on params.id
  const job = {
    id,
    title: "Frontend Developer",
    company: "NeuroTech",
    location: "Remote",
    type: "Full-time",
    salary: "$70k - $90k",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description:
      "We are looking for a frontend developer with strong React and Tailwind skills to join our inclusive team.",
    posted: "2 days ago",
    requirements: [
      "2+ years experience with React",
      "Strong TypeScript skills",
      "Experience with Tailwind CSS",
      "Understanding of accessibility principles",
      "Excellent communication skills",
    ],
    benefits: [
      "Flexible working hours",
      "Remote work options",
      "Workplace accommodations",
      "Mental health support",
      "Professional development budget",
      "Inclusive team culture",
    ],
    accommodationsAvailable: [
      "Flexible start/finish times",
      "Quiet workspace options",
      "Written communication preferences",
      "Regular check-ins with manager",
      "Sensory-friendly office environment",
      "Extended time for tasks when needed",
    ],
    companyInfo: {
      size: "200-500 employees",
      industry: "Technology",
      founded: "2016",
      inclusivityScore: "A+",
    },
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentPage("jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card className="mb-8 shadow-md">
          <CardHeader className="pb-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <Building className="h-5 w-5 text-[#635bff]" />
                  <span className="text-lg font-medium">{job.company}</span>
                </div>

                <div className="flex flex-wrap gap-6 text-gray-600 mb-4">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#635bff]" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#635bff]" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#635bff]" />
                    {job.salary}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {job.isRemote && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Home className="h-3 w-3 mr-1" />
                      Remote Friendly
                    </Badge>
                  )}
                  {job.isFlexible && (
                    <Badge className="bg-green-100 text-green-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Flexible Hours
                    </Badge>
                  )}
                  {job.hasAccommodations && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Accommodations
                    </Badge>
                  )}
                  {job.isInclusive && (
                    <Badge className="bg-pink-100 text-pink-800">
                      <Heart className="h-3 w-3 mr-1" />
                      Inclusive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="lg:text-right">
                <Button
                  size="lg"
                  className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all duration-200 hover:cursor-pointer"
                  onClick={() => (window.location.href = `/jobs/${job.id}/job-application`)}
                >
                  Apply Now
                </Button>
                <p className="mt-2 text-sm text-gray-500">Posted {job.posted}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About This Role</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">What We're Looking For</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Accommodations */}
            <Card className="border-2 border-[#635bff]/30 bg-blue-50">
              <CardHeader>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#635bff]">
                  <Shield className="h-5 w-5" />
                  Workplace Accommodations
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.accommodationsAvailable.map((acc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#635bff] mt-1" />
                      <span className="text-gray-700 text-sm">{acc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">
                  About {job.company}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Company Size</span>
                  <span>{job.companyInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span>{job.companyInfo.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Founded</span>
                  <span>{job.companyInfo.founded}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Inclusivity Score</span>
                  <Badge className="bg-green-100 text-green-800">
                    {job.companyInfo.inclusivityScore}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Benefits & Perks</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-2 border-[#635bff]/30 bg-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Ready to Apply?</h3>
                <Button
                  size="lg"
                  className="w-full mb-3"
                  onClick={() => (window.location.href = `/jobs/${job.id}/apply`)}
                >
                  Apply Now
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Save for Later
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Application typically takes 5–10 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
