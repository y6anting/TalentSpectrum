"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { 
  Users, 
  Building, 
  Search, 
  BriefcaseIcon,
  Heart,
  Shield,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target
} from "lucide-react";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<"CANDIDATE" | "EMPLOYER" | null>(null);
  const [showMore, setShowMore] = useState<"CANDIDATE" | "EMPLOYER" | null>(null);

  const handleRoleSelect = (role: "CANDIDATE" | "EMPLOYER") => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Redirect to appropriate registration flow
      window.location.href = `/register?role=${selectedRole}`;
    }
  };

  const candidateFeatures = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Talent Discovery",
      description: "Take comprehensive assessments to discover your unique strengths and talents."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Accommodation Matching",
      description: "Find jobs that offer the specific workplace accommodations you need."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Mock Interviews",
      description: "Practice with our AI interviewer to build confidence in a safe environment."
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Neurodivergent-Friendly Jobs",
      description: "Browse opportunities from companies committed to neurodiversity."
    }
  ];

  const employerFeatures = [
    {
      icon: <Building className="h-5 w-5" />,
      title: "Inclusive Recruitment",
      description: "Access tools designed for neurodivergent-friendly hiring practices."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Diverse Talent Pool",
      description: "Connect with talented neurodivergent professionals and their unique perspectives."
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Accommodation Guidance",
      description: "Learn how to create supportive and accessible work environments."
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Inclusion Certification",
      description: "Build your reputation as a neurodivergent-friendly employer."
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#6b8a7a] mb-4">
            🌟 Welcome to Talent Spectrum
          </h1>
          <p className="text-xl text-[#3a4043] max-w-3xl mx-auto">
            Choose your role to get started on your journey toward inclusive employment and neurodivergent talent connection.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Candidate Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedRole === "CANDIDATE" 
                ? "ring-2 ring-[#6b8a7a] bg-[#6b8a7a]/5" 
                : "hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => handleRoleSelect("CANDIDATE")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#6b8a7a] rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-[#3a4043]">I'm a Job Seeker</CardTitle>
              <p className="text-[#6b8a7a] font-medium">Looking for neurodivergent-friendly opportunities</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Discover your unique talents and strengths</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Find jobs with workplace accommodations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Practice interviews in a safe environment</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Connect with inclusive employers</span>
                </div>
              </div>

              {selectedRole === "CANDIDATE" && (
                <div className="pt-4 border-t border-[#e8e6f0]">
                  <p className="text-sm text-[#3a4043] font-medium mb-3">What you'll get access to:</p>
                  <div className="grid gap-3">
                    {candidateFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="text-[#6b8a7a] mt-0.5">{feature.icon}</div>
                        <div>
                          <h4 className="font-medium text-[#3a4043] text-sm">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedRole === "EMPLOYER" 
                ? "ring-2 ring-[#6b8a7a] bg-[#6b8a7a]/5" 
                : "hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => handleRoleSelect("EMPLOYER")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#6b8a7a] rounded-full flex items-center justify-center">
                <Building className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-[#3a4043]">I'm an Employer</CardTitle>
              <p className="text-[#6b8a7a] font-medium">Looking to hire neurodivergent talent</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Access diverse and talented candidates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Learn inclusive hiring practices</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Build neurodivergent-friendly workplace</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6b8a7a] flex-shrink-0" />
                  <span className="text-[#3a4043]">Get inclusion certification</span>
                </div>
              </div>

              {selectedRole === "EMPLOYER" && (
                <div className="pt-4 border-t border-[#e8e6f0]">
                  <p className="text-sm text-[#3a4043] font-medium mb-3">What you'll get access to:</p>
                  <div className="grid gap-3">
                    {employerFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="text-[#6b8a7a] mt-0.5">{feature.icon}</div>
                        <div>
                          <h4 className="font-medium text-[#3a4043] text-sm">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        {selectedRole && (
          <div className="text-center">
            <Button 
              onClick={handleContinue}
              className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-8 py-3 text-lg"
              size="lg"
            >
              Continue as {selectedRole === "CANDIDATE" ? "Job Seeker" : "Employer"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              You can always change your role later in your profile settings
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-[#3a4043] mb-8">
            Why Choose Talent Spectrum?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-[#3a4043] mb-2">Accommodation-Focused</h3>
                <p className="text-sm text-gray-600">
                  Every job posting includes detailed accommodation information, ensuring transparency and comfort.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-[#3a4043] mb-2">Neurodivergent-Friendly</h3>
                <p className="text-sm text-gray-600">
                  Our platform is designed by and for the neurodivergent community, prioritizing accessibility and inclusion.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-[#3a4043] mb-2">Evidence-Based</h3>
                <p className="text-sm text-gray-600">
                  Our assessment tools and matching algorithms are based on psychological research and best practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Already have an account */}
        <div className="mt-12 text-center">
          <p className="text-[#3a4043] mb-4">Already have an account?</p>
          <Link 
            href="/login"
            className="text-[#6b8a7a] hover:text-[#5d7c6b] font-medium transition-colors"
          >
            Sign in to your existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
