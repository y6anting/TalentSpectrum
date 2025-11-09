"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ParsedInfo>(
        "http://localhost:8000/resume-extractor/upload_pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status === "ok") {
        setParsedInfo(response.data);
      } else {
        alert("Error: " + (response.data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Analyser</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`px-4 py-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Upload & Parse"}
      </button>

      {parsedInfo && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">
            Extracted Resume Information
          </h2>
          <pre className="whitespace-pre-wrap text-sm">
            {parsedInfo.parsed_info}
          </pre>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <b>Candidate ID:</b> {parsedInfo.candidate_id}
            </p>
            <p>
              <b>Resume Hash:</b> {parsedInfo.resume_hash}
            </p>
            <p>
              <b>File Metadata:</b>{" "}
              {JSON.stringify(parsedInfo.file_metadata, null, 2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}