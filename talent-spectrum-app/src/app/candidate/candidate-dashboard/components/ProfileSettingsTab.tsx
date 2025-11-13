"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Button } from "@/app/components/button";
import { Badge } from "@/app/components/badge";
import { Skeleton } from "@/app/components/loading-skeleton";
import { User, Mail, MapPin, Phone, Calendar, Briefcase, GraduationCap, Award, FileText, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

interface ProfileSettingsTabProps {
  candidateEmail: string;
  onUploadSuccess?: () => void;
}

export default function ProfileSettingsTab({ candidateEmail, onUploadSuccess }: ProfileSettingsTabProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const { success, error: showError, info } = useToastHelpers();

  useEffect(() => {
    if (candidateEmail) {
      fetchProfileData();
    }
  }, [candidateEmail]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/profiles/${candidateEmail}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      showError('Invalid File', 'Please upload a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Upload and extract resume
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const extractResponse = await fetch(`${backendUrl}/resume-extractor/upload_pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract resume data");
      }

      const extractData = await extractResponse.json();

      if (extractData.status !== 'ok') {
        throw new Error(extractData.message || "Failed to parse resume");
      }

      // Step 2: Parse the extracted data
      let parsedInfo = extractData.parsed_info;
      if (typeof parsedInfo === 'string') {
        parsedInfo = JSON.parse(parsedInfo);
      }

      // Make sure the email matches the logged-in user
      parsedInfo.candidate_email = candidateEmail;
      if (parsedInfo.personal_identifiers) {
        parsedInfo.personal_identifiers.emailAddress = candidateEmail;
      }

      // Step 3: Save to database via Next.js API route
      const saveResponse = await fetch('/api/resume-save/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedInfo),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Failed to save resume data");
      }

      const saveData = await saveResponse.json();

      success('Resume Uploaded', `Resume uploaded and ${saveData.action} successfully! Profile completion: ${saveData.profile_completion}%`);

      // Wait for database to commit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh profile data
      await fetchProfileData();
      
      // Call the callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error: any) {
      console.error("Error uploading resume:", error);
      showError('Upload Failed', error.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Resume Section */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-[#635BFF] transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 " />
            Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload your resume (PDF) to automatically populate your profile information. 
              This will extract and save your personal details, education, experience, and skills.
            </p>
            
            <div className="flex items-center gap-4">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Button
                  type="button"
                  disabled={isUploading}
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="bg-[#635BFF] hover:bg-[#524BCC]"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose PDF File
                    </>
                  )}
                </Button>
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      {profile && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="mt-1 text-base">{profile.personal_identifiers?.fullName || profile.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="mt-1 text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.personal_identifiers?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="mt-1 text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {profile.personal_identifiers?.dateOfBirth || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="mt-1 text-base">{profile.personal_identifiers?.gender || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nationality</label>
                  <p className="mt-1 text-base">{profile.personal_identifiers?.nationality || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="mt-1 text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.location || profile.personal_identifiers?.residentialAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Profile Completion</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      {profile.profile_completion || 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          {profile.educations && profile.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.educations.map((edu: any, index: number) => (
                    <div key={edu.id || index} className="border-l-4 border-[#635BFF] pl-4 py-2">
                      <h4 className="font-semibold">{edu.level}</h4>
                      <p className="text-sm text-gray-600">{edu.fieldOfStudy || "N/A"}</p>
                      <p className="text-sm text-gray-500">{edu.institution || "N/A"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Graduated: {edu.graduationYear || "N/A"}</span>
                        {edu.cgpa_grade && <span>Grade: {edu.cgpa_grade}</span>}
                        {edu.award && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {edu.award}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experiences && profile.experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experiences.map((exp: any, index: number) => (
                    <div key={exp.id || index} className="border-l-4 border-[#635BFF] pl-4 py-2">
                      <h4 className="font-semibold">{exp.title || "N/A"}</h4>
                      <p className="text-sm text-gray-600">{exp.employer || "N/A"}</p>
                      <p className="text-xs text-gray-500">{exp.industry || "N/A"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{exp.start || "N/A"} - {exp.isCurrent ? "Present" : (exp.end || "N/A")}</span>
                        {exp.seniorityLevel && <Badge variant="outline" className="text-xs">{exp.seniorityLevel}</Badge>}
                      </div>
                      {exp.projectHighlights && (
                        <p className="mt-2 text-sm">{exp.projectHighlights}</p>
                      )}
                      {exp.achievements && (
                        <p className="mt-1 text-sm text-gray-600">
                          <strong>Achievements:</strong> {exp.achievements}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.skills.HardSkills && profile.skills.HardSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Hard Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.HardSkills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.skills.SoftSkills && profile.skills.SoftSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.SoftSkills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-green-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Language Proficiencies */}
          {profile.language_proficiencies && profile.language_proficiencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.language_proficiencies.map((lang: any, index: number) => (
                    <div key={index} className="border p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">{lang.language}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Reading: <Badge variant="outline">{lang.reading}</Badge></div>
                        <div>Writing: <Badge variant="outline">{lang.writing}</Badge></div>
                        <div>Listening: <Badge variant="outline">{lang.listening}</Badge></div>
                        <div>Speaking: <Badge variant="outline">{lang.speaking}</Badge></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!profile && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No profile data found. Upload your resume to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

