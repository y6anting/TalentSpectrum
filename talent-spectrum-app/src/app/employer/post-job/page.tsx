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
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

/* SECTION IDs and titles (kept only the active sections) */
const SECTION_IDS = ["job-info", "job-desc", "skills", "neuro-friendly"];

const SECTION_TITLES: Record<string, string> = {
  "job-info": "Job Information",
  "job-desc": "Job Description",
  skills: "Required Skills", // Title remains "Required Skills" for UI
  "neuro-friendly": "Neurodivergent-Friendly Accommodations",
};

// Define props for the PostJob component
interface PostJobProps {
  onJobPosted: () => void; // Callback when a job is successfully posted
  onCancel: () => void; // Callback when the user cancels
}

export default function PostJob({ onJobPosted, onCancel }: PostJobProps) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const { success, error: showError, warning, info } = useToastHelpers();

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
  const [salaryRange, setSalaryRange] = useState<string>(""); // Changed to string to match Select value
  const [jobRequirements, setJobRequirements] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [softSkills, setSoftSkills] = useState<string[]>([]); // Renamed from 'skills' to 'softSkills'
  const [newSkill, setNewSkill] = useState("");
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const { data: session } = useSession();

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
    const skillToAdd = newSkill.trim();
    console.log("DEBUG: Attempting to add skill:", skillToAdd); // DEBUG LOG
    console.log("DEBUG: Current softSkills before add:", softSkills); // DEBUG LOG

    if (skillToAdd && !softSkills.includes(skillToAdd)) {
      const updatedSkills = [...softSkills, skillToAdd];
      setSoftSkills(updatedSkills);
      setNewSkill("");
      console.log("DEBUG: softSkills array after adding:", updatedSkills); // DEBUG LOG
    } else if (!skillToAdd) {
      console.log("DEBUG: Skill to add is empty or just whitespace.");
    } else {
      console.log("DEBUG: Skill already exists:", skillToAdd);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = softSkills.filter((skill) => skill !== skillToRemove);
    setSoftSkills(updatedSkills);
    console.log("DEBUG: softSkills array after removing:", updatedSkills); // DEBUG LOG
  };

  const toggleAccommodation = (accommodation: string) => {
    accommodations.includes(accommodation)
      ? setAccommodations(accommodations.filter((acc) => acc !== accommodation))
      : setAccommodations([...accommodations, accommodation]);
  };

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to clear a specific error when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
  const handleSubmit = async (e: React.FormEvent, status: string = "active") => {
    e.preventDefault();
    console.log("🚀 Form submitted with status:", status);
    console.log("📝 Form state (before validation):", {
      jobTitle,
      jobType,
      workLocation,
      experienceLevel,
      jobLocation,
      salaryRange,
      jobSummary,
      jobRequirements,
      softSkills, // Ensure this is logged
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

    try {
      const employerEmail = session?.user?.email;
      if (!employerEmail) {
        throw new Error("No user email found in session");
      }

      // Construct request payload to match your FastAPI PostJobRequest model
      const payload = {
        employer_email: employerEmail,
        job_title: jobTitle,
        job_type: jobType,
        work_mode: workLocation,
        experience_level: experienceLevel,
        location: jobLocation,
        // Parse salaryRange to integer as it's an index for the salaryRanges array
        salary_range: parseInt(salaryRange),
        job_summary: jobSummary,
        job_requirements: jobRequirements || null,
        soft_skills: softSkills.join(", ") || null, // This is the critical line
        status: status, // Set the status (active or draft)
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

      console.log("DEBUG: Frontend payload before sending:", payload); // DEBUG LOG
      console.log("DEBUG: Value of softSkills.join(', ') is:", softSkills.join(", ")); // DEBUG LOG
      console.log("DEBUG: Value of softSkills.join(', ') || null is:", softSkills.join(", ") || null); // DEBUG LOG

      console.log("📤 Attempting to send request to backend...");
      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json(); // Try to get error details from the response
        throw new Error(`Failed to post job: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const successMessage = status === "draft" 
        ? "Job saved as draft successfully!" 
        : "Job posted successfully!";
      success(successMessage);
        
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
      setSoftSkills([]); // Changed 'skills' to 'softSkills'
      setNewSkill("");
      setAccommodations([]);
      setErrors({});
      setOpenSection("job-info"); // Return to first section
    } catch (err) {
      showError("Failed to post job. Please try again later.");
    }
  };

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, "draft");
  };

  // Shared padding class for content areas
  const contentPadding = "p-4 md:p-6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      {" "}
      {/* Adjusted for consistency with dashboard bg */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#3a4043] mt-2">Post a New Job</h2>
            {/* <p className="text-gray-600 mt-1 italic">
              Post an inclusive job for neurodivergent talent!
            </p> */}
          </div>

          <div className="hidden md:flex items-center gap-4 ">
            <div className="text-base text-gray-500">Sections</div>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-[#e8e6f0] flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#635bff]" />
              <div className="text-base text-[#3a4043]">
                {openSection ? SECTION_TITLES[openSection] : "Select a section"}
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={(e) => handleSubmit(e, "active")} className="space-y-4">
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
                  className="accordion-item-wrapper bg-[#fbfbff] rounded-2xl border border-[#e8e6f0] shadow-sm data-[state=open]:border-2 data-[state=open]:border-[#635bff]/30 data-[state=open]:shadow-[0_8px_30px_rgba(99,91,255,0.06)]"
                >
                  <AccordionTrigger
                    // Shadcn's AccordionTrigger handles its own styling and icons
                    className="flex items-center justify-between p-4 md:p-5 text-[#3a4043] text-base md:text-lg font-semibold hover:no-underline hover:cursor-pointer"
                  >
                    <div className="flex flex-col">{SECTION_TITLES[id]}</div>
                  </AccordionTrigger>

                  <AccordionContent className="overflow-hidden text-base">
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
                                onChange={(e) => {
                                  setJobTitle(e.target.value);
                                  clearError("jobTitle");
                                }}
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
                                onValueChange={(value) => {
                                  setJobType(value);
                                  clearError("jobType");
                                }}
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
                                onValueChange={(value) => {
                                  setWorkLocation(value);
                                  clearError("workLocation");
                                }}
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
                                onValueChange={(value) => {
                                  setExperienceLevel(value);
                                  clearError("experienceLevel");
                                }}
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
                                onChange={(e) => {
                                  setJobLocation(e.target.value);
                                  clearError("jobLocation");
                                }}
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
                                onValueChange={(value) => {
                                  setSalaryRange(value);
                                  clearError("salaryRange");
                                }}
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
                              onChange={(e) => {
                                setJobSummary(e.target.value);
                                clearError("jobSummary");
                              }}
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
                              onChange={(e) => {
                                setNewSkill(e.target.value);
                                console.log("DEBUG: newSkill input changed to:", e.target.value); // DEBUG LOG
                              }}
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
                              className="hover:cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {softSkills.length > 0 && ( // Changed 'skills' to 'softSkills'
                            <div className="flex flex-wrap gap-2">
                              {softSkills.map((skill) => ( // Changed 'skills' to 'softSkills'
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
                                  className="flex items-center space-x-2 "
                                >
                                  <Checkbox
                                    id={acc} // Added ID for accessibility
                                    checked={accommodations.includes(acc)}
                                    onCheckedChange={() =>
                                      toggleAccommodation(acc)
                                    }
                                    className="cursor-pointer"
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
            <Button type="submit" className="bg-[#635bff] text-white hover:cursor-pointer hover:bg-[#524aff]">
              Post Job
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveAsDraft}
              className="cursor-pointer border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel} // Use onCancel prop here
              className="cursor-pointer border border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}