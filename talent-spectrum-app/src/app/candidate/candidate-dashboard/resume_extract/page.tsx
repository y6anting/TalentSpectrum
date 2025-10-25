"use client";

import { useState, ChangeEvent, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import MethodSelection from "@/app/components/resume-upload/method-selection";
import ResumeUpload from "@/app/components/resume-upload/resumeUpload";

// Job type definition
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicationDeadline: string;
  logo: string;
  alt: string;
}

interface ParsedInfo {
  status: string;
  parsed_info: string;
  candidate_id: string;
  resume_hash: string;
  file_metadata: Record<string, any>;
  message?: string;
}

export default function ResumeExtract() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedInfo, setParsedInfo] = useState<ParsedInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fillMethod, setFillMethod] = useState<"resume" | "manual" | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("method-selection");
  const [clickedField, setClickedField] = useState<string | null>(null);

  // Refs for animations
  const backButtonRef = useRef<HTMLDivElement>(null);
  const selectionHeaderRef = useRef<HTMLDivElement>(null);
  const selectionCardsRef = useRef<HTMLDivElement>(null);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      // Automatically process the file when uploaded
      handleUpload(event.target.files[0]);
    }
  };

  const handleUpload = async (fileToUpload?: File) => {
    const fileToProcess = fileToUpload || file;
    if (!fileToProcess) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileToProcess);

    try {
      const response = await axios.post<ParsedInfo>(
        "http://localhost:8002/upload_pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status === "ok") {
        setParsedInfo(response.data);
        setCurrentPage("resume-upload");
      } else {
        alert("Error: " + (response.data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // // Render different components based on current page
  // const renderCurrentPage = () => {
  //   switch (currentPage) {
  //     case "method-selection":
  //       return (
  //         <MethodSelection
  //           setFillMethod={setFillMethod}
  //           backButtonRef={backButtonRef}
  //           selectionHeaderRef={selectionHeaderRef}
  //           selectionCardsRef={selectionCardsRef}
  //           setCurrentPage={setCurrentPage}
  //         />
  //       );
  //     case "resume-upload":
  //       return (
  //         <ResumeUpload
  //           resumeFile={file}
  //           handleFileUpload={handleFileUpload}
  //           clickedField={clickedField}
  //           setClickedField={setClickedField}
  //         />
  //       );
  //     case "manual-fill":
  //       return (
  //         <div className="p-6 max-w-3xl mx-auto">
  //           <Card>
  //             <CardHeader>
  //               <CardTitle>Manual Form Fill</CardTitle>
  //             </CardHeader>
  //             <CardContent>
  //               <p>Manual form filling functionality will be implemented here.</p>
  //             </CardContent>
  //           </Card>
  //         </div>
  //       );
  //     default:
  //       return (
  //         <div className="p-6 max-w-3xl mx-auto">
  //           <Card>
  //             <CardHeader>
  //               <CardTitle>Resume Analyser</CardTitle>
  //             </CardHeader>
  //             <CardContent>
  //               <p>Please select a method to continue.</p>
  //             </CardContent>
  //           </Card>
  //         </div>
  //       );
  //   }
  // };

  return (
    <div>
      {/* {renderCurrentPage()} */}
      
      {/* Show parsed information if available */}
      {parsedInfo && (
        <div className="p-6 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Resume Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                {parsedInfo.parsed_info}
              </pre>
              
              <div className="mt-4 text-sm text-gray-600">
                <p><b>Candidate ID:</b> {parsedInfo.candidate_id}</p>
                <p><b>Resume Hash:</b> {parsedInfo.resume_hash}</p>
                <p><b>File Metadata:</b> {JSON.stringify(parsedInfo.file_metadata, null, 2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}