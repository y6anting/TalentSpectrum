"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader } from "@/app/components/card";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import { Textarea } from "@/app/components/textarea";
import { Checkbox } from "@/app/components/checkbox";
import { Separator } from "@/app/components/separator";
import { ArrowLeft, Upload, Plus, X, FileText, User } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// TypeScript Interfaces
interface JobApplicationFormProps {
  setCurrentPage?: (page: string) => void;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Skill {
  id: string;
  name: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  citizenship: string;
  gender: string;
  race: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  isNeurodivergent: string;
  neurodivergentConditions: string[];
  hasOkuCard: string;
  okuNumber: string;
  neurodivergentStrengths: string[];
  communicationMedium: string;
  teamCollaborationStyle: string;
  checkInFrequency: string;
  presentationComfort: string;
  needsJobCoach: string;
  auditoryPreference: string;
  workspaceType: string;
  workdayStructure: string;
  preferredJobTitle: string;
  workType: string;
  workMode: string;
  coverLetter: string;
}

interface Job {
  title: string;
  company: string;
  location: string;
}

// Job data mapping
const jobData: Record<string, Job> = {
  "1": {
    title: "UX Designer",
    company: "Google",
    location: "Hybrid",
  },
  "2": {
    title: "Consultant",
    company: "PwC",
    location: "Remote",
  },
  "3": {
    title: "Developer",
    company: "Gamuda",
    location: "Remote",
  },
  "4": {
    title: "Data Analyst",
    company: "SLB",
    location: "Part-time",
  },
  "5": {
    title: "Frontend Developer",
    company: "NeuroTech",
    location: "Remote",
  },
  "6": {
    title: "Data Analyst",
    company: "InclusionWorks",
    location: "Singapore",
  },
  "7": {
    title: "UX Designer",
    company: "DesignForward",
    location: "Hybrid",
  },
  "8": {
    title: "Software Engineer",
    company: "TechInclusive",
    location: "Remote",
  },
};

// Sub-Components
const MethodSelection: React.FC<{
  setFillMethod: (method: "resume" | "manual") => void;
  backButtonRef: React.RefObject<HTMLDivElement | null>;
  selectionHeaderRef: React.RefObject<HTMLDivElement | null>;
  selectionCardsRef: React.RefObject<HTMLDivElement | null>;
  setCurrentPage: (page: string) => void;
  job: Job;
}> = ({ setFillMethod, backButtonRef, selectionHeaderRef, selectionCardsRef, setCurrentPage, job }) => (
  <div className="min-h-screen py-8 px-4">
    <div className="max-w-[1400px] mx-auto">
      <div ref={backButtonRef}>
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 text-[#3a4043] hover:text-[#635bff]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Details
        </Button>
      </div>
      <Card className="border-2 border-[#d8d4f0] bg-white rounded-2xl">
        <CardHeader ref={selectionHeaderRef} className="text-center pb-8">
          <h1 className="mb-4 text-[#3a4043]">Apply for {job.title}</h1>
          <div className="space-y-2 text-gray-600 mb-6">
            <p className="text-lg">{job.company}</p>
            <p>{job.location}</p>
          </div>
          <p className="text-gray-600">Choose how you'd like to fill out your application</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={selectionCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer border-2 border-[#d8d4f0] hover:border-[#635bff] transition-colors bg-white"
              onClick={() => setFillMethod("resume")}
            >
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-[#635bff]" />
                <h3 className="mb-2 text-[#3a4043]">Upload Resume</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your resume and we'll automatically fill in your details
                </p>
                <Button className="w-full bg-[#635bff] hover:bg-[#635bff]/90 text-white">
                  Upload & Auto-fill
                </Button>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer border-2 border-[#d8d4f0] hover:border-[#635bff] transition-colors bg-white"
              onClick={() => setFillMethod("manual")}
            >
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-[#635bff]" />
                <h3 className="mb-2 text-[#3a4043]">Fill Manually</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your information manually step by step
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
                >
                  Fill Manually
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ResumeUpload: React.FC<{
  resumeFile: File | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ resumeFile, handleFileUpload, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">
        Resume Upload <span className="text-red-500">*</span>
      </h2>
    </CardHeader>
    <CardContent>
      <div className="border-2 border-dashed border-[#d8d4f0] bg-gray-50 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <div className="space-y-2">
          <p className="text-[#3a4043]">Upload your resume</p>
          <p className="text-sm text-gray-600">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
            onClick={() => setClickedField("resumeUpload")}
          />
          <Button
            type="button"
            variant="outline"
            className={`border ${clickedField === "resumeUpload" ? "border-[0.5px] border-gray-300" : "border border-gray-300"} text-[#3a4043]`}
            onClick={() => document.getElementById("resume-upload")?.click()}
          >
            Choose File
          </Button>
          {resumeFile && (
            <div className="text-sm text-green-700 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="mb-2">✓ {resumeFile.name} uploaded successfully</p>
              <p className="text-xs text-green-600">
                Your information has been automatically filled in the form below. Please review and update as needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const PersonalInformation: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ formData, handleInputChange, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">Personal Information</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-[#3a4043]">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            onClick={() => setClickedField("firstName")}
            required
            className={`text-[#3a4043] ${clickedField === "firstName" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-[#3a4043]">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            onClick={() => setClickedField("lastName")}
            required
            className={`text-[#3a4043] ${clickedField === "lastName" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="dateOfBirth" className="text-[#3a4043]">
          Date of Birth <span className="text-red-500">*</span>
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          onClick={() => setClickedField("dateOfBirth")}
          required
          className={`text-[#3a4043] ${clickedField === "dateOfBirth" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
        />
      </div>
      <div>
        <Label htmlFor="citizenship" className="text-[#3a4043]">
          Citizenship Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.citizenship}
          onValueChange={(value) => handleInputChange("citizenship", value)}
        >
          <SelectTrigger
            className={`text-[#3a4043] ${clickedField === "citizenship" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
            onClick={() => setClickedField("citizenship")}
          >
            <SelectValue placeholder="Select citizenship status" />
          </SelectTrigger>
          <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
            <SelectItem value="citizen">Malaysian Citizen</SelectItem>
            <SelectItem value="permanent-resident">Permanent Resident</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="gender" className="text-[#3a4043]">Gender</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => handleInputChange("gender", value)}
        >
          <SelectTrigger
            className={`text-[#3a4043] ${clickedField === "gender" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
            onClick={() => setClickedField("gender")}
          >
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="prefer-not-to-say-gender">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="race" className="text-[#3a4043]">Race</Label>
        <Select
          value={formData.race}
          onValueChange={(value) => handleInputChange("race", value)}
        >
          <SelectTrigger
            className={`text-[#3a4043] ${clickedField === "race" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
            onClick={() => setClickedField("race")}
          >
            <SelectValue placeholder="Select race" />
          </SelectTrigger>
          <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
            <SelectItem value="malay">Malay</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
            <SelectItem value="indian">Indian</SelectItem>
            <SelectItem value="prefer-not-to-say-race">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const ContactAddress: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ formData, handleInputChange, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">Contact & Address (Malaysia)</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-[#3a4043]">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onClick={() => setClickedField("email")}
            required
            className={`text-[#3a4043] ${clickedField === "email" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-[#3a4043]">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            onClick={() => setClickedField("phone")}
            placeholder="+60"
            required
            className={`text-[#3a4043] ${clickedField === "phone" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address" className="text-[#3a4043]">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          onClick={() => setClickedField("address")}
          required
          className={`text-[#3a4043] ${clickedField === "address" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-[#3a4043]">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            onClick={() => setClickedField("city")}
            required
            className={`text-[#3a4043] ${clickedField === "city" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-[#3a4043]">
            State <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.state}
            onValueChange={(value) => handleInputChange("state", value)}
          >
            <SelectTrigger
              className={`text-[#3a4043] ${clickedField === "state" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
              onClick={() => setClickedField("state")}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
              {[
                "Johor",
                "Kedah",
                "Kelantan",
                "Melaka",
                "Negeri Sembilan",
                "Pahang",
                "Perak",
                "Perlis",
                "Pulau Pinang",
                "Sabah",
                "Sarawak",
                "Selangor",
                "Terengganu",
                "Kuala Lumpur",
                "Labuan",
                "Putrajaya",
              ].map((state) => (
                <SelectItem key={state} value={state.toLowerCase().replace(" ", "-")}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="postcode" className="text-[#3a4043]">
            Postcode <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postcode"
            value={formData.postcode}
            onChange={(e) => handleInputChange("postcode", e.target.value)}
            onClick={() => setClickedField("postcode")}
            required
            className={`text-[#3a4043] ${clickedField === "postcode" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const NeurodivergentInfo: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleNeurodivergentConditionChange: (condition: string, checked: boolean) => void;
  handleNeurodivergentStrengthChange: (strength: string, checked: boolean) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({
  formData,
  handleInputChange,
  handleNeurodivergentConditionChange,
  handleNeurodivergentStrengthChange,
  clickedField,
  setClickedField,
}) => (
  <Card className="form-section border-2 border-[#635bff]/20 bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">Neurodivergent Information</h2>
      <p className="text-sm text-gray-600">
        This information helps us provide appropriate workplace accommodations.
      </p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="isNeurodivergent" className="text-[#3a4043]">
          Are you a neurodivergent?
        </Label>
        <Select
          value={formData.isNeurodivergent}
          onValueChange={(value) => handleInputChange("isNeurodivergent", value)}
        >
          <SelectTrigger
            className={`text-[#3a4043] ${clickedField === "isNeurodivergent" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
            onClick={() => setClickedField("isNeurodivergent")}
          >
            <SelectValue placeholder="Select answer" />
          </SelectTrigger>
          <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.isNeurodivergent === "yes" && (
        <div>
          <Label className="text-[#3a4043]">
            What is your neurodivergent condition? (Select all that apply)
          </Label>
          <div className="space-y-2 mt-2">
            {["Autism", "ADHD", "Dyslexia", "Others"].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={condition.toLowerCase()}
                  checked={formData.neurodivergentConditions.includes(condition)}
                  onCheckedChange={(checked) =>
                    handleNeurodivergentConditionChange(condition, checked as boolean)
                  }
                  onClick={() => setClickedField(`condition-${condition.toLowerCase()}`)}
                  className={`${
                    clickedField === `condition-${condition.toLowerCase()}`
                      ? "border-[0.5px] border-gray-300"
                      : "border border-gray-300"
                  }`}
                />
                <Label htmlFor={condition.toLowerCase()} className="text-[#3a4043]">
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label htmlFor="hasOkuCard" className="text-[#3a4043]">
          Do you have an OKU card?
        </Label>
        <Select
          value={formData.hasOkuCard}
          onValueChange={(value) => handleInputChange("hasOkuCard", value)}
        >
          <SelectTrigger
            className={`text-[#3a4043] ${clickedField === "hasOkuCard" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
            onClick={() => setClickedField("hasOkuCard")}
          >
            <SelectValue placeholder="Select answer" />
          </SelectTrigger>
          <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.hasOkuCard === "yes" && (
        <div>
          <Label htmlFor="okuNumber" className="text-[#3a4043]">
            OKU Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="okuNumber"
            value={formData.okuNumber}
            onChange={(e) => handleInputChange("okuNumber", e.target.value)}
            onClick={() => setClickedField("okuNumber")}
            placeholder="Enter your OKU number"
            required={formData.hasOkuCard === "yes"}
            className={`text-[#3a4043] ${clickedField === "okuNumber" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
          />
        </div>
      )}
      {formData.isNeurodivergent === "yes" && (
        <>
          <Separator className="my-6" />
          <div>
            <Label className="text-[#3a4043]">
              What are your neurodivergent strengths? (Select all that apply)
            </Label>
            <p className="text-sm text-gray-600 mb-3">
              Help us understand your unique abilities and talents.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {[
                "Pattern Recognition",
                "Attention to Detail",
                "Systematic Thinking",
                "Big Picture Thinking",
                "Task Switching",
                "Creative/Innovative Thinking",
                "Hyperfocus",
              ].map((strength) => (
                <div key={strength} className="flex items-center space-x-2">
                  <Checkbox
                    id={strength.toLowerCase().replace(/[\/\s]/g, "-")}
                    checked={formData.neurodivergentStrengths.includes(strength)}
                    onCheckedChange={(checked) =>
                      handleNeurodivergentStrengthChange(strength, checked as boolean)
                    }
                    onClick={() => setClickedField(`strength-${strength.toLowerCase().replace(/[\/\s]/g, "-")}`)}
                    className={`${
                      clickedField === `strength-${strength.toLowerCase().replace(/[\/\s]/g, "-")}`
                        ? "border-[0.5px] border-gray-300"
                        : "border border-gray-300"
                    }`}
                  />
                  <Label
                    htmlFor={strength.toLowerCase().replace(/[\/\s]/g, "-")}
                    className="text-sm text-[#3a4043]"
                  >
                    {strength}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h3 className="font-medium mb-4 text-[#3a4043]">Communication Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="communicationMedium" className="text-[#3a4043]">
                  Preferred Communication Medium
                </Label>
                <Select
                  value={formData.communicationMedium}
                  onValueChange={(value) => handleInputChange("communicationMedium", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "communicationMedium" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("communicationMedium")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="text">Text/Written</SelectItem>
                    <SelectItem value="verbal">Verbal/Spoken</SelectItem>
                    <SelectItem value="mixed">Mix of Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamCollaborationStyle" className="text-[#3a4043]">
                  Team Collaboration Style
                </Label>
                <Select
                  value={formData.teamCollaborationStyle}
                  onValueChange={(value) => handleInputChange("teamCollaborationStyle", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "teamCollaborationStyle" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("teamCollaborationStyle")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="independent">Work Independently</SelectItem>
                    <SelectItem value="small-group">Small Group (2-4 people)</SelectItem>
                    <SelectItem value="large-team">Large Team (5+ people)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="checkInFrequency" className="text-[#3a4043]">
                  Check-in Frequency
                </Label>
                <Select
                  value={formData.checkInFrequency}
                  onValueChange={(value) => handleInputChange("checkInFrequency", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "checkInFrequency" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("checkInFrequency")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="frequent">Frequent Check-ins</SelectItem>
                    <SelectItem value="scheduled">Scheduled Check-ins</SelectItem>
                    <SelectItem value="autonomous">Given Task & Left to Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="presentationComfort" className="text-[#3a4043]">
                  Presentation Comfort Level
                </Label>
                <Select
                  value={formData.presentationComfort}
                  onValueChange={(value) => handleInputChange("presentationComfort", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "presentationComfort" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("presentationComfort")}
                  >
                    <SelectValue placeholder="Select comfort level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="not-comfortable">Not Comfortable</SelectItem>
                    <SelectItem value="willing-to-try">Willing to Try</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="needsJobCoach" className="text-[#3a4043]">
                  Job Coach Support
                </Label>
                <Select
                  value={formData.needsJobCoach}
                  onValueChange={(value) => handleInputChange("needsJobCoach", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "needsJobCoach" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("needsJobCoach")}
                  >
                    <SelectValue placeholder="Select need" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="need">Need Job Coach</SelectItem>
                    <SelectItem value="no-need">No Need for Job Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h3 className="font-medium mb-4 text-[#3a4043]">Environmental & Sensory Needs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auditoryPreference" className="text-[#3a4043]">
                  Auditory Environment Preference
                </Label>
                <Select
                  value={formData.auditoryPreference}
                  onValueChange={(value) => handleInputChange("auditoryPreference", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "auditoryPreference" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("auditoryPreference")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="quiet">Quiet Environment</SelectItem>
                    <SelectItem value="background-noise">Background Noise Okay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workspaceType" className="text-[#3a4043]">
                  Workspace Type Preference
                </Label>
                <Select
                  value={formData.workspaceType}
                  onValueChange={(value) => handleInputChange("workspaceType", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "workspaceType" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("workspaceType")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="fixed-desk">Fixed Desk/Table</SelectItem>
                    <SelectItem value="hot-desk">Hot Desk (Flexible Seating)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workdayStructure" className="text-[#3a4043]">
                  Workday Structure Preference
                </Label>
                <Select
                  value={formData.workdayStructure}
                  onValueChange={(value) => handleInputChange("workdayStructure", value)}
                >
                  <SelectTrigger
                    className={`text-[#3a4043] ${clickedField === "workdayStructure" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
                    onClick={() => setClickedField("workdayStructure")}
                  >
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="fixed-hours">Fixed Work Hours</SelectItem>
                    <SelectItem value="flexible-hours">Flexible Work Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

const JobPreferences: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ formData, handleInputChange, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">Job Preferences</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="preferredJobTitle" className="text-[#3a4043]">
          Preferred Job Title
        </Label>
        <Input
          id="preferredJobTitle"
          value={formData.preferredJobTitle}
          onChange={(e) => handleInputChange("preferredJobTitle", e.target.value)}
          onClick={() => setClickedField("preferredJobTitle")}
          placeholder="e.g., Software Developer"
          className={`text-[#3a4043] ${clickedField === "preferredJobTitle" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workType" className="text-[#3a4043]">Work Type</Label>
          <Select
            value={formData.workType}
            onValueChange={(value) => handleInputChange("workType", value)}
          >
            <SelectTrigger
              className={`text-[#3a4043] ${clickedField === "workType" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
              onClick={() => setClickedField("workType")}
            >
              <SelectValue placeholder="Select work type" />
            </SelectTrigger>
            <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="workMode" className="text-[#3a4043]">Work Mode</Label>
          <Select
            value={formData.workMode}
            onValueChange={(value) => handleInputChange("workMode", value)}
          >
            <SelectTrigger
              className={`text-[#3a4043] ${clickedField === "workMode" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
              onClick={() => setClickedField("workMode")}
            >
              <SelectValue placeholder="Select work mode" />
            </SelectTrigger>
            <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
              <SelectItem value="in-person">In-person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WorkExperience: React.FC<{
  experiences: Experience[];
  addExperience: () => void;
  updateExperience: (id: string, field: string, value: string) => void;
  removeExperience: (id: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ experiences, addExperience, updateExperience, removeExperience, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <h2 className="text-[#3a4043]">Work Experience</h2>
        <Button
          type="button"
          onClick={addExperience}
          variant="outline"
          size="sm"
          className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {experiences.length === 0 ? (
        <p className="text-gray-600 text-center py-4">
          No work experience added yet. Click "Add Experience" to get started.
        </p>
      ) : (
        experiences.map((experience) => (
          <div
            key={experience.id}
            data-experience-id={experience.id}
            className="border-2 border-[#d8d4f0] bg-gray-50 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-[#3a4043]">Experience Entry</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(experience.id)}
                className="text-[#3a4043] hover:text-[#635bff]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-[#3a4043]">Job Title</Label>
                <Input
                  value={experience.title}
                  onChange={(e) => updateExperience(experience.id, "title", e.target.value)}
                  onClick={() => setClickedField(`experience-title-${experience.id}`)}
                  placeholder="e.g., Software Developer"
                  className={`text-[#3a4043] ${
                    clickedField === `experience-title-${experience.id}`
                      ? "border-[0.5px] border-gray-300"
                      : "border border-gray-300"
                  }`}
                />
              </div>
              <div>
                <Label className="text-[#3a4043]">Company</Label>
                <Input
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                  onClick={() => setClickedField(`experience-company-${experience.id}`)}
                  placeholder="e.g., TechCorp"
                  className={`text-[#3a4043] ${
                    clickedField === `experience-company-${experience.id}`
                      ? "border-[0.5px] border-gray-300"
                      : "border border-gray-300"
                  }`}
                />
              </div>
            </div>
            <div>
              <Label className="text-[#3a4043]">Duration</Label>
              <Input
                value={experience.duration}
                onChange={(e) => updateExperience(experience.id, "duration", e.target.value)}
                onClick={() => setClickedField(`experience-duration-${experience.id}`)}
                placeholder="e.g., Jan 2020 - Dec 2022"
                className={`text-[#3a4043] ${
                  clickedField === `experience-duration-${experience.id}`
                    ? "border-[0.5px] border-gray-300"
                    : "border border-gray-300"
                }`}
              />
            </div>
            <div>
              <Label className="text-[#3a4043]">Description</Label>
              <Textarea
                value={experience.description}
                onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                onClick={() => setClickedField(`experience-description-${experience.id}`)}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
                className={`text-[#3a4043] ${
                  clickedField === `experience-description-${experience.id}`
                    ? "border-[0.5px] border-gray-300"
                    : "border border-gray-300"
                }`}
              />
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

const EducationSection: React.FC<{
  education: Education[];
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ education, addEducation, updateEducation, removeEducation, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <h2 className="text-[#3a4043]">Education</h2>
        <Button
          type="button"
          onClick={addEducation}
          variant="outline"
          size="sm"
          className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {education.length === 0 ? (
        <p className="text-gray-600 text-center py-4">
          No education added yet. Click "Add Education" to get started.
        </p>
      ) : (
        education.map((edu) => (
          <div
            key={edu.id}
            data-education-id={edu.id}
            className="border-2 border-[#d8d4f0] bg-gray-50 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-[#3a4043]">Education Entry</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="text-[#3a4043] hover:text-[#635bff]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-[#3a4043]">Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  onClick={() => setClickedField(`education-institution-${edu.id}`)}
                  placeholder="e.g., University of Malaya"
                  className={`text-[#3a4043] ${
                    clickedField === `education-institution-${edu.id}`
                      ? "border-[0.5px] border-gray-300"
                      : "border border-gray-300"
                  }`}
                />
              </div>
              <div>
                <Label className="text-[#3a4043]">Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  onClick={() => setClickedField(`education-degree-${edu.id}`)}
                  placeholder="e.g., Bachelor of Computer Science"
                  className={`text-[#3a4043] ${
                    clickedField === `education-degree-${edu.id}`
                      ? "border-[0.5px] border-gray-300"
                      : "border border-gray-300"
                  }`}
                />
              </div>
            </div>
            <div>
              <Label className="text-[#3a4043]">Year</Label>
              <Input
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                onClick={() => setClickedField(`education-year-${edu.id}`)}
                placeholder="e.g., 2020"
                className={`text-[#3a4043] ${
                  clickedField === `education-year-${edu.id}`
                    ? "border-[0.5px] border-gray-300"
                    : "border border-gray-300"
                }`}
              />
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

const SkillsSection: React.FC<{
  skills: Skill[];
  addSkill: () => void;
  updateSkill: (id: string, value: string) => void;
  removeSkill: (id: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ skills, addSkill, updateSkill, removeSkill, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <div className="flex items-center justify-between">
        <h2 className="text-[#3a4043]">Skills</h2>
        <Button
          type="button"
          onClick={addSkill}
          variant="outline"
          size="sm"
          className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {skills.length === 0 ? (
        <p className="text-gray-600 text-center py-4">
          No skills added yet. Click "Add Skill" to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((skill) => (
            <div key={skill.id} className="flex gap-2">
              <Input
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, e.target.value)}
                onClick={() => setClickedField(`skill-${skill.id}`)}
                placeholder="e.g., JavaScript, React, etc."
                className={`flex-1 text-[#3a4043] ${
                  clickedField === `skill-${skill.id}`
                    ? "border-[0.5px] border-gray-300"
                    : "border border-gray-300"
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(skill.id)}
                className="text-[#3a4043] hover:text-[#635bff]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const CoverLetter: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}> = ({ formData, handleInputChange, clickedField, setClickedField }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardHeader>
      <h2 className="text-[#3a4043]">Cover Letter (Optional)</h2>
    </CardHeader>
    <CardContent>
      <Textarea
        value={formData.coverLetter}
        onChange={(e) => handleInputChange("coverLetter", e.target.value)}
        onClick={() => setClickedField("coverLetter")}
        placeholder="Tell us why you're interested in this position and what makes you a great fit..."
        rows={6}
        className={`text-[#3a4043] ${clickedField === "coverLetter" ? "border-[0.5px] border-gray-300" : "border border-gray-300"}`}
      />
    </CardContent>
  </Card>
);

const SubmitSection: React.FC<{
  setCurrentPage?: (page: string) => void;
}> = ({ setCurrentPage }) => (
  <Card className="form-section border-2 border-[#d8d4f0] bg-white rounded-2xl">
    <CardContent className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
          onClick={() => setCurrentPage ? setCurrentPage("job-details") : window.history.back()}
        >
          Save as Draft
        </Button>
        <Button type="submit" size="lg" className="bg-[#635bff] hover:bg-[#635bff]/90 text-white">
          Submit Application
        </Button>
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">
        By submitting this application, you acknowledge that the information provided is accurate and complete.
      </p>
    </CardContent>
  </Card>
);

// Main Component
export default function JobApplicationForm({ setCurrentPage }: JobApplicationFormProps) {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '1';
  const job = jobData[jobId] || jobData['1'];
  const [fillMethod, setFillMethod] = useState<"resume" | "manual" | null>(null);
  const [clickedField, setClickedField] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    citizenship: "",
    gender: "",
    race: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    isNeurodivergent: "",
    neurodivergentConditions: [],
    hasOkuCard: "",
    okuNumber: "",
    neurodivergentStrengths: [],
    communicationMedium: "",
    teamCollaborationStyle: "",
    checkInFrequency: "",
    presentationComfort: "",
    needsJobCoach: "",
    auditoryPreference: "",
    workspaceType: "",
    workdayStructure: "",
    preferredJobTitle: "",
    workType: "",
    workMode: "",
    coverLetter: "",
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Animation refs
  const backButtonRef = useRef<HTMLDivElement | null>(null);
  const selectionHeaderRef = useRef<HTMLDivElement | null>(null);
  const selectionCardsRef = useRef<HTMLDivElement | null>(null);
  const formHeaderRef = useRef<HTMLDivElement | null>(null);
  const formSectionsRef = useRef<HTMLDivElement | null>(null);

  // Handlers
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNeurodivergentConditionChange = (condition: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      neurodivergentConditions: checked
        ? [...prev.neurodivergentConditions, condition]
        : prev.neurodivergentConditions.filter((c) => c !== condition),
    }));
  };

  const handleNeurodivergentStrengthChange = (strength: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      neurodivergentStrengths: checked
        ? [...prev.neurodivergentStrengths, strength]
        : prev.neurodivergentStrengths.filter((s) => s !== strength),
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      duration: "",
      description: "",
    };
    setExperiences((prev) => [...prev, newExperience]);
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      year: "",
    };
    setEducation((prev) => [...prev, newEducation]);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setEducation((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: string) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const updateSkill = (id: string, value: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, name: value } : skill))
    );
  };

  const removeSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setFormData((prev) => ({
        ...prev,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+60123456789",
        preferredJobTitle: "Software Developer",
      }));
      setExperiences([
        {
          id: "1",
          title: "Software Developer",
          company: "TechCorp Malaysia",
          duration: "2020 - Present",
          description: "Developed web applications using React and Node.js",
        },
      ]);
      setEducation([
        {
          id: "1",
          institution: "University of Malaya",
          degree: "Bachelor of Computer Science",
          year: "2019",
        },
      ]);
      setSkills([
        { id: "1", name: "JavaScript" },
        { id: "2", name: "React" },
        { id: "3", name: "Node.js" },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Application submitted:", { formData, experiences, education, skills, resumeFile, jobId });
    alert("Application submitted successfully!");
    if (setCurrentPage) {
      setCurrentPage("job-details");
    } else {
      window.history.back();
    }
  };

  // Animations
  useEffect(() => {
    if (fillMethod !== null) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (backButtonRef.current) {
        gsap.from(backButtonRef.current, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (selectionHeaderRef.current) {
        gsap.from(selectionHeaderRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
        });
      }
      if (selectionCardsRef.current) {
        gsap.from(selectionCardsRef.current.children, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.15,
          delay: 0.4,
          ease: "power2.out",
        });
      }
    });

    return () => ctx.revert();
  }, [fillMethod]);

  useEffect(() => {
    if (fillMethod === null) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (backButtonRef.current) {
        gsap.from(backButtonRef.current, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (formHeaderRef.current) {
        gsap.from(formHeaderRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
        });
      }
      if (formSectionsRef.current) {
        const sections = formSectionsRef.current.querySelectorAll(".form-section");
        sections.forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });
      }
    });

    return () => ctx.revert();
  }, [fillMethod]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || experiences.length === 0) return;

    const lastExperience = document.querySelector(
      `[data-experience-id="${experiences[experiences.length - 1].id}"]`
    );
    if (lastExperience) {
      gsap.from(lastExperience, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.4,
        ease: "back.out(1.2)",
      });
    }
  }, [experiences]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || education.length === 0) return;

    const lastEducation = document.querySelector(
      `[data-education-id="${education[education.length - 1].id}"]`
    );
    if (lastEducation) {
      gsap.from(lastEducation, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.4,
        ease: "back.out(1.2)",
      });
    }
  }, [education]);

  if (fillMethod === null) {
    return (
      <MethodSelection
        setFillMethod={setFillMethod}
        backButtonRef={backButtonRef}
        selectionHeaderRef={selectionHeaderRef}
        selectionCardsRef={selectionCardsRef}
        setCurrentPage={setCurrentPage || (() => {})}
        job={job}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto">
        <div ref={backButtonRef}>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage ? setCurrentPage("job-details") : window.history.back()}
            className="mb-6 text-[#3a4043] hover:text-[#635bff]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card ref={formHeaderRef} className="border-2 border-[#d8d4f0] bg-white rounded-2xl">
            <CardHeader className="pb-6">
              <div className="space-y-4">
                <h1 className="text-[#3a4043]">Job Application</h1>
                <div className="bg-gray-100 border border-[#d8d4f0] rounded-lg p-4">
                  <h2 className="text-lg mb-2 text-[#3a4043]">{job.title}</h2>
                  <div className="text-gray-600 space-y-1">
                    <p>{job.company}</p>
                    <p>{job.location}</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Please fill out this form completely. All fields marked with{" "}
                  <span className="text-red-500">*</span> are required.
                </p>
              </div>
            </CardHeader>
          </Card>
          <div ref={formSectionsRef} className="space-y-8">
            {fillMethod === "resume" && (
              <ResumeUpload
                resumeFile={resumeFile}
                handleFileUpload={handleFileUpload}
                clickedField={clickedField}
                setClickedField={setClickedField}
              />
            )}
            <PersonalInformation
              formData={formData}
              handleInputChange={handleInputChange}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <ContactAddress
              formData={formData}
              handleInputChange={handleInputChange}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <NeurodivergentInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleNeurodivergentConditionChange={handleNeurodivergentConditionChange}
              handleNeurodivergentStrengthChange={handleNeurodivergentStrengthChange}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <JobPreferences
              formData={formData}
              handleInputChange={handleInputChange}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <WorkExperience
              experiences={experiences}
              addExperience={addExperience}
              updateExperience={updateExperience}
              removeExperience={removeExperience}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <EducationSection
              education={education}
              addEducation={addEducation}
              updateEducation={updateEducation}
              removeEducation={removeEducation}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <SkillsSection
              skills={skills}
              addSkill={addSkill}
              updateSkill={updateSkill}
              removeSkill={removeSkill}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <CoverLetter
              formData={formData}
              handleInputChange={handleInputChange}
              clickedField={clickedField}
              setClickedField={setClickedField}
            />
            <SubmitSection setCurrentPage={setCurrentPage || undefined} />
          </div>
        </form>
      </div>
    </div>
  );
}