"use client";

import React, { useState } from "react";
import { Upload, MoveRight, X } from "lucide-react";
import { Button } from "@/app/components/button";
import DirectUpload from "@/app/components/resume-upload/direct-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Shadcn UI modal components

interface ResumeUploadButtonProps {
  buttonText?: string;
  buttonVariant?: "default" | "outline";
  buttonClassName?: string;
  onResumeProcessed?: (parsedInfo: any) => void;
}

const ResumeUploadButton: React.FC<ResumeUploadButtonProps> = ({
  buttonText = "Upload Resume",
  buttonVariant = "default",
  buttonClassName = "",
  onResumeProcessed,
}) => {
  const [showDirectUpload, setShowDirectUpload] = useState(false);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  // Handle direct file upload
  const handleDirectFileUpload = async (file: File, parsedInfo?: any) => {
    try {
      console.log("Processing file:", file.name);
      console.log("Parsed info:", parsedInfo);

      if (parsedInfo && parsedInfo.parsed_info) {
        setResumeData(parsedInfo.parsed_info);
        setShowParsedModal(true); // show modal after parsing
        if (onResumeProcessed) onResumeProcessed(parsedInfo);
      } else {
        alert(`Resume ${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing resume. Please try again.");
    }
  };

  return (
    <>
      {/* Upload Button */}
      <Button
        onClick={() => setShowDirectUpload(true)}
        variant={buttonVariant}
        className={
          buttonClassName ||
          "bg-[#635bff] hover:bg-[#5748e5] text-white text-base font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200"
        }
      >
        <Upload className="mr-2 h-4 w-4" />
        {buttonText}
        {buttonText.includes("Skip") && <MoveRight className="ml-2 h-3 w-3" />}
      </Button>

      {/* Direct Upload Modal */}
      <DirectUpload
        isOpen={showDirectUpload}
        onClose={() => setShowDirectUpload(false)}
        onFileUpload={handleDirectFileUpload}
      />

      {/* Parsed Resume Modal */}
      <Dialog open={showParsedModal} onOpenChange={setShowParsedModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Resume Parsed Successfully
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowParsedModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
            </Button>
          </DialogHeader>

          <DialogDescription className="text-sm text-gray-500 mb-4">
            Below is the extracted information from your uploaded resume.
          </DialogDescription>

          {resumeData ? (
            <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto border">
              {typeof resumeData === "string" ? (
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {resumeData}
                </pre>
              ) : (
                <div className="space-y-3">
                  {resumeData.name && (
                    <p>
                      <strong>Name:</strong> {resumeData.name}
                    </p>
                  )}
                  {resumeData.email && (
                    <p>
                      <strong>Email:</strong> {resumeData.email}
                    </p>
                  )}
                  {resumeData.education && (
                    <p>
                      <strong>Education:</strong> {resumeData.education}
                    </p>
                  )}
                  {resumeData.skills && (
                    <p>
                      <strong>Skills:</strong>{" "}
                      {Array.isArray(resumeData.skills)
                        ? resumeData.skills.join(", ")
                        : resumeData.skills}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>No parsed data available.</p>
          )}

          <DialogFooter>
            <Button
              onClick={() => setShowParsedModal(false)}
              className="bg-[#635bff] hover:bg-[#5748e5] text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeUploadButton;
