"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Upload, FileText, Shield, Heart, AlertCircle } from "lucide-react";

interface JobApplicationPageProps {
  params: {
    id: string;
  };
}

export default function JobApplicationPage({ params }: JobApplicationPageProps) {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
    },
    workPreferences: {
      preferredCommunication: "email",
      workingHours: "flexible",
      workLocation: "remote",
    },
    accommodations: {
      needsAccommodations: false,
      accommodationDetails: "",
      specificNeeds: [] as string[],
    },
    application: {
      coverLetter: "",
      portfolio: "",
      availability: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<{[key: string]: File | null}>({
    resume: null,
    portfolio: null,
  });

  const accommodationOptions = [
    "Flexible working hours",
    "Quiet workspace",
    "Written instructions preferred",
    "Regular check-ins with manager",
    "Extended time for tasks",
    "Noise-cancelling headphones",
    "Adjustable lighting",
    "Frequent breaks",
    "Visual schedules/reminders",
    "Alternative communication methods",
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleAccommodationToggle = (accommodation: string) => {
    const current = formData.accommodations.specificNeeds;
    const updated = current.includes(accommodation)
      ? current.filter(item => item !== accommodation)
      : [...current, accommodation];
    
    handleInputChange('accommodations', 'specificNeeds', updated);
  };

  const handleFileUpload = (type: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Application submitted:", formData, files);
    alert("Application submitted successfully! We'll be in touch soon.");
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-[#6b8a7a] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-[#6b8a7a]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Work Preferences</span>
            <span>Accommodations</span>
            <span>Application</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3a4043] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a4043] mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3a4043] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3a4043] mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.location}
                      onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-2">
                    Resume/CV *
                  </label>
                  <div className="border-2 border-dashed border-[#e8e6f0] rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drop your resume here or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('resume', e.target.files?.[0] || null)}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Button type="button" variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                    {files.resume && (
                      <p className="text-sm text-[#6b8a7a] mt-2">
                        Selected: {files.resume.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Work Preferences */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Work Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-3">
                    Preferred Communication Method
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'video', label: 'Video calls' },
                      { value: 'chat', label: 'Instant messaging' },
                      { value: 'written', label: 'Written instructions only' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="communication"
                          value={option.value}
                          checked={formData.workPreferences.preferredCommunication === option.value}
                          onChange={(e) => handleInputChange('workPreferences', 'preferredCommunication', e.target.value)}
                          className="text-[#6b8a7a] focus:ring-[#6b8a7a]"
                        />
                        <span className="text-[#3a4043]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-3">
                    Working Hours Preference
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'standard', label: '9 AM - 5 PM (Standard hours)' },
                      { value: 'flexible', label: 'Flexible hours' },
                      { value: 'early', label: 'Early start (7 AM - 3 PM)' },
                      { value: 'late', label: 'Late start (11 AM - 7 PM)' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="workingHours"
                          value={option.value}
                          checked={formData.workPreferences.workingHours === option.value}
                          onChange={(e) => handleInputChange('workPreferences', 'workingHours', e.target.value)}
                          className="text-[#6b8a7a] focus:ring-[#6b8a7a]"
                        />
                        <span className="text-[#3a4043]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-3">
                    Work Location Preference
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'remote', label: 'Fully remote' },
                      { value: 'hybrid', label: 'Hybrid (2-3 days in office)' },
                      { value: 'office', label: 'In-office' },
                      { value: 'flexible', label: 'Flexible arrangement' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="workLocation"
                          value={option.value}
                          checked={formData.workPreferences.workLocation === option.value}
                          onChange={(e) => handleInputChange('workPreferences', 'workLocation', e.target.value)}
                          className="text-[#6b8a7a] focus:ring-[#6b8a7a]"
                        />
                        <span className="text-[#3a4043]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Accommodations */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Workplace Accommodations
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  We're committed to providing accommodations that help you do your best work. This information is confidential and will only be shared with relevant team members.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        Your privacy is protected
                      </p>
                      <p className="text-sm text-purple-700">
                        Accommodation requests are handled confidentially and in compliance with privacy laws.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.accommodations.needsAccommodations}
                      onChange={(e) => handleInputChange('accommodations', 'needsAccommodations', e.target.checked)}
                      className="text-[#6b8a7a] focus:ring-[#6b8a7a]"
                    />
                    <span className="text-[#3a4043] font-medium">
                      I would like to request workplace accommodations
                    </span>
                  </label>

                  {formData.accommodations.needsAccommodations && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#3a4043] mb-3">
                          Select accommodations that would help you succeed:
                        </p>
                        <div className="grid md:grid-cols-2 gap-2">
                          {accommodationOptions.map((accommodation) => (
                            <label key={accommodation} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.accommodations.specificNeeds.includes(accommodation)}
                                onChange={() => handleAccommodationToggle(accommodation)}
                                className="text-[#6b8a7a] focus:ring-[#6b8a7a]"
                              />
                              <span className="text-sm text-[#3a4043]">{accommodation}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#3a4043] mb-2">
                          Additional accommodation details (optional)
                        </label>
                        <textarea
                          value={formData.accommodations.accommodationDetails}
                          onChange={(e) => handleInputChange('accommodations', 'accommodationDetails', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                          placeholder="Please describe any specific accommodations or support you need..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Application Details */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={formData.application.coverLetter}
                    onChange={(e) => handleInputChange('application', 'coverLetter', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    placeholder="Tell us why you're interested in this role and how your experience aligns with our requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-2">
                    Portfolio/Work Samples (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.application.portfolio}
                    onChange={(e) => handleInputChange('application', 'portfolio', e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3a4043] mb-2">
                    Availability
                  </label>
                  <input
                    type="text"
                    value={formData.application.availability}
                    onChange={(e) => handleInputChange('application', 'availability', e.target.value)}
                    className="w-full px-4 py-3 border border-[#e8e6f0] rounded-lg focus:ring-2 focus:ring-[#6b8a7a] focus:border-[#6b8a7a] outline-none transition-all"
                    placeholder="e.g., Immediately, 2 weeks notice, etc."
                  />
                </div>

                {/* Summary */}
                <div className="bg-[#faf9f7] border border-[#e8e6f0] rounded-lg p-4">
                  <h4 className="font-medium text-[#3a4043] mb-2">Application Summary</h4>
                  <div className="space-y-1 text-sm text-[#3a4043]">
                    <p>Name: {formData.personalInfo.firstName} {formData.personalInfo.lastName}</p>
                    <p>Email: {formData.personalInfo.email}</p>
                    <p>Communication: {formData.workPreferences.preferredCommunication}</p>
                    <p>Accommodations requested: {formData.accommodations.needsAccommodations ? 'Yes' : 'No'}</p>
                    {files.resume && <p>Resume: {files.resume.name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#6b8a7a] hover:bg-[#5d7c6b]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-[#6b8a7a] hover:bg-[#5d7c6b]"
              >
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
