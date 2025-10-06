"use client";

import React from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/card";
import { Button } from "@/app/components/button";

interface ResumeUploadProps {
  resumeFile: File | null;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clickedField: string | null;
  setClickedField: (field: string | null) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeFile,
  handleFileUpload,
  clickedField,
  setClickedField,
}) => (
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
          <p className="text-sm text-gray-600">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </p>
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
            className={`border ${
              clickedField === "resumeUpload"
                ? "border-[0.5px] border-gray-300"
                : "border border-gray-300"
            } text-[#3a4043]`}
            onClick={() =>
              document.getElementById("resume-upload")?.click()
            }
          >
            Choose File
          </Button>

          {resumeFile && (
            <div className="text-sm text-green-700 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="mb-2">✓ {resumeFile.name} uploaded successfully</p>
              <p className="text-xs text-green-600">
                Your information has been automatically filled in the form
                below. Please review and update as needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ResumeUpload;
