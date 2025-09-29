"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Badge } from "@/app/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { MapPin, Clock, DollarSign, Heart, Home, Shield, Building, Users, CheckCircle } from "lucide-react";

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Mock job data - in real app, fetch based on params.id
  const job = {
    id: params.id,
    title: "Frontend Developer",
    company: "NeuroTech",
    location: "Remote",
    type: "Full-time",
    salary: "$70k - $90k",
    isRemote: true,
    isFlexible: true,
    hasAccommodations: true,
    isInclusive: true,
    description: "We are looking for a frontend developer with strong React and Tailwind skills to join our inclusive team.",
    posted: "2 days ago",
    fullDescription: `We're seeking a passionate Frontend Developer to join our neurodivergent-friendly team. You'll work on building accessible, inclusive web applications that make a real difference in people's lives.

What you'll do:
• Develop responsive web applications using React and TypeScript
• Collaborate with our diverse team in a supportive environment
• Implement accessibility features and inclusive design patterns
• Work with modern tools like Tailwind CSS, Next.js, and Figma
• Participate in code reviews and knowledge sharing sessions

What we offer:
• Flexible working hours and remote-first culture
• Comprehensive workplace accommodations
• Mental health support and neurodivergent-friendly policies
• Professional development opportunities
• Inclusive team environment that celebrates diversity`,
    requirements: [
      "2+ years experience with React",
      "Strong TypeScript skills",
      "Experience with Tailwind CSS",
      "Understanding of accessibility principles",
      "Excellent communication skills"
    ],
    benefits: [
      "Flexible working hours",
      "Remote work options",
      "Workplace accommodations",
      "Mental health support",
      "Professional development budget",
      "Inclusive team culture"
    ],
    accommodationsAvailable: [
      "Flexible start/finish times",
      "Quiet workspace options",
      "Written communication preferences",
      "Regular check-ins with manager",
      "Sensory-friendly office environment",
      "Extended time for tasks when needed"
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-lg font-semibold text-[#6b8a7a]">
                      <DollarSign className="h-5 w-5" />
                      {job.salary}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Posted {job.posted}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.isRemote && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Home className="h-3 w-3 mr-1" />
                      Remote
                    </Badge>
                  )}
                  {job.isFlexible && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Flexible Hours
                    </Badge>
                  )}
                  {job.hasAccommodations && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Accommodations Available
                    </Badge>
                  )}
                  {job.isInclusive && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <Heart className="h-3 w-3 mr-1" />
                      Neurodivergent Friendly
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {job.fullDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-[#3a4043] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>What we're looking for</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#6b8a7a] mt-0.5 flex-shrink-0" />
                      <span className="text-[#3a4043]">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Accommodations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Workplace Accommodations Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.accommodationsAvailable.map((accommodation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[#3a4043] text-sm">{accommodation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to apply?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-[#6b8a7a] hover:bg-[#5d7c6b]"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply for this role
                </Button>
                <Button variant="outline" className="w-full">
                  Save for later
                </Button>
                <Button variant="ghost" className="w-full">
                  Share this job
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-[#6b8a7a] mt-0.5 flex-shrink-0" />
                      <span className="text-[#3a4043] text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">50-100 employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Technology</span>
                  </div>
                  <p className="text-sm text-[#3a4043] leading-relaxed">
                    NeuroTech is committed to creating an inclusive workplace where neurodivergent individuals can thrive and contribute their unique perspectives to innovative technology solutions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal would go here */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Apply for {job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#3a4043] mb-4">
                Application form will be implemented here with accommodation requests and neurodivergent-friendly features.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApplicationForm(false)}
                >
                  Cancel
                </Button>
                <Link href={`/jobs/${job.id}/apply`}>
                  <Button className="bg-[#6b8a7a] hover:bg-[#5d7c6b]">
                    Continue to Application
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
