"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Textarea } from "@/app/components/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/select";
import { Badge } from "@/app/components/badge";
import { Checkbox } from "@/app/components/checkbox";
import { X, Plus, Shield, Eye } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/accordion";
import type { JobPosting } from "@/app/employer/employer-dashboard/page";

type Props = {
  isOpen: boolean;
  editJobData: Partial<JobPosting>;
  setEditJobData: React.Dispatch<React.SetStateAction<Partial<JobPosting>>>;
  errors: Record<string, string>;
  salaryRanges: string[];
  onClose: () => void;
  onSave: () => void;
};

const SECTION_IDS = ["job-info", "job-desc", "skills", "neuro-friendly"];

const SECTION_TITLES: Record<string, string> = {
  "job-info": "Job Information",
  "job-desc": "Job Description",
  skills: "Required Skills",
  "neuro-friendly": "Neurodivergent-Friendly Accommodations",
};

export default function EditJobModal({ isOpen, editJobData, setEditJobData, errors, salaryRanges, onClose, onSave }: Props) {
  const [openSection, setOpenSection] = useState<string>("job-info");
  
  // Refs for scrolling/focusing
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const firstInputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  
  // Align options with Post New Job
  const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
  const locations = ["Remote", "On-site", "Hybrid"];
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive", "Non-Executive"];

  // Local UI-only state for Department (kept for parity with Post Job)
  const [department, setDepartment] = useState<string>((editJobData as any)?.department || "");

  // Skills management (mirror Post Job skills UI)
  const initialSkillsValue = useMemo( // Renamed to avoid conflict with state variable
    () => {
      const skillsArray = typeof editJobData?.soft_skills === "string"
        ? editJobData.soft_skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      console.log("DEBUG: useMemo calculated initialSkillsValue:", skillsArray); // Debug log
      return skillsArray;
    },
    [editJobData?.soft_skills]
  );

  const [skills, setSkills] = useState<string[]>([]); // Initialize as empty, will be set by useEffect
  const [newSkill, setNewSkill] = useState<string>("");

  // EFFECT TO SYNCHRONIZE 'skills' STATE WITH 'editJobData.soft_skills' PROP
  useEffect(() => {
    console.log("DEBUG: useEffect triggered for soft_skills prop change."); // Debug log
    console.log("DEBUG: Setting skills state to:", initialSkillsValue); // Debug log
    setSkills(initialSkillsValue);
    // Reset newSkill input when the modal's job data changes
    setNewSkill("");
  }, [initialSkillsValue]); // Depend on the memoized value

  const addSkill = () => {
    const skill = newSkill.trim();
    console.log("DEBUG: Attempting to add skill:", skill); // Debug log
    console.log("DEBUG: Current skills state before add:", skills); // Debug log

    if (!skill || skills.includes(skill)) {
      console.log("DEBUG: Skill is empty or already exists. Not adding."); // Debug log
      return;
    }
    const next = [...skills, skill];
    setSkills(next);
    setNewSkill("");
    // Update the parent's editJobData immediately
    setEditJobData((p: any) => ({ ...p, soft_skills: next.join(", ") }));
    console.log("DEBUG: skills state after add:", next); // Debug log
    console.log("DEBUG: editJobData.soft_skills updated to:", next.join(", ")); // Debug log
  };

  const removeSkill = (skillToRemove: string) => {
    console.log("DEBUG: Attempting to remove skill:", skillToRemove); // Debug log
    const next = skills.filter(s => s !== skillToRemove);
    setSkills(next);
    // Update the parent's editJobData immediately
    setEditJobData((p: any) => ({ ...p, soft_skills: next.join(", ") }));
    console.log("DEBUG: skills state after remove:", next); // Debug log
    console.log("DEBUG: editJobData.soft_skills updated to:", next.join(", ")); // Debug log
  };

  // Full accommodations list matching Post Job exactly
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

  // Map accommodation labels to field names
  const accommodationMap: Record<string, keyof JobPosting> = {
    "Flexible work hours": "flexible_work_hour",
    "Quiet room/space": "quiet_room",
    "Sensory-friendly environment": "sensory_friendly_environment",
    "Peer support system": "peer_support_system",
    "Dedicated workspace (not hot desk)": "dedicated_workspace",
    "Sensory aids allowed": "sensory_aids",
    "Neurodiversity awareness training": "neurodiversity_awareness_training",
    "Use visual project-tracking tool": "provide_visual_guidance",
    "Regular check-in with supervisor": "regular_supervisor_check_in",
    "No forced social event": "optional_social_event",
    "Zero tolerance policy for bullying & mobbing": "zero_tolerance_bullying_mobbing_policy",
    "Mental health support": "mental_health_support",
    "Alternative communication app allowed": "augmentative_alternative_communication",
    "Near public transport": "near_public_transport",
  };

  const toggleAccommodation = (accommodation: string) => {
    const fieldName = accommodationMap[accommodation];
    if (fieldName) {
      setEditJobData((p: any) => ({ ...p, [fieldName]: !p[fieldName] }));
    }
  };

  const contentPadding = "p-4 md:p-6";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-violet-50 to-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#e8e6f0] bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#3a4043]">Edit Job Posting</h2>
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-[#e8e6f0]">
              <Eye className="h-4 w-4 text-[#635bff]" />
              <div className="text-sm text-[#3a4043]">
                {openSection ? SECTION_TITLES[openSection] : "Select a section"}
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100 hover:cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="w-full space-y-4"
          >
            {SECTION_IDS.map((id) => {
              const setSectionRef = (el: HTMLDivElement | null) => {
                sectionRefs.current[id] = el;
              };

              const setFirstInputRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
                firstInputRefs.current[id] = el;
              };

              return (
                <AccordionItem
                  key={id}
                  value={id}
                  className="accordion-item-wrapper bg-[#fbfbff] rounded-2xl border border-[#e8e6f0] shadow-sm data-[state=open]:border-2 data-[state=open]:border-[#635bff]/30 data-[state=open]:shadow-[0_8px_30px_rgba(99,91,255,0.06)]"
                >
                  <AccordionTrigger className="flex items-center justify-between p-4 md:p-5 text-[#3a4043] text-base md:text-lg font-semibold hover:no-underline hover:cursor-pointer">
                    <div className="flex flex-col">{SECTION_TITLES[id]}</div>
                  </AccordionTrigger>

                  <AccordionContent className="overflow-hidden text-base">
                    <div ref={setSectionRef} className={contentPadding}>
                      {/* JOB INFO */}
                      {id === "job-info" && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Job Title <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g. Software Engineer"
                                value={editJobData.job_title || ""}
                                onChange={(e) => setEditJobData((p: any) => ({ ...p, job_title: e.target.value }))}
                                className={`border ${errors.job_title ? "border-red-500" : "border-gray-300"} text-black`}
                                ref={(el: HTMLInputElement | null) => setFirstInputRef(el)}
                              />
                              {errors.job_title && <p className="text-sm text-red-500 mt-1">{errors.job_title}</p>}
                            </div>

                            <div>
                              <label className="block text-[#3a4043] mb-2">Department</label>
                              <Input
                                placeholder="e.g. Engineering"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
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
                                value={editJobData.job_type?.toLowerCase() || ""}
                                onValueChange={(val) => setEditJobData((p: any) => ({ ...p, job_type: val }))}
                              >
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
                                value={editJobData.work_mode?.toLowerCase() || ""}
                                onValueChange={(val) => setEditJobData((p: any) => ({ ...p, work_mode: val }))}
                              >
                                <SelectTrigger className="border border-gray-300 text-[#3a4043]">
                                  <SelectValue placeholder="Select work mode" />
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
                              <label className="block text-[#3a4043] mb-2">
                                Experience Level <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={editJobData.experience_level?.toLowerCase() || ""}
                                onValueChange={(val) => setEditJobData((p: any) => ({ ...p, experience_level: val }))}
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
                              <label className="block text-[#3a4043] mb-2">
                                Location <span className="text-red-500">*</span>
                              </label>
                              <Input
                                placeholder="e.g. Kuala Lumpur, Selangor"
                                value={editJobData.location || ""}
                                onChange={(e) => setEditJobData((p: any) => ({ ...p, location: e.target.value }))}
                                className="border border-gray-300 text-[#3a4043]"
                              />
                            </div>

                            <div>
                              <label className="block text-[#3a4043] mb-2">
                                Salary Range <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={editJobData.salary_range?.toString() || ""}
                                onValueChange={(val) => setEditJobData((p: any) => ({ ...p, salary_range: Number(val) }))}
                              >
                                <SelectTrigger className={`border ${errors.salary_range ? "border-red-500" : "border-gray-300"} text-[#3a4043]`}>
                                  <SelectValue placeholder="Select salary range">
                                    {editJobData.salary_range !== undefined
                                      ? salaryRanges[editJobData.salary_range]
                                      : "Select salary range"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-[#f9fafb] border border-[#e8e6f0] shadow-md rounded-lg">
                                  {salaryRanges.map((range, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                      {range}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.salary_range && <p className="text-sm text-red-500 mt-1">{errors.salary_range}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* JOB DESCRIPTION */}
                      {id === "job-desc" && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-[#3a4043] mb-2">
                              Job Summary <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                              placeholder="Provide a brief overview of the role..."
                              rows={4}
                              value={editJobData.job_summary || ""}
                              onChange={(e) => setEditJobData((p: any) => ({ ...p, job_summary: e.target.value }))}
                              className="border border-gray-300 text-[#3a4043]"
                              ref={(el: HTMLTextAreaElement | null) => {
                                if (!firstInputRefs.current["job-desc"]) {
                                  firstInputRefs.current["job-desc"] = el;
                                }
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-[#3a4043] mb-2">Requirements</label>
                            <Textarea
                              placeholder="List requirements..."
                              rows={6}
                              value={editJobData.job_requirements || ""}
                              onChange={(e) => setEditJobData((p: any) => ({ ...p, job_requirements: e.target.value }))}
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
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addSkill();
                                }
                              }}
                              ref={(el: HTMLInputElement | null) => {
                                if (!firstInputRefs.current["skills"]) firstInputRefs.current["skills"] = el;
                              }}
                            />
                            <Button type="button" onClick={addSkill} variant="outline" className="hover:cursor-pointer">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-[#635bff]/10 text-[#635bff]">
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
                              <Shield className="h-4 w-4 text-[#635bff]" />
                              Available Accommodations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {availableAccommodations.map((acc) => (
                                <div key={acc} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${acc}`}
                                    checked={!!(editJobData as any)[accommodationMap[acc]]}
                                    onCheckedChange={() => toggleAccommodation(acc)}
                                    className="cursor-pointer"
                                  />
                                  <label htmlFor={`edit-${acc}`} className="text-[#3a4043] cursor-pointer">
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
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e8e6f0] bg-white flex justify-end gap-4">
          <Button
            onClick={onSave}
            className="bg-[#635bff] text-white hover:cursor-pointer hover:bg-[#524aff]"
          >
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose} className="cursor-pointer border border-gray-300">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}