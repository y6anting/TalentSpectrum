"use client";

import React from "react";
import { Button } from "@/app/components/button";
import { FileText, Users, BotMessageSquare } from "lucide-react";

export type ViewMode = "description" | "applicants" | "matched";

interface JobViewModeButtonsProps {
  jobId: number;
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onApplicantsClick?: () => Promise<void>;
}

export default function JobViewModeButtons({
  jobId,
  currentMode,
  onModeChange,
  onApplicantsClick,
}: JobViewModeButtonsProps) {
  const handleApplicantsClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onModeChange("applicants");
    if (onApplicantsClick) {
      await onApplicantsClick();
    }
  };

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
      <Button
        size="sm"
        variant={currentMode === "description" ? "default" : "outline"}
        className={`text-xs flex-1 cursor-pointer ${
          currentMode === "description"
            ? "bg-[#635bff] hover:bg-[#524aff] text-white"
            : "bg-white border-gray-300"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onModeChange("description");
        }}
      >
        <FileText className="h-3 w-3 mr-1" />
        Description
      </Button>
      <Button
        size="sm"
        variant={currentMode === "applicants" ? "default" : "outline"}
        className={`text-xs flex-1 cursor-pointer ${
          currentMode === "applicants"
            ? "bg-[#635bff] hover:bg-[#524aff] text-white"
            : "bg-white border-gray-300"
        }`}
        onClick={handleApplicantsClick}
      >
        <Users className="h-3 w-3 mr-1" />
        Applicants
      </Button>
      <Button
        size="sm"
        variant={currentMode === "matched" ? "default" : "outline"}
        className={`text-xs flex-1 cursor-pointer ${
          currentMode === "matched"
            ? "bg-[#635bff] hover:bg-[#524aff] text-white"
            : "bg-white border-gray-300"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onModeChange("matched");
        }}
      >
        <BotMessageSquare className="h-3 w-3 mr-1" />
        AI Matched
      </Button>
    </div>
  );
}

