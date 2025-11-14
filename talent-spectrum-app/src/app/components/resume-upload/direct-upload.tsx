"use client";

import React, { useState } from "react";
import { Upload, X, FileText, Loader2, Minimize2 } from "lucide-react";
import { Button } from "@/app/components/button";
import { Card, CardContent } from "@/app/components/card";
import axios from "axios";
import { toast } from 'react-hot-toast';

interface ParsedInfo {
  status: string;
  parsed_info: string;
  candidate_id: string;
  resume_hash: string;
  file_metadata: Record<string, any>;
  message?: string;
}

interface DirectUploadProps {
  onFileUpload: (file: File, parsedInfo?: ParsedInfo) => void;
  onClose: () => void;
  isOpen: boolean;
  sessionEmail?: string; // Session email to use as fallback if resume has no email
}

const DirectUpload: React.FC<DirectUploadProps> = ({
  onFileUpload,
  onClose,
  isOpen,
  sessionEmail, // Accept session email
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<ParsedInfo | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setResumeFile(file);
    }
  };


  const handleUpload = async () => {
    if (!resumeFile) {
      alert("Please upload a file first.");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      // Build URL with session email as query parameter if available
      let url = "http://localhost:8000/resume-extractor/upload_pdf";
      if (sessionEmail) {
        url += `?session_email=${encodeURIComponent(sessionEmail)}`;
        console.log("📧 Passing session email to backend:", sessionEmail);
      }
      
      const response = await axios.post<ParsedInfo>(
        url,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status === "ok") {
        setParsedInfo(response.data);
        // Call the onFileUpload callback with both file and parsed info
        onFileUpload(resumeFile, response.data);
        
        // Close the modal after successful upload
        onClose();
        // Reset states
        setResumeFile(null);
        setIsMinimized(false);
      } else {
        toast.error("Error: " + (response.data.message || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Failed to process resume: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
  };

  if (!isOpen) return null;

  // Show minimized floating indicator when processing
  if (isMinimized && isProcessing) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="shadow-2xl border-2 border-[#635bff]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#635bff]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#3a4043]">Processing Resume</p>
                <p className="text-xs text-gray-500">{resumeFile?.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
              >
                Expand
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 bg-[#635BFF]/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#3a4043]">Upload Resume</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {!resumeFile ? (
              <div className="border-2 border-dashed border-[#635BFF]/60 bg-white/80 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <div className="space-y-2">
                  <p className="text-[#3a4043] font-semibold text-base">Upload your resume</p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="direct-resume-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit px-4 py-2 rounded-md 
                border border-[#635BFF]/60 text-[#635BFF] font-semibold 
                hover:bg-[#635BFF]/10 hover:text-[#524BCC] hover:border-[#524BCC] cursor-pointer"
                    onClick={() =>
                      document.getElementById("direct-resume-upload")?.click()
                    }
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">{resumeFile.name}</p>
                    <p className="text-xs text-green-600">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="w-auto px-6 bg-[#635bff] hover:bg-[#635bff]/90 text-white hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                  {!isProcessing && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-auto px-6 hover:cursor-pointer"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Browse Jobs While Waiting Button - Only show when processing */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparentpx-2 text-gray-500">or</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={handleMinimize}
                        variant="outline"
                        className="w-auto px-6 border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10 hover:cursor-pointer"
                      >
                        <Minimize2 className="mr-2 h-4 w-4" />
                        Browse Jobs While Waiting
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      You'll be notified when your resume is ready
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectUpload;
