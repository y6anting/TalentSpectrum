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
} from "@/components/ui/dialog";
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface ResumeUploadButtonProps {
  buttonText?: string;
  buttonVariant?: "default" | "outline";
  buttonClassName?: string;
  onResumeProcessed?: (parsedInfo: any) => void;
  // candidateEmail prop is removed as it will be fetched from session
}

const ResumeUploadButton: React.FC<ResumeUploadButtonProps> = ({
  buttonText = "Upload Resume",
  buttonVariant = "default",
  buttonClassName = "",
  onResumeProcessed,
  // candidateEmail is no longer destructured here
}) => {
  const { data: session, status } = useSession(); // <--- Get session data
  const [showDirectUpload, setShowDirectUpload] = useState(false);

  const handleDirectFileUpload = async (file: File, parsedInfo?: any) => {
    try {
      console.log("Processing file:", file.name);
      console.log("Raw parsedInfo:", parsedInfo);

      // --- Get user email from session ---
      const userEmail = session?.user?.email;
      if (!userEmail) {
        // If session is still loading, or user is not logged in
        if (status === 'loading') {
          alert("Session is loading. Please wait a moment and try again.");
        } else {
          alert("User not logged in or session not found. Cannot update resume.");
        }
        return; // Stop execution if no user email
      }
      // --- End user email check ---

      if (parsedInfo && parsedInfo.parsed_info) {
        let dataToSet = parsedInfo.parsed_info;

        if (typeof dataToSet === "string") {
          const jsonMatch = dataToSet.match(/```json\n([\s\S]*?)\n```/);
          let potentialJsonString = jsonMatch?.[1] || dataToSet;

          try {
            const parsedJson = JSON.parse(potentialJsonString);
            if (typeof parsedJson === "object" && parsedJson !== null) {
              dataToSet = parsedJson;
            } else {
              console.warn("parsedInfo.parsed_info was a string, parsed to non-object/null. Displaying as raw text.");
            }
          } catch (e: unknown) {
            console.warn("Invalid JSON string, displaying as raw text:", e);
          }
        }

      if (onResumeProcessed) onResumeProcessed(parsedInfo);

      // EXTRACT AND STORE RESUME EMAIL WITH FALLBACK
      try {
        // Try to get email from parsed resume, fallback to session email
        const resumeEmail = 
          (dataToSet as any)?.personal_identifiers?.emailAddress || 
          (dataToSet as any)?.candidate_email ||
          userEmail; // Fallback to session email

        console.log("Email resolved for storage:");
        console.log("   - Resume email:", (dataToSet as any)?.personal_identifiers?.emailAddress);
        console.log("   - Candidate email:", (dataToSet as any)?.candidate_email);
        console.log("   - Session email:", userEmail);
        console.log("   - Final email used:", resumeEmail);

        // NOTE: Backend now always uses login email (userEmail) as primary identifier
        // Resume email (if different) is stored in personal_identifiers.resume_email
        // No need to store resumeParsedEmail in sessionStorage - backend handles linking
        console.log("✅ Backend will use login email as primary and link resume email if different");
      } catch (e) {
        console.error("❌ Error storing resume email:", e);
      }

      try {
        // Always use login email for event dispatch - backend uses this as primary identifier
        const finalEmail = userEmail;
        
        console.log("📤 Dispatching 'resumeUploaded' event with login email:", finalEmail);
        window.dispatchEvent(
          new CustomEvent('resumeUploaded', { 
            detail: { email: finalEmail } 
          })
        );
        console.log("✅ Event dispatched successfully");
        
        // Show success message with instructions
        toast.success("Resume uploaded successfully! Your profile has been updated.", {
          duration: 5000,
          style: {
            maxWidth: '500px',
          },
        });
      } catch (e) {
        console.error("❌ Error dispatching event:", e);
        toast.error("Resume uploaded but failed to update profile. Please refresh the page.");
      }

      } else {
        alert(`Resume ${file.name} uploaded successfully!`);
      }
    } catch (error: unknown) {
      console.error("Error processing file:", error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert(`Error processing resume: ${errorMessage}`);
    }
  };

  // Optionally, disable the button or show a loading state if session is not ready
  const isButtonDisabled = status === 'loading' || !session?.user?.email;
  const buttonTooltip = status === 'loading' ? 'Loading user session...' : (!session?.user?.email ? 'Please log in to upload resume' : '');

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
        disabled={isButtonDisabled} // <--- Disable button if session not ready
        title={buttonTooltip} // <--- Add tooltip for disabled state
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
        sessionEmail={session?.user?.email} // Pass session email to backend as fallback
      />

      {/* Parsed Resume Modal - REMOVED: Now showing toast message instead */}
    </>
  );
};

export default ResumeUploadButton;

