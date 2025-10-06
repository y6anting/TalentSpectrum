"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Textarea } from "@/app/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import { Checkbox } from "@/app/components/checkbox";
import { Badge } from "@/app/components/badge";
import { Separator } from "@/app/components/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Shield,
  Heart,
  Plus,
  X,
  ClipboardList,
  Briefcase,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";

export default function PostJob() {
  const router = useRouter();
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
  ];
  const locations = ["Remote", "On-site", "Hybrid"];
  const experienceLevels = [
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive",
    "Non-Executive",
  ];
  const availableAccommodations = [
    "Flexible work hours",
    "Remote work options",
    "Quiet workspace",
    "Noise-cancelling headphones",
    "Written instructions",
    "Extended deadlines",
    "Regular check-ins",
    "Sensory-friendly environment",
    "Break schedule flexibility",
    "Communication preferences support",
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const toggleAccommodation = (accommodation: string) => {
    accommodations.includes(accommodation)
      ? setAccommodations(accommodations.filter((acc) => acc !== accommodation))
      : setAccommodations([...accommodations, accommodation]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Job posted successfully");
    router.push("/employer-dashboard");
  };

  const [coreTasks, setCoreTasks] = useState([
    { task: "", level: "" },
    { task: "", level: "" },
    { task: "", level: "" },
  ]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [problemSolving, setProblemSolving] = useState("");
  const [paceOfWork, setPaceOfWork] = useState("");
  const [repetitiveTasks, setRepetitiveTasks] = useState("");

  const [physicalEnv, setPhysicalEnv] = useState("");
  const [noiseLevel, setNoiseLevel] = useState("");
  const [lighting, setLighting] = useState("");
  const [workArrangement, setWorkArrangement] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [teamStructure, setTeamStructure] = useState("");
  const [socialEvents, setSocialEvents] = useState("");
  const [transport, setTransport] = useState("");

  const [managementStyle, setManagementStyle] = useState("");
  const [commMedium, setCommMedium] = useState("");
  const [meetingStructure, setMeetingStructure] = useState("");
  const [feedbackStyle, setFeedbackStyle] = useState("");

  const [neurodiversityTraining, setNeurodiversityTraining] = useState("");
  const [onboardingProcess, setOnboardingProcess] = useState("");
  const [cultureStatement, setCultureStatement] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/employer-dashboard")}
            className="mb-4 text-[#3a4043] hover:text-[#635bff]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-black mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600">
            Create an inclusive job posting that attracts neurodivergent talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Information */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
            onClick={() => setClickedCard("job-info")}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Software Engineer"
                    required
                    className="border border-gray-300 text-black"
                  />
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">Department</label>
                  <Input
                    placeholder="e.g. Engineering"
                    className="border border-gray-300 text-[#3a4043]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <Select value={jobType} onValueChange={setJobType} required>
                    <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">
                    Work Mode <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={workLocation}
                    onValueChange={setWorkLocation}
                    required
                  >
                    <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc.toLowerCase()}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">Experience Level</label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level.toLowerCase()}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">Location</label>
                  <Input
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="border border-gray-300 text-[#3a4043]"
                  />
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">Salary Range</label>
                  <Input
                    placeholder="e.g. RM80,000 - RM120,000"
                    className="border border-gray-300 text-[#3a4043]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
            onClick={() => setClickedCard("job-desc")}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-[#3a4043] mb-2">
                  Job Summary <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Provide a brief overview of the role..."
                  rows={4}
                  required
                  className="border border-gray-300 text-[#3a4043]"
                />
              </div>
              <div>
                <label className="block text-[#3a4043] mb-2">
                  Key Responsibilities
                </label>
                <Textarea
                  placeholder="List key responsibilities..."
                  rows={4}
                  className="border border-gray-300 text-[#3a4043]"
                />
              </div>
              <div>
                <label className="block text-[#3a4043] mb-2">
                  Requirements
                </label>
                <Textarea
                  placeholder="List requirements..."
                  rows={6}
                  className="border border-gray-300 text-[#3a4043]"
                />
              </div>
            </CardContent>
          </Card>


          {/* Skills */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">
                Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="border border-gray-300 text-[#3a4043]"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-[#635bff]/10 text-[#635bff]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Neurodivergent-Friendly Features */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">
                Neurodivergent-Friendly Features
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Highlight your commitment to inclusive hiring
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-[#3a4043] mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#635bff]" /> Available
                  Accommodations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableAccommodations.map((acc) => (
                    <div key={acc} className="flex items-center space-x-2">
                      <Checkbox
                        id={acc}
                        checked={accommodations.includes(acc)}
                        onCheckedChange={() => toggleAccommodation(acc)}
                      />
                      <label
                        htmlFor={acc}
                        className="text-[#3a4043] cursor-pointer"
                      >
                        {acc}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Requirements & Demands */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">
                Role Requirements & Demands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Tasks */}
              <div>
                <label className="block text-[#3a4043] mb-3 font-semibold">
                  Core Tasks{" "}
                  <Badge className="ml-2 bg-[#635bff] text-white">Ranked</Badge>
                </label>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder={`Task ${index + 1} (e.g., Data Analysis)`}
                        className="flex-1 border border-gray-300 text-[#3a4043]"
                      />
                      <Select>
                        <SelectTrigger className="w-40 border border-gray-300 text-[#3a4043]">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-[#3a4043] mb-3 font-semibold">
                  Required Skills{" "}
                  <Badge className="ml-2 bg-purple-500 text-white">
                    Multiple Select
                  </Badge>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: "meticulous_detail", label: "Meticulous Detail" },
                    {
                      value: "strategic_thinking",
                      label: "High-level Strategic Thinking",
                    },
                    { value: "communication", label: "Communication" },
                    {
                      value: "technical_expertise",
                      label: "Technical Expertise",
                    },
                    { value: "creativity", label: "Creativity" },
                    { value: "analytical", label: "Analytical Skills" },
                  ].map((skill) => (
                    <div
                      key={skill.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox id={skill.value} />
                      <label
                        htmlFor={skill.value}
                        className="text-[#3a4043] cursor-pointer"
                      >
                        {skill.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem-Solving Type */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Problem-Solving Type
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="logical">
                      Logical & Systematic
                    </SelectItem>
                    <SelectItem value="creative">
                      Creative & Out-of-the-box
                    </SelectItem>
                    <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pace of Work */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Pace of Work
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select pace..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="fast">Fast-paced & Dynamic</SelectItem>
                    <SelectItem value="steady">Steady & Predictable</SelectItem>
                    <SelectItem value="project">
                      Project-based (Variable Pace)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repetitive Task Tolerance */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Repetitive Task Tolerance
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="high">
                      High (Frequent repetitive tasks)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium (Some repetitive tasks)
                    </SelectItem>
                    <SelectItem value="low">
                      Low (Minimal repetitive tasks)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Environmental & Workplace Structure */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="text-[#3a4043]">
                Environmental & Workplace Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Physical Environment */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Physical Environment
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select environment..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="open_plan">Open-plan Office</SelectItem>
                    <SelectItem value="cubicles">Cubicles</SelectItem>
                    <SelectItem value="quiet_zones">
                      Quiet Zones Available
                    </SelectItem>
                    <SelectItem value="private_office">
                      Private Offices
                    </SelectItem>
                    <SelectItem value="hybrid_space">
                      Hybrid Workspace
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Noise Level */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Noise Level
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select noise level..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="quiet">Quiet (Library-like)</SelectItem>
                    <SelectItem value="moderate">
                      Moderate (Normal office chatter)
                    </SelectItem>
                    <SelectItem value="loud">
                      Loud (High activity/open space)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lighting */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Lighting
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select lighting..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="natural">
                      Natural Light (Windows)
                    </SelectItem>
                    <SelectItem value="fluorescent">
                      Fluorescent Lighting
                    </SelectItem>
                    <SelectItem value="adjustable">
                      Adjustable/Dimmable
                    </SelectItem>
                    <SelectItem value="mixed">
                      Mixed (Natural + Artificial)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Arrangement */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Work Arrangement
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select arrangement..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="remote">Fully Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="office">In-Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Schedule */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Work Schedule
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select schedule..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="standard">Standard 9-5</SelectItem>
                    <SelectItem value="flexible">Flexible Schedule</SelectItem>
                    <SelectItem value="async">
                      Results-oriented (Asynchronous)
                    </SelectItem>
                    <SelectItem value="shift">Shift-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Structure */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Team Structure
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select structure..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="independent">
                      Independent Work
                    </SelectItem>
                    <SelectItem value="small_team">
                      Small Team Collaboration
                    </SelectItem>
                    <SelectItem value="large_dept">Large Department</SelectItem>
                    <SelectItem value="cross_functional">
                      Cross-functional Teams
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Social & Team Building Events */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Social & Team Building Events
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select frequency..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="required">
                      Required (Daily stand-ups, team lunches)
                    </SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="occasional">
                      Occasional (Monthly/Quarterly)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transport Accessibility */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Transport Accessibility
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select option..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="near_public">
                      Near Public Transport
                    </SelectItem>
                    <SelectItem value="parking">Parking Available</SelectItem>
                    <SelectItem value="remote_na">Remote (N/A)</SelectItem>
                    <SelectItem value="shuttle">
                      Company Shuttle Service
                    </SelectItem>
                    <SelectItem value="limited">
                      Limited Transport Options
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Communication & Management Style */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <MessageSquare className="h-5 w-5 text-[#635bff]" />
                Communication & Management Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Management Style */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Management Style
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select style..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="hands_on">
                      Hands-on & Structured
                    </SelectItem>
                    <SelectItem value="hands_off">
                      Hands-off & Autonomous
                    </SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="directive">Directive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Communication Medium */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Primary Communication Medium
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select medium..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="written">
                      Primarily Written (Slack, Email)
                    </SelectItem>
                    <SelectItem value="verbal">
                      Primarily Verbal (Meetings, Calls)
                    </SelectItem>
                    <SelectItem value="both">Both Written & Verbal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Structure */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Meeting Structure
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select structure..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="frequent_structured">
                      Frequent, Structured with Agendas
                    </SelectItem>
                    <SelectItem value="ad_hoc">
                      Spontaneous, Ad-hoc Meetings
                    </SelectItem>
                    <SelectItem value="minimal">Minimal Meetings</SelectItem>
                    <SelectItem value="mixed">Mixed Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Style */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Feedback Style
                </label>
                <Select>
                  <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                    <SelectValue placeholder="Select style..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                    <SelectItem value="frequent_direct">
                      Frequent, Direct Feedback
                    </SelectItem>
                    <SelectItem value="periodic_formal">
                      Periodic, Formalized Feedback
                    </SelectItem>
                    <SelectItem value="continuous">
                      Continuous Feedback Loop
                    </SelectItem>
                    <SelectItem value="self_directed">
                      Self-directed with Check-ins
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Accommodations & Inclusivity - Enhanced */}
          <Card
            className={`bg-white rounded-2xl transition-all duration-300 hover:border-[#635bff]/20 hover:shadow-[0_0_0px_2px_rgba(99,91,255,0.4)] ${
              clickedCard === "job-info" ? "border" : "border-2 border-[#d8d4f0]"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Heart className="h-5 w-5 text-[#635bff]" />
                Accommodations & Inclusivity
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Additional details about your inclusive workplace
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Neurodiversity Training */}
              <div>
                <label className="block text-[#3a4043] mb-3 font-semibold">
                  Neurodiversity Training
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Are managers and team members trained in neurodiversity
                  awareness?
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#635bff] cursor-pointer transition-all flex-1">
                    <input
                      type="radio"
                      name="neurodiversityTraining"
                      value="yes"
                      className="w-5 h-5 text-[#635bff] cursor-pointer"
                    />
                    <span className="text-[#3a4043] font-medium">Yes</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#635bff] cursor-pointer transition-all flex-1">
                    <input
                      type="radio"
                      name="neurodiversityTraining"
                      value="no"
                      className="w-5 h-5 text-[#635bff] cursor-pointer"
                    />
                    <span className="text-[#3a4043] font-medium">No</span>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Accommodations Provided */}
              <div>
                <h3 className="text-[#3a4043] mb-3 font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#635bff]" />
                  Accommodations Provided
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Select all accommodations available to employees
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Noise-canceling Headphones",
                    "Flexible Scheduling",
                    "Written Instructions",
                    "Quiet Workspace",
                    "Extended Deadlines",
                    "Assistive Technology",
                    "Regular Breaks",
                    "Remote Work Option",
                  ].map((acc) => (
                    <div key={acc} className="flex items-center space-x-2">
                      <Checkbox
                        id={acc}
                        checked={accommodations.includes(acc)}
                        onCheckedChange={() => toggleAccommodation(acc)}
                      />
                      <label
                        htmlFor={acc}
                        className="text-[#3a4043] cursor-pointer"
                      >
                        {acc}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Onboarding Process */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Onboarding Process
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Describe the onboarding process, including structure and
                  mentor availability
                </p>
                <Textarea
                  placeholder="e.g., Our onboarding process is structured over 2 weeks with a dedicated mentor. New hires receive written documentation, scheduled check-ins, and gradual task introduction..."
                  rows={5}
                  className="border border-gray-300 text-[#3a4043]"
                />
              </div>

              <Separator />

              {/* Company Culture Statement */}
              <div>
                <label className="block text-[#3a4043] mb-2 font-semibold">
                  Company Culture Statement
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Share your company's commitment to neurodiversity and
                  inclusion
                </p>
                <Textarea
                  placeholder="e.g., We are committed to creating an inclusive workplace that celebrates neurodiversity. We believe diverse thinking styles drive innovation and actively work to remove barriers..."
                  rows={5}
                  className="border border-gray-300 text-[#3a4043]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employer-dashboard")}
            >
              Cancel
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0px 0px 15px rgba(99,91,255,0.6), 0px 0px 30px rgba(99,91,255,0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-block rounded-lg" // keeps glow radius smooth
            >
              <Button
                type="submit"
                className="bg-[#635bff] hover:bg-[#635bff] text-white"
              >
                Post Job
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
