"use client";

import React, { useRef, useState } from "react";
// Remove useRouter as we'll use props for navigation
// import { useRouter } from "next/navigation";
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
import { ArrowLeft, Shield, Plus, X, Eye } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/accordion";

/* SECTION IDs and titles (kept only the active sections) */
const SECTION_IDS = ["job-info", "job-desc", "skills", "neuro-friendly"];

const SECTION_TITLES: Record<string, string> = {
  "job-info": "Job Information",
  "job-desc": "Job Description",
  skills: "Required Skills",
  "neuro-friendly": "Neurodivergent-Friendly Accommodations",
};

// Define props for the PostJob component
interface PostJobProps {
  onJobPosted: () => void; // Callback when a job is successfully posted
  onCancel: () => void; // Callback when the user cancels
}

export default function PostJob({ onJobPosted, onCancel }: PostJobProps) {
  // const router = useRouter(); // No longer needed

  const [openSection, setOpenSection] = useState<string>("job-info");

  // --- Refs for scrolling/focusing when validation fails ---
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstInputRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});

  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobSummary, setJobSummary] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobLocation, setJobLocation] = useState("");
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

  const salaryRanges = [
    "Below RM 3,000",
    "RM 3,000 - RM 5,000",
    "RM 5,001 - RM 8,000",
    "RM 8,001 - RM 12,000",
    "RM 12,001 - RM 18,000",
    "RM 18,001 - RM 25,000",
    "Above RM 25,000",
  ];

  const availableAccommodations = [
    "Flexible work hours",
    "Quiet room/space",
    "Sensory-friendly environment",
    "Peer support system",
    "Dedicated workspace (not hot desk)",
    "Sensory aids allowed",
    "Neurodiversity awareness training",
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

  // Validation rules - required fields based on Pydantic schema
  const runValidation = () => {
    const next: Record<string, string> = {};
    if (!jobTitle.trim()) next.jobTitle = "Job title is required.";
    if (!jobType.trim()) next.jobType = "Job type is required.";
    if (!workLocation.trim()) next.workLocation = "Work mode is required.";
    if (!experienceLevel.trim())
      next.experienceLevel = "Experience level is required.";
    if (!jobLocation.trim()) next.jobLocation = "Location is required.";
    if (!salaryRange.trim()) next.salaryRange = "Salary range is required.";
    if (!jobSummary.trim()) next.jobSummary = "Job summary is required.";
    setErrors(next);
    return next;
  };

  // Submit handler (connect to backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Form submitted");
    console.log("📝 Form state:", {
      jobTitle,
      jobType,
      workLocation,
      experienceLevel,
      jobLocation,
      salaryRange,
      jobSummary,
      jobRequirements,
    });

    const validation = runValidation();
    const keys = Object.keys(validation);

    if (keys.length > 0) {
      const fieldSectionMap: Record<string, string> = {
        jobTitle: "job-info",
        jobType: "job-info",
        workLocation: "job-info",
        experienceLevel: "job-info",
        jobLocation: "job-info",
        salaryRange: "job-info",
        jobSummary: "job-desc",
      };
      const firstField = keys[0];
      const targetSection = fieldSectionMap[firstField] || "job-info";
      setOpenSection(targetSection);
      setTimeout(() => scrollToSection(targetSection), 80);
      return;
    }

    // Get employer email from localStorage
    const employerEmail = localStorage.getItem("employerEmail");
    if (!employerEmail) {
      alert("Please log in as an employer to post jobs.");
      return;
    }

    // Construct request payload to match your FastAPI PostJobRequest model
    const payload = {
      employer_email: employerEmail,
      job_title: jobTitle,
      job_type: jobType,
      work_mode: workLocation,
      experience_level: experienceLevel,
      location: jobLocation,
      salary_range: parseInt(salaryRange),
      job_summary: jobSummary,
      job_requirements: jobRequirements || null,
      soft_skills: skills.join(", ") || null,
      flexible_work_hour: accommodations.includes("Flexible work hours"),
      sensory_friendly_environment: accommodations.includes(
        "Sensory-friendly environment"
      ),
      peer_support_system: accommodations.includes("Peer support system"),
      dedicated_workspace: accommodations.includes(
        "Dedicated workspace (not hot desk)"
      ),
      neurodiversity_awareness_training: accommodations.includes(
        "Neurodiversity awareness training"
      ),
      regular_supervisor_check_in: accommodations.includes(
        "Regular check-in with supervisor"
      ),
      zero_tolerance_bullying_mobbing_policy: accommodations.includes(
        "Zero tolerance policy for bullying & mobbing"
      ),
      augmentative_alternative_communication: accommodations.includes(
        "Alternative communication app allowed"
      ),
      quiet_room: accommodations.includes("Quiet room/space"),
      sensory_aids: accommodations.includes("Sensory aids allowed"),
      provide_visual_guidance: accommodations.includes(
        "Use visual project-tracking tool"
      ),
      uses_project_management_tools: accommodations.includes(
        "Use visual project-tracking tool"
      ),
      optional_social_event: accommodations.includes("No forced social event"),
      mental_health_support: accommodations.includes("Mental health support"),
      near_public_transport: accommodations.includes("Near public transport"),
    };

    try {
      console.log("📤 Attempting to send request to backend...");
      const res = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json(); // Try to get error details from the response
        console.error("❌ Error response from server:", errorData);
        throw new Error(`Failed to post job: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("✅ Job posted successfully:", data);
      alert("Job posted successfully!");
      // Call the callback to switch tabs
      onJobPosted();
      // Reset form fields after successful submission (optional)
      setJobTitle("");
      setJobType("");
      setJobSummary("");
      setWorkLocation("");
      setSalaryRange("");
      setJobRequirements("");
      setExperienceLevel("");
      setJobLocation("");
      setSkills([]);
      setNewSkill("");
      setAccommodations([]);
      setErrors({});
      setOpenSection("job-info"); // Return to first section
    } catch (err) {
      console.error("❌ Error posting job:", err);
      alert(`Failed to post job: ${err}`);
    }
  };

  // Shared padding class for content areas
  const contentPadding = "p-4 md:p-6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      {" "}
      {/* Adjusted for consistency with dashboard bg */}
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
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
                        <div className="space-y-6">
                          {" "}
                          {/* Removed CardContent to clean up unused imports */}
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
                                  <SelectValue placeholder="Select work mode" />
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
                                Experience Level{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={experienceLevel}
                                onValueChange={setExperienceLevel}
                                required
                              >
                                <SelectTrigger
                                  className={`border ${
                                    errors.experienceLevel
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } text-[#3a4043]`}
                                >
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
                              {errors.experienceLevel && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.experienceLevel}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Location <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g. Kuala Lumpur, Selangor"
                                value={jobLocation}
                                onChange={(e) => setJobLocation(e.target.value)}
                                className={`border ${
                                  errors.jobLocation
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } text-[#3a4043]`}
                              />
                              {errors.jobLocation && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.jobLocation}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Salary Range{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={salaryRange}
                                onValueChange={setSalaryRange}
                                required
                              >
                                <SelectTrigger
                                  className={`border ${
                                    errors.salaryRange
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } text-[#3a4043]`}
                                >
                                  <SelectValue placeholder="Select salary range">
                                    {salaryRange !== ""
                                      ? salaryRanges[parseInt(salaryRange)]
                                      : "Select salary range"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                                  {salaryRanges.map((range, index) => (
                                    <SelectItem
                                      key={index}
                                      value={index.toString()}
                                    >
                                      {range}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.salaryRange && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.salaryRange}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* JOB DESCRIPTION */}
                      {id === "job-desc" && (
                        <div className="space-y-6">
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
                              value={jobRequirements}
                              onChange={(e) =>
                                setJobRequirements(e.target.value)
                              }
                              className="border border-gray-300 text-[#3a4043]"
                            />
                          </div>
                        </div>
                      )}

                      {/* SKILLS */}
                      {id === "skills" && (
                        <div className="space-y-4">
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
                        </div>
                      )}

                      {/* NEURO-FRIENDLY */}
                      {id === "neuro-friendly" && (
                        <div className="space-y-6">
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
                                    id={acc} // Added ID for accessibility
                                    checked={accommodations.includes(acc)}
                                    onCheckedChange={() =>
                                      toggleAccommodation(acc)
                                    }
                                  />
                                  <label
                                    htmlFor={acc} // Linked to checkbox ID
                                    className="text-[#3a4043] cursor-pointer"
                                  >
                                    {acc}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
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
              onClick={onCancel} // Use onCancel prop here
            >
              Cancel
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit" className="bg-[#635bff] text-white">
              Post Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
