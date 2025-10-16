"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, // Card is still used for the overall structure, but not for the accordion items themselves
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
import {
  ArrowLeft,
  Shield,
  Plus,
  X,
  Eye,
  // ChevronDown, ChevronRight are now handled internally by AccordionTrigger
} from "lucide-react";
import { motion } from "framer-motion";

// Import Shadcn Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/accordion"; // Adjust path if necessary

/* SECTION IDs and titles (kept only the active sections) */
const SECTION_IDS = ["job-info", "job-desc", "skills", "neuro-friendly"];

const SECTION_TITLES: Record<string, string> = {
  "job-info": "Job Information",
  "job-desc": "Job Description",
  skills: "Required Skills",
  "neuro-friendly": "Neurodivergent-Friendly Accommodations",
};

export default function PostJob() {
  const router = useRouter();

  // --- Accordion navigation (one open at a time) ---
  // This state will now directly control the Shadcn Accordion's 'value' prop
  const [openSection, setOpenSection] = useState<string>("job-info");

  // --- Refs for scrolling/focusing when validation fails ---
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstInputRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});

  // --- State (kept the fields used by remaining sections) ---
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [accommodations, setAccommodations] = useState<string[]>([]);

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
    "Quiet room/space",
    "Sensory-friendly environment",
    "Job coach available",
    "Peer support system",
    "Flexible work arrangement",
    "Dedicated workspace (not hot desk)",
    "Sensory aids allowed",
    "Neurodiversity acceptance training",
    "Use visual project-tracking tool",
    "Regular check-in with supervisor",
    "No forced social event",
    "Zero tolerance policy for bullying & mobbing",
    "Mental health support",
    "Alternative communication app allowed",
    "Near public transport",
  ];

  // Skills / accommodations helpers
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

  // --- Controlled fields for validation (required ones) ---
  const [jobTitle, setJobTitle] = useState("");
  const [jobSummary, setJobSummary] = useState("");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper: scroll to a section and focus its first input/textarea
  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      // Scroll to the AccordionItem itself for better context
      const accordionItem = el.closest(".accordion-item-wrapper");
      if (accordionItem) {
        accordionItem.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    const firstInput = firstInputRefs.current[sectionId];
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 320);
    }
  };

  // Validation rules - required: jobTitle, jobType, workLocation, jobSummary
  const runValidation = () => {
    const next: Record<string, string> = {};
    if (!jobTitle.trim()) next.jobTitle = "Job title is required.";
    if (!jobType.trim()) next.jobType = "Job type is required.";
    if (!workLocation.trim()) next.workLocation = "Work mode is required.";
    if (!jobSummary.trim()) next.jobSummary = "Job summary is required.";
    setErrors(next);
    return next;
  };

  // Submit handler (front-end only)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = runValidation();
    const keys = Object.keys(validation);

    if (keys.length > 0) {
      const fieldSectionMap: Record<string, string> = {
        jobTitle: "job-info",
        jobType: "job-info",
        workLocation: "job-info",
        jobSummary: "job-desc",
      };
      const firstField = keys[0];
      const targetSection = fieldSectionMap[firstField] || "job-info";
      setOpenSection(targetSection); // Open the section with the first error
      setTimeout(() => scrollToSection(targetSection), 80);
      return;
    }

    console.log("Form validated — ready to submit (client-only).");
    router.push("/employer-dashboard");
  };

  // Shared padding class for content areas
  const contentPadding = "p-4 md:p-6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/employer-dashboard")}
              className="mb-2 text-[#3a4043] hover:text-[#635bff]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-black">Post a New Job</h1>
            <p className="text-gray-600 mt-1">
              Create an inclusive job posting that attracts neurodivergent
              talent.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-gray-500">Sections</div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#e8e6f0] flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#635bff]" />
              <div className="text-sm text-[#3a4043]">
                {openSection ? SECTION_TITLES[openSection] : "Select a section"}
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shadcn Accordion Wrapper */}
          <Accordion
            type="single" // Ensures only one section can be open at a time
            collapsible // Allows all sections to be closed
            value={openSection} // Controls the currently open section
            onValueChange={setOpenSection} // Updates state when a section is toggled
            className="w-full space-y-4" // Add some spacing between accordion items
          >
            {SECTION_IDS.map((id) => {
              const setSectionRef = (el: HTMLDivElement | null) => {
                sectionRefs.current[id] = el;
              };

              const setFirstInputRef = (
                el: HTMLInputElement | HTMLTextAreaElement | null
              ) => {
                firstInputRefs.current[id] = el;
              };

              return (
                <AccordionItem
                  key={id}
                  value={id} // Unique value for each item, used by the Accordion to identify it
                  // Apply custom styling based on Shadcn's data-state attribute
                  className="accordion-item-wrapper bg-white rounded-2xl border border-[#e8e6f0] shadow-sm data-[state=open]:border-2 data-[state=open]:border-[#635bff] data-[state=open]:shadow-[0_8px_30px_rgba(99,91,255,0.06)]"
                >
                  <AccordionTrigger
                    // Shadcn's AccordionTrigger handles its own styling and icons
                    className="flex items-center justify-between p-4 md:p-5 text-[#3a4043] text-base md:text-lg font-semibold hover:no-underline"
                  >
                    <div className="flex flex-col">{SECTION_TITLES[id]}</div>
                  </AccordionTrigger>

                  <AccordionContent className="overflow-hidden">
                    {/* The contentPadding div is where your actual section content goes */}
                    <div ref={setSectionRef} className={contentPadding}>
                      {/* JOB INFO */}
                      {id === "job-info" && (
                        <CardContent className="space-y-6 p-0">
                          {" "}
                          {/* p-0 to avoid double padding */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Job Title{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g. Software Engineer"
                                required
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className={`border ${
                                  errors.jobTitle
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } text-black`}
                                ref={(el: HTMLInputElement | null) =>
                                  setFirstInputRef(el)
                                }
                              />
                              {errors.jobTitle && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.jobTitle}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Department
                              </label>
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
                              <Select
                                value={jobType}
                                onValueChange={setJobType}
                                required
                              >
                                <SelectTrigger
                                  className={`border ${
                                    errors.jobType
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } text-[#3a4043]`}
                                >
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                                  {jobTypes.map((type) => (
                                    <SelectItem
                                      key={type}
                                      value={type.toLowerCase()}
                                    >
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.jobType && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.jobType}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Work Mode{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={workLocation}
                                onValueChange={setWorkLocation}
                                required
                              >
                                <SelectTrigger
                                  className={`border ${
                                    errors.workLocation
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } text-[#3a4043]`}
                                >
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                                  {locations.map((loc) => (
                                    <SelectItem
                                      key={loc}
                                      value={loc.toLowerCase()}
                                    >
                                      {loc}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.workLocation && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.workLocation}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Experience Level
                              </label>
                              <Select
                                value={experienceLevel}
                                onValueChange={setExperienceLevel}
                              >
                                <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                                  {experienceLevels.map((level) => (
                                    <SelectItem
                                      key={level}
                                      value={level.toLowerCase()}
                                    >
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Location
                              </label>
                              <Input
                                placeholder="e.g. Kuala Lumpur, Selangor"
                                className="border border-gray-300 text-[#3a4043]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Salary Range
                              </label>
                              <Input
                                placeholder="e.g. RM80,000 - RM120,000"
                                className="border border-gray-300 text-[#3a4043]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      )}

                      {/* JOB DESCRIPTION */}
                      {id === "job-desc" && (
                        <CardContent className="space-y-6 p-0">
                          <div>
                            <label className="block text-[#3a4043] mb-2">
                              Job Summary{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                              placeholder="Provide a brief overview of the role..."
                              rows={4}
                              required
                              value={jobSummary}
                              onChange={(e) => setJobSummary(e.target.value)}
                              className={`border ${
                                errors.jobSummary
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } text-[#3a4043]`}
                              ref={(el: HTMLTextAreaElement | null) => {
                                if (!firstInputRefs.current["job-desc"]) {
                                  firstInputRefs.current["job-desc"] = el;
                                }
                              }}
                            />
                            {errors.jobSummary && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.jobSummary}
                              </p>
                            )}
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
                      )}

                      {/* SKILLS */}
                      {id === "skills" && (
                        <CardContent className="space-y-4 p-0">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a skill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              className="border border-gray-300 text-[#3a4043]"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addSkill())
                              }
                              ref={(el: HTMLInputElement | null) => {
                                if (!firstInputRefs.current["skills"])
                                  firstInputRefs.current["skills"] = el;
                              }}
                            />
                            <Button
                              type="button"
                              onClick={addSkill}
                              variant="outline"
                            >
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
                      )}

                      {/* NEURO-FRIENDLY */}
                      {id === "neuro-friendly" && (
                        <CardContent className="space-y-6 p-0">
                          <div>
                            <h3 className="text-[#3a4043] mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-[#635bff]" />{" "}
                              Available Accommodations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {availableAccommodations.map((acc) => (
                                <div
                                  key={acc}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={acc}
                                    checked={accommodations.includes(acc)}
                                    onCheckedChange={() =>
                                      toggleAccommodation(acc)
                                    }
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
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
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
                scale: 1.03,
                boxShadow: "0px 8px 30px rgba(99,91,255,0.12)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button type="submit" className="bg-[#635bff] text-white">
                Post Job
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}