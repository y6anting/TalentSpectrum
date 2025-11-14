"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { ProfileSubmission } from "../../components/ProfileSubmission";

interface PersonalIdentifiers {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  nric: string;
  oku_card: string;
  residentialAddress: string;
  preferred_role: string;
  preferred_industry: string;
  preferred_location: string;
}

interface CandidateProfile {
  personalIdentifiers: PersonalIdentifiers;
  name: string;
  email: string;
  location: string;
}

interface ProfileConfigPageProps {
  candidateProfile: CandidateProfile;
  setCandidateProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  calculateProfileCompletion: () => void;
  refreshProfileData: () => void;
}

export default function ProfileConfigPage({
  candidateProfile,
  setCandidateProfile,
  errors,
  setErrors,
  calculateProfileCompletion,
  refreshProfileData,
}: ProfileConfigPageProps) {
  const fields = [
    { label: "Full Name", key: "fullName", type: "text", required: true },
    { label: "Email", key: "emailAddress", type: "email", required: true },
    { label: "Phone Number", key: "phoneNumber", type: "tel", required: true },
    { label: "Date of Birth", key: "dateOfBirth", type: "date", required: true },
    { label: "Gender", key: "gender", type: "select", options: ["Male", "Female", "Prefer not to mention"], required: true },
    { label: "Nationality", key: "nationality", type: "select", options: ["Malaysian", "Non-Malaysian"], required: true },
    { label: "OKU Card", key: "oku_card", type: "text" },
    { label: "Preferred Role", key: "preferred_role", type: "select", options: ["Permanent", "Contract", "Part Time", "Internship"], required: true },
    { label: "Preferred Industry", key: "preferred_industry", type: "select", options: ["Aerospace", "Agriculture", "Automotive", "Banking & Finance", "Biotechnology", "Chemical & Petrochemical", "Construction & Building Materials", "Creative & Media", "Digital Economy & Startups", "E-commerce & Retail", "Education", "Electrical & Electronics (E&E)", "Energy & Utilities", "Engineering & Machinery", "Fisheries & Aquaculture", "Food & Beverage Processing", "Forestry & Timber", "Green Technology & Renewable Energy", "Healthcare & Medical", "ICT & Software Development", "Legal & Professional Services", "Logistics & Transportation", "Manufacturing", "Mining & Minerals", "Oil & Gas", "Pharmaceuticals & Medical Devices", "Real Estate & Property Development", "Rubber", "Textiles & Apparel", "Tourism & Hospitality", "Others"], required: true },
    { label: "Preferred Location", key: "preferred_location", type: "select", options: ["Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu", "Remote"], required: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-[#3a4043] mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <Select
                      value={
                        (candidateProfile.personalIdentifiers[
                          field.key as keyof typeof candidateProfile.personalIdentifiers
                        ] as string) || ""
                      }
                      onValueChange={(val) => {
                        setCandidateProfile({
                          ...candidateProfile,
                          personalIdentifiers: {
                            ...candidateProfile.personalIdentifiers,
                            [field.key as string]: val,
                          },
                          name: field.key === "fullName" ? val : candidateProfile.name,
                          email: field.key === "emailAddress" ? val : candidateProfile.email,
                        });
                        if (field.required && val) {
                          setErrors({ ...errors, [field.key]: "" });
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          errors[field.key as string]
                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                            : "border-[#e8e6f0] focus-visible:border-gray-400 focus-visible:ring-gray-400/50"
                        }`}
                      >
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <>
                      <input
                        type={field.type}
                        value={
                          (candidateProfile.personalIdentifiers[
                            field.key as keyof typeof candidateProfile.personalIdentifiers
                          ] as string) || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          let error = "";

                          if (field.required && !value.trim()) {
                            error = `${field.label} is required.`;
                          }
                          if (field.type === "email") {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                              error = "Please enter a valid email address.";
                            }
                          }
                          if (field.type === "tel") {
                            const numericRegex = /^[0-9+\- ]*$/;
                            if (!numericRegex.test(value)) {
                              error = "Please enter a valid phone number.";
                            }
                          }

                          setErrors({ ...errors, [field.key]: error });

                          setCandidateProfile({
                            ...candidateProfile,
                            personalIdentifiers: {
                              ...candidateProfile.personalIdentifiers,
                              [field.key as keyof typeof candidateProfile.personalIdentifiers]: e.target.value,
                            },
                            name: field.key === "fullName" ? e.target.value : candidateProfile.name,
                            email: field.key === "emailAddress" ? e.target.value : candidateProfile.email,
                          });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg outline-none focus-visible:ring-[1px] ${
                          errors[field.key as string]
                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                            : "border-[#e8e6f0] focus-visible:border-gray-400 focus-visible:ring-gray-400/50"
                        }`}
                      />
                      {errors[field.key as string] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.key as string]}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <ProfileSubmission
                candidateProfile={{
                  personalIdentifiers: candidateProfile.personalIdentifiers,
                  name: candidateProfile.name,
                  email: candidateProfile.email,
                  location: candidateProfile.location,
                }}
                onSave={() => {
                  calculateProfileCompletion();
                  // Dispatch event to update header without full page refresh
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('profileUpdated'));
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
